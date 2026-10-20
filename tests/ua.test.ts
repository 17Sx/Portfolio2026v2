import { describe, expect, it } from 'vitest'
import { botName, parseAgent } from '../api/_lib/ua.ts'

describe('parseAgent', () => {
  it.each([
    [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
      { browser: 'Chrome', version: '141', os: 'macOS', device: 'desktop' },
    ],
    [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
      { browser: 'Safari', version: '18', os: 'iOS', device: 'mobile' },
    ],
    [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0',
      { browser: 'Edge', version: '141', os: 'Windows', device: 'desktop' },
    ],
    ['Mozilla/5.0 (X11; Linux x86_64; rv:144.0) Gecko/20100101 Firefox/144.0', { browser: 'Firefox', version: '144', os: 'Linux', device: 'desktop' }],
    [
      'Mozilla/5.0 (Linux; Android 14; SM-X710) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
      { browser: 'Chrome', version: '140', os: 'Android', device: 'tablet' },
    ],
    [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/141.0 Mobile/15E148 Safari/604.1',
      { browser: 'Chrome', version: '141', os: 'iOS', device: 'mobile' },
    ],
  ])('%s', (ua, expected) => {
    expect(parseAgent(ua, false)).toEqual(expected)
  })

  it('detects iPadOS, which reports itself as macOS, through touch support', () => {
    const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15'
    expect(parseAgent(ua, false).device).toBe('desktop')
    expect(parseAgent(ua, true).device).toBe('tablet')
  })
})

describe('botName', () => {
  it.each([
    ['Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', 'bot'],
    ['Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/141.0.0.0 Safari/537.36', 'headless'],
    ['curl/8.4.0', 'curl'],
    ['', 'empty-ua'],
    ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', null],
  ])('%s → %s', (ua, expected) => {
    expect(botName(ua)).toBe(expected)
  })
})
