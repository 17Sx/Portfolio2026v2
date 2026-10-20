// Contract shared by the tracker (src/analytics), the collector (api/collect)
// and the dashboard (src/stats). Aggregates live in Redis hashes whose fields
// are `${dim}|${value}`; only the first `|` separates them.

export const FIELD_SEPARATOR = '|'

/** Context sent with the first pageview of a session. */
export type SessionContext = {
  sw: number
  sh: number
  vw: number
  vh: number
  dpr: number
  lang: string
  tz: string
  scheme: 'dark' | 'light'
  theme: string
  siteLang: string
  cores: number | null
  mem: number | null
  net: string | null
  touch: boolean
  reducedMotion: boolean
  visitor: 'new' | 'returning'
  /** Days since the previous visit, `null` for a new visitor. */
  gap: number | null
  utm: { source?: string; medium?: string; campaign?: string }
  referrer: string
}

export type CollectEvent =
  | {
      t: 'pv'
      sid: string
      path: string
      /** 1-based index of this pageview in the session. */
      n: number
      prev: string | null
      wd: boolean
      ctx: SessionContext | null
    }
  | { t: 'leave'; sid: string; path: string; ms: number; scroll: number }
  | { t: 'click'; sid: string; path: string; href: string }
  | {
      t: 'vitals'
      sid: string
      path: string
      ttfb: number | null
      fcp: number | null
      lcp: number | null
      cls: number | null
      inp: number | null
      proto: string | null
      nav: string | null
    }

export type FeedEntry = {
  ts: number
  t: 'pv' | 'click'
  path: string
  href?: string
  country: string
  city: string
  browser: string
  os: string
  device: string
}

export type StatsRange = 'today' | '7d' | '30d' | '12m' | 'all'
export const STATS_RANGES: StatsRange[] = ['today', '7d', '30d', '12m', 'all']

export type SeriesPoint = { label: string; pv: number; uv: number }

export type StatsResponse = {
  range: StatsRange
  generatedAt: number
  uniques: number
  series: SeriesPoint[]
  /** dim → value → count, summed over the range. */
  fields: Record<string, Record<string, number>>
  live: number
  feed: FeedEntry[]
}

export type LiveResponse = { live: number; feed: FeedEntry[] }

/** Histogram upper bounds; a value lands in the first bucket whose bound it does not exceed. */
export const HISTOGRAMS = {
  ttfb: { unit: 'ms', edges: [100, 200, 400, 600, 800, 1200, 1800, 2500, 4000], good: 800, poor: 1800 },
  fcp: { unit: 'ms', edges: [500, 1000, 1500, 1800, 2500, 3000, 4000, 6000], good: 1800, poor: 3000 },
  lcp: { unit: 'ms', edges: [500, 1000, 1500, 2000, 2500, 3000, 4000, 6000], good: 2500, poor: 4000 },
  inp: { unit: 'ms', edges: [50, 100, 150, 200, 300, 500, 1000], good: 200, poor: 500 },
  // CLS is stored ×1000 so every histogram works on integers.
  cls: { unit: 'cls', edges: [10, 25, 50, 100, 150, 250, 500], good: 100, poor: 250 },
  time: { unit: 's', edges: [5, 10, 30, 60, 120, 300, 600], good: null, poor: null },
} as const

export type HistogramName = keyof typeof HISTOGRAMS

export function bucketIndex(name: HistogramName, value: number): number {
  const edges: readonly number[] = HISTOGRAMS[name].edges
  const i = edges.findIndex((edge) => value <= edge)
  return i === -1 ? edges.length : i
}

export const SCROLL_BUCKETS = [0, 25, 50, 75, 100] as const
