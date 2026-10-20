// Redis layout. Every counter is written three times (day, month, all-time) so
// any range is answered by a handful of HGETALL instead of a scan.
export const keys = {
  day: (day: string) => `st:d:${day}`,
  month: (month: string) => `st:m:${month}`,
  all: 'st:all',
  uniquesDay: (day: string) => `st:uv:d:${day}`,
  uniquesMonth: (month: string) => `st:uv:m:${month}`,
  live: 'st:live',
  feed: 'st:feed',
  months: 'st:months',
}

export const LIVE_WINDOW_MS = 5 * 60_000
export const FEED_LENGTH = 100

// KEYS: day, month, all, uniquesDay, uniquesMonth, live, feed, months
// ARGV: visitorHash, nowMs, sid, feedJson, month, then field/increment pairs.
// Empty strings skip the matching write.
export const RECORD_SCRIPT = `
if ARGV[1] ~= '' then
  redis.call('PFADD', KEYS[4], ARGV[1])
  redis.call('PFADD', KEYS[5], ARGV[1])
end
if ARGV[3] ~= '' then
  redis.call('ZADD', KEYS[6], ARGV[2], ARGV[3])
  redis.call('ZREMRANGEBYSCORE', KEYS[6], '-inf', tonumber(ARGV[2]) - ${LIVE_WINDOW_MS * 2})
end
if ARGV[4] ~= '' then
  redis.call('LPUSH', KEYS[7], ARGV[4])
  redis.call('LTRIM', KEYS[7], 0, ${FEED_LENGTH - 1})
end
redis.call('SADD', KEYS[8], ARGV[5])
for i = 6, #ARGV, 2 do
  local n = tonumber(ARGV[i + 1])
  redis.call('HINCRBY', KEYS[1], ARGV[i], n)
  redis.call('HINCRBY', KEYS[2], ARGV[i], n)
  redis.call('HINCRBY', KEYS[3], ARGV[i], n)
end
return 1
`

export const TIME_ZONE = 'Europe/Paris'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const formatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  weekday: 'short',
  hourCycle: 'h23',
})

export type ParisClock = { day: string; month: string; hour: number; weekday: number }

export function parisClock(ts: number): ParisClock {
  const parts = Object.fromEntries(formatter.formatToParts(ts).map((p) => [p.type, p.value]))
  return {
    day: `${parts.year}-${parts.month}-${parts.day}`,
    month: `${parts.year}-${parts.month}`,
    hour: Number(parts.hour),
    weekday: WEEKDAYS.indexOf(parts.weekday),
  }
}

/** The last `count` Paris calendar days, oldest first, ending today. */
export function lastDays(count: number, ts: number): string[] {
  const [y, m, d] = parisClock(ts).day.split('-').map(Number)
  return Array.from({ length: count }, (_, i) =>
    new Date(Date.UTC(y, m - 1, d - (count - 1 - i))).toISOString().slice(0, 10),
  )
}

/** The last `count` Paris calendar months, oldest first, ending this month. */
export function lastMonths(count: number, ts: number): string[] {
  const [y, m] = parisClock(ts).month.split('-').map(Number)
  return Array.from({ length: count }, (_, i) =>
    new Date(Date.UTC(y, m - 1 - (count - 1 - i), 1)).toISOString().slice(0, 7),
  )
}
