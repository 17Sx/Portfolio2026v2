import { describe, expect, it } from 'vitest'
import { bucketIndex } from '../shared/stats-schema.ts'
import { bucketLabel, flag, formatDuration, histogramCounts, percentile, ratingSplit } from '../src/stats/format.ts'

describe('bucketIndex', () => {
  it('puts a value in the first bucket whose bound it does not exceed', () => {
    expect(bucketIndex('lcp', 0)).toBe(0)
    expect(bucketIndex('lcp', 500)).toBe(0)
    expect(bucketIndex('lcp', 501)).toBe(1)
    expect(bucketIndex('lcp', 2500)).toBe(4)
    expect(bucketIndex('lcp', 99_999)).toBe(8)
  })
})

describe('percentile', () => {
  it('interpolates inside the bucket holding the rank', () => {
    // 10 samples ≤500ms and 10 in (500, 1000]: the median sits at the 500ms edge.
    const counts = histogramCounts('lcp', { 0: 10, 1: 10 })
    expect(percentile('lcp', counts, 0.5)).toBe(500)
    expect(percentile('lcp', counts, 0.75)).toBe(750)
    expect(percentile('lcp', counts, 1)).toBe(1000)
  })

  it('returns null without samples and bounds the overflow bucket', () => {
    expect(percentile('inp', histogramCounts('inp', {}), 0.75)).toBeNull()
    expect(percentile('inp', histogramCounts('inp', { 7: 4 }), 1)).toBe(1500)
  })
})

describe('ratingSplit', () => {
  it('uses the Core Web Vitals thresholds', () => {
    // lcp buckets: ≤2500 good (0-4), ≤4000 needs improvement (5-6), beyond poor (7-8).
    const counts = histogramCounts('lcp', { 0: 3, 4: 2, 5: 1, 6: 1, 8: 4 })
    expect(ratingSplit('lcp', counts)).toEqual({ good: 5, ni: 2, poor: 4 })
  })
})

describe('labels', () => {
  it('formats durations, bucket bounds and flags', () => {
    expect(formatDuration(0)).toBe('0s')
    expect(formatDuration(83_000)).toBe('1m 23s')
    expect(formatDuration(600_000)).toBe('10m')
    expect(formatDuration(3_900_000)).toBe('1h 05m')
    expect(bucketLabel('ttfb', 0)).toBe('≤100')
    expect(bucketLabel('ttfb', 6)).toBe('≤1.8s')
    expect(bucketLabel('ttfb', 9)).toBe('>4s')
    expect(bucketLabel('cls', 3)).toBe('≤0.100')
    expect(flag('FR')).toBe('🇫🇷')
    expect(flag('??')).toBe('··')
  })
})
