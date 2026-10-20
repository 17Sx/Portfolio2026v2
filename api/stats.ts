import {
  FIELD_SEPARATOR,
  STATS_RANGES,
  type FeedEntry,
  type LiveResponse,
  type SeriesPoint,
  type StatsRange,
  type StatsResponse,
} from '../shared/stats-schema.js'
import type { ApiRequest, ApiResponse } from './_lib/http.js'
import { lastDays, lastMonths, scopes } from './_lib/schema.js'
import { readCounters, readLive, readMonths, readUniques, storeConfigured } from './_lib/store.js'

const FEED_SIZE = 40

type Bucket = { label: string; scope: string }

function isRange(value: unknown): value is StatsRange {
  return STATS_RANGES.some((range) => range === value)
}

function isFeedEntry(value: unknown): value is FeedEntry {
  if (typeof value !== 'object' || value === null) return false
  const entry: Partial<Record<keyof FeedEntry, unknown>> = value
  return typeof entry.ts === 'number' && (entry.t === 'pv' || entry.t === 'click') && typeof entry.path === 'string'
}

/** Groups `dim|value` fields into dim → value → count, summing the given hashes. */
export function mergeFields(hashes: Record<string, number>[]): StatsResponse['fields'] {
  const fields: StatsResponse['fields'] = {}
  for (const hash of hashes) {
    for (const [field, count] of Object.entries(hash)) {
      const at = field.indexOf(FIELD_SEPARATOR)
      if (at === -1) continue
      const dim = field.slice(0, at)
      const value = field.slice(at + 1)
      const values = (fields[dim] ??= {})
      values[value] = (values[value] ?? 0) + count
    }
  }
  return fields
}

async function buckets(range: StatsRange, now: number): Promise<Bucket[]> {
  switch (range) {
    case 'today':
    case '7d':
    case '30d': {
      const count = range === 'today' ? 1 : range === '7d' ? 7 : 30
      return lastDays(count, now).map((day) => ({ label: day, scope: scopes.day(day) }))
    }
    case '12m':
      return lastMonths(12, now).map((month) => ({ label: month, scope: scopes.month(month) }))
    case 'all':
      return (await readMonths()).map((month) => ({ label: month, scope: scopes.month(month) }))
  }
}

async function live(now: number): Promise<LiveResponse> {
  const { live: count, feed } = await readLive(now, FEED_SIZE)
  return { live: count, feed: feed.filter(isFeedEntry) }
}

async function stats(range: StatsRange, now: number): Promise<StatsResponse> {
  const list = await buckets(range, now)
  const scopeList = list.map((b) => b.scope)
  const [rows, uniques, current] = await Promise.all([readCounters(scopeList), readUniques(scopeList), live(now)])

  const hashes: Record<string, Record<string, number>> = Object.fromEntries(scopeList.map((s) => [s, {}]))
  for (const row of rows) hashes[row.scope][row.field] = row.n
  const fields = mergeFields(Object.values(hashes))

  let series: SeriesPoint[]
  if (range === 'today') {
    const hours = fields.hour ?? {}
    // Hourly pageviews only: uniques are tracked per day.
    series = Array.from({ length: 24 }, (_, h) => ({ label: `${String(h).padStart(2, '0')}h`, pv: hours[h] ?? 0, uv: 0 }))
  } else {
    series = list.map((b) => ({
      label: b.label,
      pv: hashes[b.scope][`k${FIELD_SEPARATOR}pv`] ?? 0,
      uv: uniques.perScope[b.scope] ?? 0,
    }))
  }

  return { range, generatedAt: now, uniques: uniques.total, series, fields, live: current.live, feed: current.feed }
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!storeConfigured()) {
    res.setHeader('Cache-Control', 'no-store')
    res.status(503).json({ error: 'storage not configured' })
    return
  }

  const range = req.query.range
  const now = Date.now()
  try {
    if (range === 'live') {
      res.setHeader('Cache-Control', 'public, s-maxage=5, stale-while-revalidate=10')
      res.json(await live(now))
      return
    }
    const selected = isRange(range) ? range : '30d'
    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60')
    res.json(await stats(selected, now))
  } catch (error) {
    console.error('[stats]', error)
    res.setHeader('Cache-Control', 'no-store')
    res.status(502).json({ error: 'storage unavailable' })
  }
}
