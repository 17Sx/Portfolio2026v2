import { describe, expect, it } from 'vitest'
import { lastDays, lastMonths, parisClock } from '../api/_lib/schema.ts'

describe('parisClock', () => {
  it('uses Paris wall time, including across the DST switch', () => {
    // 2026-03-29 01:30 UTC is 03:30 CEST, right after clocks jump forward.
    expect(parisClock(Date.UTC(2026, 2, 29, 1, 30))).toEqual({ day: '2026-03-29', month: '2026-03', hour: 3, weekday: 6 })
    // 23:30 UTC on Dec 31 is already New Year in Paris.
    expect(parisClock(Date.UTC(2026, 11, 31, 23, 30))).toEqual({ day: '2027-01-01', month: '2027-01', hour: 0, weekday: 4 })
  })
})

describe('lastDays / lastMonths', () => {
  it('lists calendar days oldest first, crossing a month boundary', () => {
    expect(lastDays(3, Date.UTC(2026, 2, 1, 12))).toEqual(['2026-02-27', '2026-02-28', '2026-03-01'])
    expect(lastDays(1, Date.UTC(2026, 9, 20, 23, 30))).toEqual(['2026-10-21'])
  })

  it('lists months oldest first, crossing a year boundary', () => {
    expect(lastMonths(3, Date.UTC(2026, 0, 15))).toEqual(['2025-11', '2025-12', '2026-01'])
    expect(lastMonths(12, Date.UTC(2026, 9, 20))).toHaveLength(12)
  })
})
