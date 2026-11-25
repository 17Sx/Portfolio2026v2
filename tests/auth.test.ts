import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  checkSetupToken,
  issueChallenge,
  issueSession,
  readCookie,
  relyingParty,
  SESSION_MAX_AGE_S,
  verifyChallenge,
  verifySession,
} from '../api/_lib/auth.ts'
import { loginPolicy, nextAttempt, resetMemoryAttempts } from '../api/_lib/login-guard.ts'
import { resetMemoryPasskeys, savePasskey } from '../api/_lib/passkeys.ts'
import authHandler from '../api/stats-auth.ts'
import statsHandler from '../api/stats.ts'
import type { ApiRequest, ApiResponse } from '../api/_lib/http.ts'

const NOW = 1_800_000_000_000
const TOKEN = 'correct horse battery staple'

type Out = { status: number; headers: Record<string, string | string[]>; body: unknown }

function fakeResponse() {
  const out: Out = { status: 200, headers: {}, body: undefined }
  const res: ApiResponse = {
    status(code) {
      out.status = code
      return res
    },
    setHeader(name, value) {
      out.headers[name.toLowerCase()] = value
    },
    json(body) {
      out.body = body
    },
    end() {},
  }
  return { res, out }
}

function request(init: Partial<ApiRequest> = {}): ApiRequest {
  return { method: 'GET', headers: { host: 'stats.17sx.me' }, query: {}, ...init }
}

async function auth(step: string, body: unknown = {}, headers: Record<string, string> = {}) {
  const { res, out } = fakeResponse()
  await authHandler(request({ method: 'POST', query: { step }, body, headers: { host: 'stats.17sx.me', ...headers } }), res)
  return out
}

function cookies(out: Out): string[] {
  const value = out.headers['set-cookie']
  return value === undefined ? [] : Array.isArray(value) ? value : [value]
}

const saved = { token: process.env.STATS_SETUP_TOKEN, rp: process.env.STATS_RP_ID }

beforeEach(() => {
  process.env.STATS_SETUP_TOKEN = TOKEN
  delete process.env.STATS_RP_ID
  loginPolicy.failureDelayMs = 0
  resetMemoryAttempts()
  resetMemoryPasskeys()
})
afterEach(() => {
  if (saved.token === undefined) delete process.env.STATS_SETUP_TOKEN
  else process.env.STATS_SETUP_TOKEN = saved.token
  if (saved.rp === undefined) delete process.env.STATS_RP_ID
  else process.env.STATS_RP_ID = saved.rp
})

describe('sessions and challenges', () => {
  it('accepts only the exact setup token, and none shorter than 16 characters', () => {
    expect(checkSetupToken(TOKEN)).toBe(true)
    expect(checkSetupToken('correct horse battery')).toBe(false)
    expect(checkSetupToken('')).toBe(false)
    expect(checkSetupToken(undefined)).toBe(false)
    expect(checkSetupToken('x'.repeat(257))).toBe(false)
    process.env.STATS_SETUP_TOKEN = 'too-short'
    expect(checkSetupToken('too-short')).toBe(false)
  })

  it('verifies a fresh session until it expires', () => {
    const token = issueSession(NOW)
    expect(verifySession(token, NOW)).toBe(true)
    expect(verifySession(token, NOW + SESSION_MAX_AGE_S * 1000 - 1)).toBe(true)
    expect(verifySession(token, NOW + SESSION_MAX_AGE_S * 1000)).toBe(false)
  })

  it('rejects tampered or foreign sessions', () => {
    const [expiry, signature] = issueSession(NOW).split('.')
    expect(verifySession(`${Number(expiry) + 1000}.${signature}`, NOW)).toBe(false)
    expect(verifySession(`${expiry}.${signature.slice(0, -1)}A`, NOW)).toBe(false)
    expect(verifySession('nope', NOW)).toBe(false)
    expect(verifySession(undefined, NOW)).toBe(false)
  })

  it('logs every session out when the setup token changes', () => {
    const token = issueSession(NOW)
    process.env.STATS_SETUP_TOKEN = 'another long setup token'
    expect(verifySession(token, NOW)).toBe(false)
  })

  it('binds a challenge to its purpose and to 5 minutes', () => {
    const cookie = issueChallenge('register', 'abc', NOW)
    expect(verifyChallenge(cookie, 'register', NOW)).toBe('abc')
    expect(verifyChallenge(cookie, 'login', NOW)).toBeUndefined()
    expect(verifyChallenge(cookie, 'register', NOW + 5 * 60_000)).toBeUndefined()
    expect(verifyChallenge(cookie.replace('.abc.', '.abd.'), 'register', NOW)).toBeUndefined()
  })

  it('cannot pass a challenge off as a session', () => {
    const [expiry, , signature] = issueChallenge('login', 'abc', NOW).split('.')
    expect(verifySession(`${expiry}.${signature}`, NOW)).toBe(false)
  })

  it('reads one cookie among several', () => {
    const req = request({ headers: { cookie: 'a=1; stats_session=abc.def; b=2' } })
    expect(readCookie(req, 'stats_session')).toBe('abc.def')
    expect(readCookie(req, 'missing')).toBeUndefined()
  })

  it('binds passkeys to stats.17sx.me or localhost only', () => {
    expect(relyingParty(request())).toEqual({ rpID: 'stats.17sx.me', origin: 'https://stats.17sx.me' })
    expect(relyingParty(request({ headers: { host: 'stats.localhost:5173' } }))).toEqual({
      rpID: 'stats.localhost',
      origin: 'http://stats.localhost:5173',
    })
    expect(relyingParty(request({ headers: { host: 'evil.example' } }))).toBeNull()
    process.env.STATS_RP_ID = 'stats.example.dev'
    expect(relyingParty(request({ headers: { host: 'stats.example.dev' } }))?.rpID).toBe('stats.example.dev')
  })
})

describe('stats API', () => {
  it('answers 401 without a session and never lets the CDN cache it', async () => {
    const { res, out } = fakeResponse()
    await statsHandler(request({ query: { range: '30d' } }), res)
    expect(out.status).toBe(401)
    expect(out.headers['cache-control']).toBe('private, no-store')
  })

  it('stays locked when STATS_SETUP_TOKEN is unset', async () => {
    delete process.env.STATS_SETUP_TOKEN
    const { res, out } = fakeResponse()
    await statsHandler(request(), res)
    expect(out.status).toBe(503)
  })
})

describe('passkey routes', () => {
  it('asks for setup while no passkey is registered', async () => {
    expect((await auth('login-options')).status).toBe(409)
  })

  it('offers a login challenge in an HttpOnly cookie once a passkey exists', async () => {
    await savePasskey({ id: 'cred-1', publicKey: 'AA', counter: 0, transports: ['internal'], createdAt: NOW })
    const out = await auth('login-options')
    expect(out.status).toBe(200)
    expect(out.body).toMatchObject({ rpId: 'stats.17sx.me', userVerification: 'required' })
    expect(cookies(out)[0]).toMatch(/^stats_challenge=\d+\.[\w-]+\.[\w-]+; Path=\/api; Max-Age=300; HttpOnly; SameSite=Strict; Secure$/)
  })

  it('refuses an assertion without a matching challenge cookie', async () => {
    await savePasskey({ id: 'cred-1', publicKey: 'AA', counter: 0, transports: [], createdAt: NOW })
    const out = await auth('login-verify', { response: { id: 'cred-1' } })
    expect(out.status).toBe(401)
    expect(cookies(out)).toEqual([])
  })

  it('refuses a register challenge reused for login', async () => {
    await savePasskey({ id: 'cred-1', publicKey: 'AA', counter: 0, transports: [], createdAt: NOW })
    const register = issueChallenge('register', 'abc', Date.now())
    const out = await auth('login-verify', { response: { id: 'cred-1' } }, { cookie: `stats_challenge=${register}` })
    expect(out.status).toBe(401)
  })

  it('hands out registration options only for the right setup token', async () => {
    expect((await auth('register-options', { token: 'guess' })).status).toBe(401)
    const out = await auth('register-options', { token: TOKEN })
    expect(out.status).toBe(200)
    expect(out.body).toMatchObject({
      rp: { id: 'stats.17sx.me' },
      authenticatorSelection: { residentKey: 'required', userVerification: 'required' },
    })
    expect(cookies(out)[0]).toMatch(/^stats_challenge=/)
  })

  it('refuses to register without the challenge issued after the setup token', async () => {
    expect((await auth('register-verify', { response: { id: 'x' } })).status).toBe(401)
    const login = issueChallenge('login', 'abc', Date.now())
    expect((await auth('register-verify', { response: { id: 'x' } }, { cookie: `stats_challenge=${login}` })).status).toBe(401)
  })

  it('rejects a malformed registration response', async () => {
    const challenge = issueChallenge('register', 'abc', Date.now())
    const out = await auth('register-verify', { response: { id: 'x', response: {} } }, { cookie: `stats_challenge=${challenge}` })
    expect(out.status).toBe(400)
  })

  it('refuses calls from another site or another domain', async () => {
    expect((await auth('register-options', { token: TOKEN }, { origin: 'https://evil.example' })).status).toBe(403)
    expect((await auth('register-options', { token: TOKEN }, { host: 'evil.example' })).status).toBe(400)
  })

  it('logs out by clearing the session cookie', async () => {
    const { res, out } = fakeResponse()
    await authHandler(request({ method: 'DELETE' }), res)
    expect(out.status).toBe(204)
    expect(cookies(out)[0]).toMatch(/^stats_session=; Path=\/api; Max-Age=0/)
  })
})

describe('brute-force guard', () => {
  const guess = (ip = '203.0.113.7', token = 'guess') => auth('register-options', { token }, { 'x-forwarded-for': ip })

  it('allows max attempts per window, then locks until lockMs has passed', () => {
    const policy = { max: 3, windowMs: 1000, lockMs: 5000 }
    let row = nextAttempt(undefined, 0, policy)
    row = nextAttempt(row, 10, policy)
    row = nextAttempt(row, 20, policy)
    expect(row).toEqual({ fails: 3, windowStart: 0, lockedUntil: 0 })
    row = nextAttempt(row, 30, policy)
    expect(row.lockedUntil).toBe(5030)
    expect(nextAttempt(row, 4000, policy)).toBe(row)
    expect(nextAttempt(row, 5030, policy)).toEqual({ fails: 1, windowStart: 5030, lockedUntil: 5030 })
  })

  it('starts a fresh window once the previous one has expired', () => {
    const policy = { max: 2, windowMs: 1000, lockMs: 5000 }
    const row = nextAttempt(nextAttempt(undefined, 0, policy), 500, policy)
    expect(nextAttempt(row, 1000, policy)).toEqual({ fails: 1, windowStart: 1000, lockedUntil: 0 })
  })

  it('locks an IP after 5 wrong setup tokens, even for the right one', async () => {
    for (let i = 0; i < loginPolicy.perIp.max; i++) expect((await guess()).status).toBe(401)
    const locked = await guess('203.0.113.7', TOKEN)
    expect(locked.status).toBe(429)
    expect(Number(locked.headers['retry-after'])).toBeGreaterThan(0)
  })

  it('lets no more than 5 guesses through a parallel burst', async () => {
    const results = await Promise.all(Array.from({ length: 20 }, () => guess()))
    expect(results.filter((r) => r.status === 401)).toHaveLength(loginPolicy.perIp.max)
    expect(results.filter((r) => r.status === 429)).toHaveLength(20 - loginPolicy.perIp.max)
  })

  it('counts passkey assertions too', async () => {
    await savePasskey({ id: 'cred-1', publicKey: 'AA', counter: 0, transports: [], createdAt: NOW })
    for (let i = 0; i < loginPolicy.perIp.max; i++) await auth('login-verify', { response: { id: 'cred-1' } })
    expect((await auth('login-verify', { response: { id: 'cred-1' } })).status).toBe(429)
  })

  it("keeps other IPs out of one IP's lock", async () => {
    for (let i = 0; i <= loginPolicy.perIp.max; i++) await guess()
    expect((await guess('198.51.100.4', TOKEN)).status).toBe(200)
  })

  it('locks everyone once guesses spread over many IPs reach the global limit', async () => {
    for (let i = 0; i < loginPolicy.global.max; i++) await guess(`10.0.${Math.floor(i / 200)}.${i % 200}`)
    expect((await guess('192.0.2.1', TOKEN)).status).toBe(429)
  })
})
