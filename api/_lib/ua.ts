export type ParsedAgent = { browser: string; version: string; os: string; device: string }

const BOT_PATTERN =
  /(bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|embedly|curl|wget|python|go-http|axios|node-fetch|undici|phantom|puppeteer|playwright|vercel-screenshot)/i

/** Name of the matched bot signature, or null for a human-looking agent. */
export function botName(ua: string): string | null {
  if (!ua) return 'empty-ua'
  const match = ua.match(BOT_PATTERN)
  return match ? match[1].toLowerCase() : null
}

const BROWSERS: [string, RegExp][] = [
  ['Edge', /Edg(?:e|A|iOS)?\/(\d+)/],
  ['Opera', /(?:OPR|Opera)\/(\d+)/],
  ['Samsung Internet', /SamsungBrowser\/(\d+)/],
  ['Firefox', /(?:Firefox|FxiOS)\/(\d+)/],
  ['Chrome', /(?:Chrome|CriOS)\/(\d+)/],
  ['Safari', /Version\/(\d+)[\d.]* (?:Mobile\/\S+ )?Safari/],
]

const SYSTEMS: [string, RegExp][] = [
  ['iOS', /iPhone|iPad|iPod/],
  ['Android', /Android/],
  ['ChromeOS', /CrOS/],
  ['Windows', /Windows/],
  ['macOS', /Mac OS X|Macintosh/],
  ['Linux', /Linux/],
]

export function parseAgent(ua: string, touch: boolean): ParsedAgent {
  let browser = 'Other'
  let version = ''
  for (const [name, pattern] of BROWSERS) {
    const match = ua.match(pattern)
    if (match) {
      browser = name
      version = match[1]
      break
    }
  }

  const os = SYSTEMS.find(([, pattern]) => pattern.test(ua))?.[0] ?? 'Other'

  let device = 'desktop'
  if (/iPad|Tablet/.test(ua) || (/Android/.test(ua) && !/Mobile/.test(ua))) device = 'tablet'
  else if (/Mobi|iPhone|iPod/.test(ua)) device = 'mobile'
  // iPadOS identifies itself as macOS; touch support gives it away.
  else if (os === 'macOS' && touch) device = 'tablet'

  return { browser, version, os, device }
}
