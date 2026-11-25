import { createHash } from 'node:crypto'
import { header, type ApiRequest } from './http.js'
import {
  clearLoginAttempts,
  hashSecret,
  registerLoginAttempt,
  storeConfigured,
  type AttemptPolicy,
  type AttemptRow,
} from './store.js'

// Brute-force guard for /api/stats-auth. Every attempt is counted *before* the secret is checked, in one
// atomic upsert, so a burst of parallel requests cannot slip extra guesses past the limit.
// Two counters: one per client IP, and a global one that also catches guesses spread over many IPs.

export const loginPolicy: { perIp: AttemptPolicy; global: AttemptPolicy; failureDelayMs: number } = {
  perIp: { max: 5, windowMs: 15 * 60_000, lockMs: 15 * 60_000 },
  global: { max: 50, windowMs: 60 * 60_000, lockMs: 60 * 60_000 },
  // Slows every wrong answer down; parallel requests are what the counters are for.
  failureDelayMs: 800,
}

/** Same rules as registerLoginAttempt() in store.ts, for the in-memory fallback. */
export function nextAttempt(row: AttemptRow | undefined, now: number, policy: AttemptPolicy): AttemptRow {
  if (!row) return { fails: 1, windowStart: now, lockedUntil: policy.max < 1 ? now + policy.lockMs : 0 }
  if (row.lockedUntil > now) return row
  if (row.windowStart + policy.windowMs <= now) return { fails: 1, windowStart: now, lockedUntil: row.lockedUntil }
  const fails = row.fails + 1
  return { fails, windowStart: row.windowStart, lockedUntil: fails > policy.max ? now + policy.lockMs : row.lockedUntil }
}

// Without a database (local development, tests) the counters live in this instance's memory.
const memory = new Map<string, AttemptRow>()

export function resetMemoryAttempts() {
  memory.clear()
}

async function register(key: string, now: number, policy: AttemptPolicy): Promise<AttemptRow> {
  if (storeConfigured()) return registerLoginAttempt(key, now, policy)
  const row = nextAttempt(memory.get(key), now, policy)
  memory.set(key, row)
  return row
}

/** The IP never lands in the database as is, only salted and hashed. */
function ipKey(req: ApiRequest): string {
  const ip = header(req, 'x-forwarded-for').split(',')[0].trim() || header(req, 'x-real-ip') || 'unknown'
  return `ip:${createHash('sha256').update(`${hashSecret()}|${ip}`).digest('hex').slice(0, 32)}`
}

const GLOBAL_KEY = 'global'

export type Admission = { allowed: true; key: string } | { allowed: false; retryAfterS: number }

export async function admitLoginAttempt(req: ApiRequest, now: number): Promise<Admission> {
  const key = ipKey(req)
  for (const [k, policy] of [
    [key, loginPolicy.perIp],
    [GLOBAL_KEY, loginPolicy.global],
  ] as const) {
    const row = await register(k, now, policy)
    if (row.lockedUntil > now) return { allowed: false, retryAfterS: Math.ceil((row.lockedUntil - now) / 1000) }
  }
  return { allowed: true, key }
}

/** A correct answer (setup token or passkey) wipes that IP's counter; the global one only decays with time. */
export async function loginSucceeded(key: string): Promise<void> {
  if (storeConfigured()) await clearLoginAttempts(key)
  else memory.delete(key)
}
