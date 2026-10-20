import { describe, expect, it } from 'vitest'
import { mergeFields } from '../api/stats.ts'

describe('mergeFields', () => {
  it('splits on the first separator only and sums across hashes', () => {
    const fields = mergeFields([
      { 'k|pv': 3, 'page|/': 2, 'flow|/ → /stack': 1, 'out|a.com/x|y': 1, junk: 9 },
      { 'k|pv': 4, 'page|/': 1, 'page|/stack': 3 },
    ])
    expect(fields).toEqual({
      k: { pv: 7 },
      page: { '/': 3, '/stack': 3 },
      flow: { '/ → /stack': 1 },
      out: { 'a.com/x|y': 1 },
    })
  })

  it('returns an empty object for no data', () => {
    expect(mergeFields([])).toEqual({})
  })
})
