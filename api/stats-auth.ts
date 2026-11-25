import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type AuthenticationResponseJSON,
  type RegistrationResponseJSON,
} from '@simplewebauthn/server'
import {
  authConfigured,
  CHALLENGE_COOKIE,
  challengeCookie,
  checkSetupToken,
  clearedChallengeCookie,
  clearedSessionCookie,
  issueChallenge,
  issueSession,
  readCookie,
  relyingParty,
  sessionCookie,
  verifyChallenge,
} from './_lib/auth.js'
import { header, type ApiRequest, type ApiResponse } from './_lib/http.js'
import { admitLoginAttempt, loginPolicy, loginSucceeded } from './_lib/login-guard.js'
import { allPasskeys, decodeKey, encodeKey, findPasskey, MAX_PASSKEYS, recordPasskeyUse, savePasskey } from './_lib/passkeys.js'

// Passkey login for the stats dashboard, one POST per WebAuthn step (?step=…), DELETE to log out:
//   login-options → login-verify          unlock with a registered passkey
//   register-options { token } → register-verify   add a passkey; needs STATS_SETUP_TOKEN
// Every step that can be guessed at (the setup token, an assertion) goes through the brute-force guard first.

// ES256 (Touch ID, iCloud Keychain, most keys), EdDSA, RS256 (Windows Hello). Pinned so registration never
// depends on experimental runtime algorithms that a newer library version may start offering.
const ALGORITHMS = [-7, -8, -257]

// One owner: every passkey belongs to the same WebAuthn user handle.
const USER_ID = new Uint8Array(new TextEncoder().encode('stats-owner'))

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/** Browsers always send Origin on POST and DELETE: refuse calls coming from another site. */
function sameOrigin(req: ApiRequest): boolean {
  const origin = header(req, 'origin')
  if (!origin) return true
  try {
    return new URL(origin).host === header(req, 'host')
  } catch {
    return false
  }
}

function fail(res: ApiResponse, status: number, error: string) {
  res.status(status).json({ error })
}

async function wrongAnswer(res: ApiResponse, error: string) {
  await new Promise((resolve) => setTimeout(resolve, loginPolicy.failureDelayMs))
  fail(res, 401, error)
}

/** Counts the attempt before anything is checked; answers 429 and returns null once the caller is locked out. */
async function admit(req: ApiRequest, res: ApiResponse, now: number) {
  const admission = await admitLoginAttempt(req, now)
  if (admission.allowed) return admission
  res.setHeader('Retry-After', String(admission.retryAfterS))
  res.status(429).json({ error: 'too many attempts', retryAfter: admission.retryAfterS })
  return null
}

function credentialResponse(req: ApiRequest): unknown {
  return isObject(req.body) ? req.body.response : undefined
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Cache-Control', 'no-store')

  if (req.method !== 'POST' && req.method !== 'DELETE') {
    res.setHeader('Allow', 'POST, DELETE')
    res.status(405).end()
    return
  }
  if (!sameOrigin(req)) return fail(res, 403, 'cross-origin request')
  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', clearedSessionCookie(req))
    res.status(204).end()
    return
  }
  if (!authConfigured()) return fail(res, 503, 'auth not configured')
  const rp = relyingParty(req)
  if (!rp) return fail(res, 400, 'unknown host')

  const now = Date.now()
  try {
    switch (req.query.step) {
      case 'login-options': {
        if ((await allPasskeys()).length === 0) return fail(res, 409, 'no passkey registered')
        // No allowCredentials: the browser offers the passkeys it holds for this domain.
        const options = await generateAuthenticationOptions({ rpID: rp.rpID, userVerification: 'required' })
        res.setHeader('Set-Cookie', challengeCookie(req, issueChallenge('login', options.challenge, now)))
        res.json(options)
        return
      }

      case 'login-verify': {
        const admission = await admit(req, res, now)
        if (!admission) return
        const challenge = verifyChallenge(readCookie(req, CHALLENGE_COOKIE), 'login', now)
        const response = credentialResponse(req)
        if (!challenge || !isObject(response) || typeof response.id !== 'string') return wrongAnswer(res, 'invalid assertion')
        const passkey = await findPasskey(response.id)
        if (!passkey) return wrongAnswer(res, 'unknown passkey')

        const result = await verifyAuthenticationResponse({
          // Shape checked by the library itself, which throws on anything malformed.
          response: response as unknown as AuthenticationResponseJSON,
          expectedChallenge: challenge,
          expectedOrigin: rp.origin,
          expectedRPID: rp.rpID,
          credential: { id: passkey.id, publicKey: decodeKey(passkey.publicKey), counter: passkey.counter, transports: passkey.transports },
          requireUserVerification: true,
        }).catch(() => null)
        if (!result?.verified) return wrongAnswer(res, 'invalid assertion')

        await recordPasskeyUse(passkey.id, result.authenticationInfo.newCounter, now)
        await loginSucceeded(admission.key)
        res.setHeader('Set-Cookie', [clearedChallengeCookie(req), sessionCookie(req, issueSession(now))])
        res.status(204).end()
        return
      }

      case 'register-options': {
        const admission = await admit(req, res, now)
        if (!admission) return
        if (!checkSetupToken(isObject(req.body) ? req.body.token : undefined)) return wrongAnswer(res, 'wrong setup token')
        await loginSucceeded(admission.key)

        const existing = await allPasskeys()
        if (existing.length >= MAX_PASSKEYS) return fail(res, 409, 'too many passkeys')
        const options = await generateRegistrationOptions({
          rpName: 'stats.17sx.me',
          rpID: rp.rpID,
          userID: USER_ID,
          userName: 'noa',
          userDisplayName: 'Noa',
          attestationType: 'none',
          excludeCredentials: existing.map((passkey) => ({ id: passkey.id, transports: passkey.transports })),
          authenticatorSelection: { residentKey: 'required', userVerification: 'required' },
          supportedAlgorithmIDs: ALGORITHMS,
        })
        // The signed challenge is the proof that the setup token was given: register-verify needs nothing else.
        res.setHeader('Set-Cookie', challengeCookie(req, issueChallenge('register', options.challenge, now)))
        res.json(options)
        return
      }

      case 'register-verify': {
        const challenge = verifyChallenge(readCookie(req, CHALLENGE_COOKIE), 'register', now)
        const response = credentialResponse(req)
        if (!challenge || !isObject(response)) return fail(res, 401, 'setup expired, enter the token again')

        const result = await verifyRegistrationResponse({
          response: response as unknown as RegistrationResponseJSON,
          expectedChallenge: challenge,
          expectedOrigin: rp.origin,
          expectedRPID: rp.rpID,
          requireUserVerification: true,
          supportedAlgorithmIDs: ALGORITHMS,
        }).catch(() => null)
        if (!result?.verified) return fail(res, 400, 'passkey could not be verified')

        const { credential } = result.registrationInfo
        if ((await allPasskeys()).length >= MAX_PASSKEYS) return fail(res, 409, 'too many passkeys')
        if (await findPasskey(credential.id)) return fail(res, 409, 'passkey already registered')
        await savePasskey({
          id: credential.id,
          publicKey: encodeKey(credential.publicKey),
          counter: credential.counter,
          transports: credential.transports ?? [],
          createdAt: now,
        })
        res.setHeader('Set-Cookie', [clearedChallengeCookie(req), sessionCookie(req, issueSession(now))])
        res.status(204).end()
        return
      }

      default:
        return fail(res, 404, 'unknown step')
    }
  } catch (error) {
    // Fails closed: if the attempt counters or the passkey table are unreachable, nobody gets in.
    console.error('[stats-auth]', error)
    return fail(res, 503, 'login unavailable')
  }
}
