import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import { header, type ApiRequest } from './http.js'
import { hashSecret } from './store.js'

// The dashboard opens with a passkey only. STATS_SETUP_TOKEN (16+ characters) is needed once per device,
// to register a passkey; it also keys every signature below, so changing it logs every session out.
// A login sets an HttpOnly cookie holding `expiry.signature`; WebAuthn challenges travel the same way.

export const SESSION_COOKIE = 'stats_session'
export const CHALLENGE_COOKIE = 'stats_challenge'
export const SESSION_MAX_AGE_S = 30 * 24 * 60 * 60
export const CHALLENGE_MAX_AGE_S = 5 * 60
export const MIN_TOKEN_LENGTH = 16
export const MAX_INPUT_LENGTH = 256
const DEFAULT_RP_ID = 'stats.17sx.me'

function setupToken(): string | undefined {
  const value = process.env.STATS_SETUP_TOKEN
  return value && value.length >= MIN_TOKEN_LENGTH ? value : undefined
}

export function authConfigured(): boolean {
  return setupToken() !== undefined
}

function sign(payload: string): string {
  const key = createHash('sha256').update(`stats-session|${setupToken() ?? ''}|${hashSecret()}`).digest('hex')
  return createHmac('sha256', key).update(payload).digest('base64url')
}

function sameText(a: string, b: string): boolean {
  const left = new TextEncoder().encode(a)
  const right = new TextEncoder().encode(b)
  return left.length === right.length && timingSafeEqual(left, right)
}

/** Constant-time comparison: both sides are hashed first so their lengths always match. */
export function checkSetupToken(input: unknown): boolean {
  const expected = setupToken()
  if (!expected || typeof input !== 'string' || input.length === 0 || input.length > MAX_INPUT_LENGTH) return false
  const digest = (value: string) => createHash('sha256').update(value).digest('hex')
  return sameText(digest(input), digest(expected))
}

export function issueSession(now: number): string {
  const expiry = String(now + SESSION_MAX_AGE_S * 1000)
  return `${expiry}.${sign(`session|${expiry}`)}`
}

export function verifySession(token: string | undefined, now: number): boolean {
  if (!authConfigured() || !token) return false
  const [expiry, signature, extra] = token.split('.')
  if (extra !== undefined || !signature || !/^\d+$/.test(expiry) || Number(expiry) <= now) return false
  return sameText(signature, sign(`session|${expiry}`))
}

export type ChallengePurpose = 'login' | 'register'

/** A WebAuthn challenge bound to its purpose and a 5 minute expiry, so it cannot be replayed elsewhere. */
export function issueChallenge(purpose: ChallengePurpose, challenge: string, now: number): string {
  const expiry = String(now + CHALLENGE_MAX_AGE_S * 1000)
  return `${expiry}.${challenge}.${sign(`challenge|${purpose}|${expiry}|${challenge}`)}`
}

export function verifyChallenge(token: string | undefined, purpose: ChallengePurpose, now: number): string | undefined {
  if (!authConfigured() || !token) return undefined
  const [expiry, challenge, signature, extra] = token.split('.')
  if (extra !== undefined || !challenge || !signature || !/^\d+$/.test(expiry) || Number(expiry) <= now) return undefined
  return sameText(signature, sign(`challenge|${purpose}|${expiry}|${challenge}`)) ? challenge : undefined
}

export function readCookie(req: ApiRequest, name: string): string | undefined {
  for (const part of header(req, 'cookie').split(';')) {
    const at = part.indexOf('=')
    if (at !== -1 && part.slice(0, at).trim() === name) return part.slice(at + 1).trim()
  }
  return undefined
}

export function isAuthorized(req: ApiRequest, now: number): boolean {
  return verifySession(readCookie(req, SESSION_COOKIE), now)
}

function isLocalHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname.endsWith('.localhost') || hostname === '127.0.0.1'
}

/** Passkeys are bound to one domain: stats.17sx.me (STATS_RP_ID overrides it), or localhost in development. */
export function relyingParty(req: ApiRequest): { rpID: string; origin: string } | null {
  const host = header(req, 'host')
  const hostname = host.split(':')[0]
  const allowed = process.env.STATS_RP_ID || DEFAULT_RP_ID
  if (hostname !== allowed && !isLocalHost(hostname)) return null
  return { rpID: hostname, origin: `${isLocalHost(hostname) ? 'http' : 'https'}://${host}` }
}

/** `Secure` everywhere but plain-http local development, where Safari would drop the cookie. */
function cookie(req: ApiRequest, name: string, value: string, maxAgeS: number): string {
  const secure = isLocalHost(header(req, 'host').split(':')[0]) ? '' : '; Secure'
  return `${name}=${value}; Path=/api; Max-Age=${maxAgeS}; HttpOnly; SameSite=Strict${secure}`
}

export function sessionCookie(req: ApiRequest, token: string): string {
  return cookie(req, SESSION_COOKIE, token, SESSION_MAX_AGE_S)
}

export function clearedSessionCookie(req: ApiRequest): string {
  return cookie(req, SESSION_COOKIE, '', 0)
}

export function challengeCookie(req: ApiRequest, token: string): string {
  return cookie(req, CHALLENGE_COOKIE, token, CHALLENGE_MAX_AGE_S)
}

export function clearedChallengeCookie(req: ApiRequest): string {
  return cookie(req, CHALLENGE_COOKIE, '', 0)
}
