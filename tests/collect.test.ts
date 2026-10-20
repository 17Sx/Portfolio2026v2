import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import handler, { outboundTarget, parseEvent, referrerSource, viewportClass } from '../api/collect.ts'
import type { ApiRequest, ApiResponse } from '../api/_lib/http.ts'
import { record, storeConfigured, type RecordInput } from '../api/_lib/store.ts'

vi.mock('../api/_lib/store.ts', () => ({
  hashSecret: () => 'secret',
  record: vi.fn(),
  storeConfigured: vi.fn(),
}))

const CHROME_MAC =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'

const ctx = {
  sw: 1512,
  sh: 982,
  vw: 1400,
  vh: 800,
  dpr: 2,
  lang: 'fr-FR',
  tz: 'Europe/Paris',
  scheme: 'dark',
  theme: 'dark',
  siteLang: 'en',
  cores: 10,
  mem: 8,
  net: '4g',
  touch: false,
  reducedMotion: false,
  visitor: 'new',
  gap: null,
  utm: { source: 'linkedin' },
  referrer: 'https://www.google.fr/',
}

describe('parseEvent', () => {
  it('accepts a JSON string pageview and keeps its session context', () => {
    const event = parseEvent(JSON.stringify({ t: 'pv', sid: 'abc', path: '/projects', n: 1, prev: null, wd: false, ctx }))
    expect(event).toMatchObject({ t: 'pv', sid: 'abc', path: '/projects', n: 1, prev: null })
    expect(event?.t === 'pv' && event.ctx?.utm.source).toBe('linkedin')
  })

  it('rejects malformed payloads', () => {
    expect(parseEvent('{nope')).toBeNull()
    expect(parseEvent({ t: 'pv', path: '/', n: 1 })).toBeNull()
    expect(parseEvent({ t: 'pv', sid: 'a', path: 'projects', n: 1 })).toBeNull()
    expect(parseEvent({ t: 'pv', sid: 'a', path: '/', n: 'one' })).toBeNull()
    expect(parseEvent({ t: 'hack', sid: 'a', path: '/' })).toBeNull()
    expect(parseEvent({ t: 'click', sid: 'a', path: '/' })).toBeNull()
  })

  it('clamps engagement time to 30 minutes and scroll to 100%', () => {
    expect(parseEvent({ t: 'leave', sid: 'a', path: '/', ms: 10 ** 9, scroll: 400 })).toEqual({
      t: 'leave',
      sid: 'a',
      path: '/',
      ms: 30 * 60_000,
      scroll: 100,
    })
  })

  it('strips control characters and truncates long values', () => {
    const event = parseEvent({ t: 'pv', sid: 'a', path: `/${'x'.repeat(500)}\u0000`, n: 1 })
    expect(event?.path).toHaveLength(100)
  })
})

describe('referrerSource', () => {
  it.each([
    ['', '(direct)'],
    ['not a url', '(unknown)'],
    ['https://17sx.me/projects', '(internal)'],
    ['https://www.google.co.uk/', 'google'],
    ['https://t.co/abc', 'x.com'],
    ['android-app://com.linkedin.android/', 'linkedin.com'],
    ['https://news.ycombinator.com/item?id=1', 'news.ycombinator.com'],
  ])('%s → %s', (referrer, expected) => {
    expect(referrerSource(referrer, 'www.17sx.me')).toBe(expected)
  })
})

describe('viewportClass and outboundTarget', () => {
  it('maps widths onto Tailwind breakpoints', () => {
    expect(viewportClass(390)).toBe('xs <640')
    expect(viewportClass(768)).toBe('md 768+')
    expect(viewportClass(1535)).toBe('xl 1280+')
    expect(viewportClass(2560)).toBe('2xl 1536+')
  })

  it('reduces links to host + path', () => {
    expect(outboundTarget('https://www.github.com/17Sx?tab=repos')).toBe('github.com/17Sx')
    expect(outboundTarget('https://altiora.pro/')).toBe('altiora.pro')
    expect(outboundTarget('mailto:hi@17sx.me')).toBe('mailto')
    expect(outboundTarget('::')).toBe('')
  })
})

type Captured = { status: number; body?: unknown }

function call(body: unknown, headers: Record<string, string> = {}) {
  const captured: Captured = { status: 200 }
  const res: ApiResponse = {
    status(code) {
      captured.status = code
      return res
    },
    setHeader: () => undefined,
    json(payload) {
      captured.body = payload
    },
    end: () => undefined,
  }
  const req: ApiRequest = { method: 'POST', headers: { 'user-agent': CHROME_MAC, host: '17sx.me', ...headers }, body, query: {} }
  return Promise.resolve(handler(req, res)).then(() => captured)
}

describe('collect handler', () => {
  const recordMock = vi.mocked(record)

  beforeEach(() => {
    vi.mocked(storeConfigured).mockReturnValue(true)
    recordMock.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  function recorded(): RecordInput {
    expect(recordMock).toHaveBeenCalledTimes(1)
    return recordMock.mock.calls[0][0]
  }

  function increments(): Record<string, number> {
    return Object.fromEntries(recorded().counts)
  }

  it('records a first pageview with its geo, agent and session dimensions', async () => {
    const result = await call(JSON.stringify({ t: 'pv', sid: 'abc', path: '/', n: 1, prev: null, wd: false, ctx }), {
      'x-vercel-ip-country': 'fr',
      'x-vercel-ip-city': 'Saint-%C3%89tienne',
      'x-vercel-ip-latitude': '45.43',
      'x-vercel-ip-longitude': '4.39',
      'x-forwarded-for': '203.0.113.7, 10.0.0.1',
    })
    expect(result.status).toBe(204)
    const fields = increments()
    expect(fields).toMatchObject({
      'k|pv': 1,
      'k|sessions': 1,
      'k|new': 1,
      'page|/': 1,
      'entry|/': 1,
      'ref|google': 1,
      'usrc|linkedin': 1,
      'country|FR': 1,
      'city|FR;Saint-Étienne': 1,
      'geo|45.4;4.4;Saint-Étienne': 1,
      'browser|Chrome': 1,
      'bver|Chrome 141': 1,
      'os|macOS': 1,
      'device|desktop': 1,
      'screen|1512×982': 1,
      'dpr|2x': 1,
    })
    expect(fields['k|engaged']).toBeUndefined()
    const input = recorded()
    expect(input.counterScopes).toEqual([expect.stringMatching(/^d:\d{4}-\d{2}-\d{2}$/), expect.stringMatching(/^m:\d{4}-\d{2}$/), 'all'])
    expect(input.visitor?.hash).toMatch(/^[0-9a-f]{16}$/)
    expect(input.visitor?.scopes).toEqual(input.counterScopes.slice(0, 2))
    expect(input.sid).toBe('abc')
    expect(input.feed).toMatchObject({ t: 'pv', path: '/', country: 'FR', city: 'Saint-Étienne', browser: 'Chrome' })
    expect(JSON.stringify(input)).not.toContain('203.0.113.7')
  })

  it('counts the second pageview of a session as engaged and records the flow', async () => {
    await call({ t: 'pv', sid: 'abc', path: '/stack', n: 2, prev: '/', wd: false, ctx: null })
    const fields = increments()
    expect(fields['k|engaged']).toBe(1)
    expect(fields['flow|/ → /stack']).toBe(1)
    expect(fields['k|sessions']).toBeUndefined()
  })

  it('files bots under bot|name only, without visitor, session or feed', async () => {
    await call({ t: 'pv', sid: 'abc', path: '/', n: 1, prev: null, wd: true, ctx })
    expect(increments()).toEqual({ 'bot|webdriver': 1 })
    expect(recorded()).toMatchObject({ visitor: null, sid: null, feed: null })
  })

  it('ignores non-pageview events from bots', async () => {
    const result = await call({ t: 'leave', sid: 'abc', path: '/', ms: 1000, scroll: 50 }, { 'user-agent': 'curl/8.4.0' })
    expect(result.status).toBe(204)
    expect(recordMock).not.toHaveBeenCalled()
  })

  it('buckets web vitals into histograms', async () => {
    await call({ t: 'vitals', sid: 'a', path: '/', ttfb: 120, fcp: 900, lcp: 2600, cls: 0.12, inp: 40, proto: 'h3', nav: 'navigate' })
    expect(increments()).toEqual({
      'v_ttfb|1': 1,
      'v_fcp|1': 1,
      'v_lcp|5': 1,
      'v_cls|4': 1,
      'v_inp|0': 1,
      'proto|h3': 1,
      'nav|navigate': 1,
    })
    expect(recorded()).toMatchObject({ visitor: null, sid: 'a', feed: null })
  })

  it('answers 400 on an invalid event and 502 when the database fails', async () => {
    expect((await call('garbage')).status).toBe(400)
    recordMock.mockRejectedValue(new Error('connection refused'))
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    expect((await call({ t: 'click', sid: 'a', path: '/', href: 'https://github.com/17Sx' })).status).toBe(502)
  })

  it('is a silent no-op when no database is configured', async () => {
    vi.mocked(storeConfigured).mockReturnValue(false)
    expect((await call({ t: 'click', sid: 'a', path: '/', href: 'https://github.com' })).status).toBe(204)
    expect(recordMock).not.toHaveBeenCalled()
  })
})
