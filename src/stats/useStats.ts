import { useEffect, useState } from 'react'
import type { LiveResponse, StatsRange, StatsResponse } from '../../shared/stats-schema.ts'

const LIVE_POLL_MS = 15_000

export type StatsState =
  | { status: 'loading'; data: StatsResponse | null }
  | { status: 'ready'; data: StatsResponse }
  | { status: 'locked'; data: null }
  | { status: 'error'; data: StatsResponse | null; message: string }

/** The API refused the request: no session cookie, or an expired one. */
class LockedError extends Error {}

async function getJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal })
  if (response.status === 401) throw new LockedError()
  if (response.status === 503) {
    const body: unknown = await response.json().catch(() => null)
    const reason = typeof body === 'object' && body !== null && 'error' in body ? body.error : null
    throw new Error(
      reason === 'auth not configured'
        ? 'The dashboard is locked: set STATS_SETUP_TOKEN (16+ characters) in the Vercel project environment.'
        : 'Storage is not configured: connect a Neon Postgres database (DATABASE_URL) to the Vercel project.',
    )
  }
  if (!response.ok) throw new Error(`The stats API answered ${response.status}.`)
  return response.json()
}

/** `session` changes after a login or logout, so the data is fetched again with the new cookie. */
export function useStats(range: StatsRange, session: number): StatsState {
  const [state, setState] = useState<StatsState>({ status: 'loading', data: null })

  useEffect(() => {
    const controller = new AbortController()
    setState((s) => ({ status: 'loading', data: s.data }))
    getJson<StatsResponse>(`/api/stats?range=${range}`, controller.signal)
      .then((data) => setState({ status: 'ready', data }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        if (error instanceof LockedError) {
          setState({ status: 'locked', data: null })
          return
        }
        const message = error instanceof Error ? error.message : 'The stats API is unreachable.'
        setState((s) => ({ status: 'error', data: s.data, message }))
      })
    return () => controller.abort()
  }, [range, session])

  const ready = state.status === 'ready'
  useEffect(() => {
    if (!ready) return
    const controller = new AbortController()
    const id = setInterval(() => {
      getJson<LiveResponse>('/api/stats?range=live', controller.signal)
        .then((live) =>
          setState((s) => (s.status === 'ready' ? { ...s, data: { ...s.data, live: live.live, feed: live.feed } } : s)),
        )
        // A missed live poll is retried on the next tick; the last snapshot stays on screen.
        .catch((error: unknown) => {
          if (error instanceof LockedError) setState({ status: 'locked', data: null })
        })
    }, LIVE_POLL_MS)
    return () => {
      clearInterval(id)
      controller.abort()
    }
  }, [ready, range])

  return state
}
