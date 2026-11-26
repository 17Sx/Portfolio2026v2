export type Campaign = { source?: string; medium?: string; campaign?: string }

// Where a visit says it comes from. Besides the standard utm_* parameters, the short ?ref=fuze
// (or ?via=fuze) counts as the source, so a hand-typed link is attributed too. utm_source wins when both are set.
const SOURCE_PARAMS = ['utm_source', 'ref', 'via'] as const

export function campaignFromSearch(search: string): Campaign {
  const params = new URLSearchParams(search)
  const pick = (name: string) => params.get(name)?.trim() || undefined
  return {
    source: SOURCE_PARAMS.map(pick).find((value) => value !== undefined),
    medium: pick('utm_medium'),
    campaign: pick('utm_campaign'),
  }
}
