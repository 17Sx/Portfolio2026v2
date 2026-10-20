import { useEffect, useState } from 'react'
import type { LiveResponse, StatsRange, StatsResponse } from '../../shared/stats-schema.ts'

const LIVE_POLL_MS = 15_000

export type StatsState =
  | { status: 'loading'; data: StatsResponse | null }
  | { status: 'ready'; data: StatsResponse }
  | { status: 'error'; data: StatsResponse | null; message: string }

async function getJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal })
  if (response.status === 503) {
    throw new Error('Storage is not configured: set KV_REST_API_URL and KV_REST_API_TOKEN on the server.')
  }
  if (!response.ok) throw new Error(`The stats API answered ${response.status}.`)
  return response.json()
}

export function useStats(range: StatsRange): StatsState {
  const [state, setState] = useState<StatsState>({ status: 'loading', data: null })

  useEffect(() => {
    const controller = new AbortController()
    setState((s) => ({ status: 'loading', data: s.data }))
    getJson<StatsResponse>(`/api/stats?range=${range}`, controller.signal)
      .then((data) => setState({ status: 'ready', data }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        const message = error instanceof Error ? error.message : 'The stats API is unreachable.'
        setState((s) => ({ status: 'error', data: s.data, message }))
      })
    return () => controller.abort()
  }, [range])

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
        .catch(() => {})
    }, LIVE_POLL_MS)
    return () => {
      clearInterval(id)
      controller.abort()
    }
  }, [ready, range])

  return state
}
