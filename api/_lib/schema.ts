// Counter scopes. Every counter is written three times (day, month, all-time)
// so any range is answered by reading a handful of scopes instead of a scan.
export const scopes = {
  day: (day: string) => `d:${day}`,
  month: (month: string) => `m:${month}`,
  all: 'all',
}

export const LIVE_WINDOW_MS = 5 * 60_000
export const FEED_LENGTH = 100

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
