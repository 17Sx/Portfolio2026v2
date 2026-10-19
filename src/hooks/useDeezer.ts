import { useEffect, useState } from 'react'

export type DeezerMusic = {
  profileUrl: string
  artists: { id: number; name: string; link: string; picture: string }[]
  moreCount: number
  onRepeat: { id: number; title: string; artist: string } | null
}

export type DeezerState =
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'ready'; music: DeezerMusic }

export function useDeezer() {
  const [state, setState] = useState<DeezerState>({ status: 'loading' })
  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/deezer', { signal: controller.signal })
      .then((r) => r.json())
      .then((d: { music?: DeezerMusic | null }) => {
        setState(d.music ? { status: 'ready', music: d.music } : { status: 'empty' })
      })
      .catch(() => {
        if (!controller.signal.aborted) setState({ status: 'empty' })
      })
    return () => controller.abort()
  }, [])
  return state
}
