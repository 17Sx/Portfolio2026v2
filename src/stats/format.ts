import { HISTOGRAMS, type HistogramName } from '../../shared/stats-schema.ts'

const integer = new Intl.NumberFormat('en')
const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })
const regions = new Intl.DisplayNames(['en'], { type: 'region' })

export function formatNumber(n: number): string {
  return n >= 100_000 ? compact.format(n) : integer.format(Math.round(n))
}

export function formatPercent(ratio: number): string {
  if (!Number.isFinite(ratio)) return '–'
  return `${(ratio * 100).toFixed(ratio > 0 && ratio < 0.1 ? 1 : 0)}%`
}

export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return '0s'
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return s % 60 === 0 ? `${m}m` : `${m}m ${String(s % 60).padStart(2, '0')}s`
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`
}

export function formatMetric(name: HistogramName, value: number): string {
  const unit = HISTOGRAMS[name].unit
  if (unit === 'cls') return (value / 1000).toFixed(3)
  if (unit === 's') return formatDuration(value * 1000)
  return value >= 1000 ? `${(value / 1000).toFixed(2)}s` : `${Math.round(value)}ms`
}

export function countryName(code: string): string {
  if (!/^[A-Z]{2}$/.test(code)) return 'Unknown'
  try {
    return regions.of(code) ?? code
  } catch {
    return code
  }
}

/** Regional-indicator emoji for an ISO 3166 alpha-2 code. */
export function flag(code: string): string {
  if (!/^[A-Z]{2}$/.test(code)) return '··'
  return String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65))
}

export function timeAgo(ts: number, now: number): string {
  const s = Math.max(0, Math.round((now - ts) / 1000))
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86_400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86_400)}d ago`
}

export function sorted(values: Record<string, number> | undefined): [string, number][] {
  return Object.entries(values ?? {})
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
}

export function sum(values: Record<string, number> | undefined): number {
  return Object.values(values ?? {}).reduce((total, n) => total + n, 0)
}

/** Bucket counts (index → count) as a dense array, overflow bucket included. */
export function histogramCounts(name: HistogramName, buckets: Record<string, number> | undefined): number[] {
  return Array.from({ length: HISTOGRAMS[name].edges.length + 1 }, (_, i) => buckets?.[i] ?? 0)
}

/** Percentile estimated by linear interpolation inside the histogram bucket that holds it. */
export function percentile(name: HistogramName, counts: number[], p: number): number | null {
  const edges: readonly number[] = HISTOGRAMS[name].edges
  const total = counts.reduce((a, b) => a + b, 0)
  if (total === 0) return null
  const target = total * p
  let seen = 0
  for (let i = 0; i < counts.length; i++) {
    if (counts[i] === 0) continue
    if (seen + counts[i] >= target) {
      const low = i === 0 ? 0 : edges[i - 1]
      const high = i < edges.length ? edges[i] : edges[edges.length - 1] * 1.5
      return low + ((target - seen) / counts[i]) * (high - low)
    }
    seen += counts[i]
  }
  return edges[edges.length - 1]
}

/** Human label of histogram bucket `i`, e.g. "≤200" (ms) or ">4s". */
export function bucketLabel(name: HistogramName, i: number): string {
  const edges: readonly number[] = HISTOGRAMS[name].edges
  const short = (v: number) => {
    if (HISTOGRAMS[name].unit !== 'ms') return formatMetric(name, v)
    return v >= 1000 ? `${Number((v / 1000).toFixed(1))}s` : String(v)
  }
  return i < edges.length ? `≤${short(edges[i])}` : `>${short(edges[edges.length - 1])}`
}

/** good / needs-improvement / poor split, using the Core Web Vitals thresholds. */
export function ratingSplit(name: HistogramName, counts: number[]) {
  const { edges, good, poor } = HISTOGRAMS[name]
  const split = { good: 0, ni: 0, poor: 0 }
  if (good === null || poor === null) return split
  counts.forEach((count, i) => {
    const upper = i < edges.length ? edges[i] : Infinity
    if (upper <= good) split.good += count
    else if (upper <= poor) split.ni += count
    else split.poor += count
  })
  return split
}
