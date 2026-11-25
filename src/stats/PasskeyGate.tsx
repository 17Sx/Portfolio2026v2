import { browserSupportsWebAuthn, startAuthentication, startRegistration } from '@simplewebauthn/browser'
import { useState, type FormEvent } from 'react'

// Shown while /api/stats answers 401. Unlocking runs a WebAuthn ceremony against /api/stats-auth,
// which sets the HttpOnly session cookie. Adding a passkey needs the setup token (STATS_SETUP_TOKEN).

class AuthError extends Error {}

async function post(step: string, body: unknown = {}): Promise<Response> {
  return fetch(`/api/stats-auth?step=${step}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

async function messageFor(response: Response): Promise<string> {
  const body: unknown = await response.json().catch(() => null)
  const error = typeof body === 'object' && body !== null && 'error' in body ? String(body.error) : ''
  switch (response.status) {
    case 401:
      return error === 'wrong setup token' ? 'Wrong setup token.' : 'This passkey was not accepted.'
    case 409:
      return error === 'no passkey registered' ? 'No passkey yet: set one up below.' : 'This passkey is already registered.'
    case 429: {
      const minutes = Math.max(1, Math.ceil(Number(response.headers.get('Retry-After') ?? 60) / 60))
      return `Too many attempts. Try again in ${minutes} min.`
    }
    case 503:
      return error === 'auth not configured'
        ? 'STATS_SETUP_TOKEN (16+ characters) is not set on the server.'
        : 'Login is unavailable right now (database unreachable).'
    default:
      return `The auth API answered ${response.status}.`
  }
}

async function expectOk(response: Response): Promise<Response> {
  if (!response.ok) throw new AuthError(await messageFor(response))
  return response
}

function describe(error: unknown): string {
  if (error instanceof AuthError) return error.message
  // The browser rejects with NotAllowedError when the prompt is dismissed or times out.
  if (error instanceof Error && error.name === 'NotAllowedError') return 'Cancelled.'
  if (error instanceof Error && error.name === 'InvalidStateError') return 'This device already has a passkey here.'
  return 'Something went wrong with the passkey prompt.'
}

const button =
  'rounded-md bg-zinc-900 px-3 py-2 font-mono text-xs tracking-widest text-white uppercase transition hover:bg-zinc-700 active:translate-y-px disabled:opacity-40 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-300'

export function PasskeyGate({ onSuccess }: { onSuccess: () => void }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [setup, setSetup] = useState(false)
  const [token, setToken] = useState('')
  const supported = browserSupportsWebAuthn()

  async function run(task: () => Promise<void>) {
    setPending(true)
    setError(null)
    try {
      await task()
      onSuccess()
    } catch (err) {
      setError(describe(err))
      if (err instanceof AuthError && err.message.startsWith('No passkey yet')) setSetup(true)
    } finally {
      setPending(false)
    }
  }

  const unlock = () =>
    run(async () => {
      const options = await (await expectOk(await post('login-options'))).json()
      const response = await startAuthentication({ optionsJSON: options })
      await expectOk(await post('login-verify', { response }))
    })

  const register = (event: FormEvent) => {
    event.preventDefault()
    return run(async () => {
      const options = await (await expectOk(await post('register-options', { token }))).json()
      const response = await startRegistration({ optionsJSON: options })
      await expectOk(await post('register-verify', { response }))
      setToken('')
    })
  }

  if (!supported) {
    return (
      <p className="mx-auto mt-16 max-w-xs font-mono text-xs text-zinc-500">
        This browser does not support passkeys. Open the dashboard in an up-to-date browser.
      </p>
    )
  }

  return (
    <div className="mx-auto mt-16 flex w-full max-w-xs flex-col gap-3">
      <p className="font-mono text-xs tracking-widest text-zinc-500 uppercase">Locked</p>
      <button type="button" onClick={unlock} disabled={pending} className={button}>
        {pending && !setup ? 'Waiting for passkey…' : 'Unlock with passkey'}
      </button>

      {setup ? (
        <form onSubmit={register} className="mt-4 flex flex-col gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Register this device with the setup token (STATS_SETUP_TOKEN).
          </p>
          <input
            type="password"
            name="setup-token"
            autoComplete="off"
            required
            maxLength={256}
            value={token}
            onChange={(event) => setToken(event.target.value)}
            aria-label="Setup token"
            className="rounded-md border border-zinc-200 bg-white px-3 py-2 font-mono text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-600"
          />
          <button type="submit" disabled={pending || token.length === 0} className={button}>
            {pending ? 'Waiting for passkey…' : 'Create passkey'}
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setSetup(true)}
          className="self-start font-mono text-[11px] text-zinc-500 underline decoration-zinc-300 underline-offset-4 hover:text-zinc-900 dark:decoration-zinc-700 dark:hover:text-zinc-100"
        >
          Set up a passkey on this device
        </button>
      )}

      {error ? (
        <p role="alert" className="font-mono text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  )
}
