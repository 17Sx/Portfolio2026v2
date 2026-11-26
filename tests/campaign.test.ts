import { describe, expect, it } from 'vitest'
import { campaignFromSearch } from '../shared/campaign.ts'

describe('campaignFromSearch', () => {
  it('reads the short ?ref= link as the source', () => {
    expect(campaignFromSearch('?ref=fuze')).toEqual({ source: 'fuze', medium: undefined, campaign: undefined })
  })

  it('accepts ?via= too', () => {
    expect(campaignFromSearch('?via=discord').source).toBe('discord')
  })

  it('keeps the utm_* parameters, utm_source first', () => {
    expect(campaignFromSearch('?ref=fuze&utm_source=linkedin&utm_medium=post&utm_campaign=alternance')).toEqual({
      source: 'linkedin',
      medium: 'post',
      campaign: 'alternance',
    })
  })

  it('ignores empty values and pages without a tag', () => {
    expect(campaignFromSearch('?ref=&via=%20').source).toBeUndefined()
    expect(campaignFromSearch('')).toEqual({ source: undefined, medium: undefined, campaign: undefined })
  })
})
