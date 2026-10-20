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
import { pipeline, redisConfigured } from './_lib/redis.js'
import { LIVE_WINDOW_MS, keys, lastDays, lastMonths } from './_lib/schema.js'

const FEED_SIZE = 40

type Bucket = { label: string; hash: string; uniques: string }

function isRange(value: unknown): value is StatsRange {
  return STATS_RANGES.some((range) => range === value)
}

function toHash(raw: unknown): Record<string, number> {
  const out: Record<string, number> = {}
  if (Array.isArray(raw)) {
    // Redis REST returns HGETALL as a flat [field, value, field, value] array.
    for (let i = 0; i + 1 < raw.length; i += 2) out[String(raw[i])] = Number(raw[i + 1]) || 0
  }
  return out
}

function isFeedEntry(value: unknown): value is FeedEntry {
  if (typeof value !== 'object' || value === null) return false
  const entry: Partial<Record<keyof FeedEntry, unknown>> = value
  return typeof entry.ts === 'number' && (entry.t === 'pv' || entry.t === 'click') && typeof entry.path === 'string'
}

function parseFeed(raw: unknown): FeedEntry[] {
  if (!Array.isArray(raw)) return []
  return raw.flatMap((item) => {
    try {
      const entry: unknown = JSON.parse(String(item))
      return isFeedEntry(entry) ? [entry] : []
    } catch {
      return []
    }
  })
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
      return lastDays(count, now).map((day) => ({ label: day, hash: keys.day(day), uniques: keys.uniquesDay(day) }))
    }
    case '12m':
      return lastMonths(12, now).map((month) => ({ label: month, hash: keys.month(month), uniques: keys.uniquesMonth(month) }))
    case 'all': {
      const [months] = await pipeline([['SMEMBERS', keys.months]])
      const sorted = (Array.isArray(months) ? months.map(String) : []).sort()
      return sorted.map((month) => ({ label: month, hash: keys.month(month), uniques: keys.uniquesMonth(month) }))
    }
  }
}

function liveCommands(now: number) {
  return [
    ['ZCOUNT', keys.live, now - LIVE_WINDOW_MS, '+inf'],
    ['LRANGE', keys.feed, 0, FEED_SIZE - 1],
  ]
}

function parseLive([count, feed]: unknown[]): LiveResponse {
  return { live: Number(count) || 0, feed: parseFeed(feed) }
}

async function stats(range: StatsRange, now: number): Promise<StatsResponse> {
  const list = await buckets(range, now)
  const results = await pipeline([
    ...list.map((b) => ['HGETALL', b.hash]),
    ...list.map((b) => ['PFCOUNT', b.uniques]),
    ['PFCOUNT', ...(list.length > 0 ? list.map((b) => b.uniques) : [keys.uniquesDay('none')])],
    ...liveCommands(now),
  ])
  const hashes = list.map((_, i) => toHash(results[i]))
  const fields = mergeFields(hashes)

  let series: SeriesPoint[]
  if (range === 'today') {
    const hours = fields.hour ?? {}
    // Hourly pageviews only: uniques are tracked per day.
    series = Array.from({ length: 24 }, (_, h) => ({ label: `${String(h).padStart(2, '0')}h`, pv: hours[h] ?? 0, uv: 0 }))
  } else {
    series = list.map((b, i) => ({
      label: b.label,
      pv: hashes[i][`k${FIELD_SEPARATOR}pv`] ?? 0,
      uv: Number(results[list.length + i]) || 0,
    }))
  }

  const { live: liveCount, feed } = parseLive(results.slice(list.length * 2 + 1))
  return {
    range,
    generatedAt: now,
    uniques: Number(results[list.length * 2]) || 0,
    series,
    fields,
    live: liveCount,
    feed,
  }
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!redisConfigured()) {
    res.setHeader('Cache-Control', 'no-store')
    res.status(503).json({ error: 'storage not configured' })
    return
  }

  const range = req.query.range
  const now = Date.now()
  try {
    if (range === 'live') {
      res.setHeader('Cache-Control', 'public, s-maxage=5, stale-while-revalidate=10')
      res.json(parseLive(await pipeline(liveCommands(now))))
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
