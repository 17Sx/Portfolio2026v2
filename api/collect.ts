import { createHash } from 'node:crypto'
import {
  FIELD_SEPARATOR,
  SCROLL_BUCKETS,
  bucketIndex,
  type CollectEvent,
  type FeedEntry,
  type SessionContext,
} from '../shared/stats-schema.js'
import { header, type ApiRequest, type ApiResponse } from './_lib/http.js'
import { hashSecret, pipeline, redisConfigured } from './_lib/redis.js'
import { RECORD_SCRIPT, keys, parisClock } from './_lib/schema.js'
import { botName, parseAgent } from './_lib/ua.js'

const MAX_LEAVE_MS = 30 * 60_000

type Json = Record<string, unknown>

function isObject(value: unknown): value is Json {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function str(value: unknown, max: number): string {
  if (typeof value !== 'string') return ''
  return value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, max)
}

function num(value: unknown, min: number, max: number): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : null
}

function path(value: unknown): string {
  const p = str(value, 100)
  return p.startsWith('/') ? p : ''
}

function parseContext(raw: unknown): SessionContext | null {
  if (!isObject(raw)) return null
  const utm = isObject(raw.utm) ? raw.utm : {}
  return {
    sw: num(raw.sw, 0, 20_000) ?? 0,
    sh: num(raw.sh, 0, 20_000) ?? 0,
    vw: num(raw.vw, 0, 20_000) ?? 0,
    vh: num(raw.vh, 0, 20_000) ?? 0,
    dpr: num(raw.dpr, 0, 10) ?? 1,
    lang: str(raw.lang, 20),
    tz: str(raw.tz, 50),
    scheme: raw.scheme === 'dark' ? 'dark' : 'light',
    theme: str(raw.theme, 10),
    siteLang: str(raw.siteLang, 5),
    cores: num(raw.cores, 0, 512),
    mem: num(raw.mem, 0, 1024),
    net: str(raw.net, 10) || null,
    touch: raw.touch === true,
    reducedMotion: raw.reducedMotion === true,
    visitor: raw.visitor === 'returning' ? 'returning' : 'new',
    gap: num(raw.gap, 0, 100_000),
    utm: { source: str(utm.source, 40), medium: str(utm.medium, 40), campaign: str(utm.campaign, 60) },
    referrer: str(raw.referrer, 300),
  }
}

export function parseEvent(body: unknown): CollectEvent | null {
  let raw: unknown = body
  if (typeof body === 'string') {
    try {
      raw = JSON.parse(body)
    } catch {
      return null
    }
  }
  if (!isObject(raw)) return null

  const sid = str(raw.sid, 32)
  const p = path(raw.path)
  if (!sid || !p) return null

  switch (raw.t) {
    case 'pv': {
      const n = num(raw.n, 1, 10_000)
      if (n === null) return null
      return {
        t: 'pv',
        sid,
        path: p,
        n: Math.round(n),
        prev: path(raw.prev) || null,
        wd: raw.wd === true,
        ctx: parseContext(raw.ctx),
      }
    }
    case 'leave':
      return { t: 'leave', sid, path: p, ms: num(raw.ms, 0, MAX_LEAVE_MS) ?? 0, scroll: num(raw.scroll, 0, 100) ?? 0 }
    case 'click': {
      const href = str(raw.href, 300)
      return href ? { t: 'click', sid, path: p, href } : null
    }
    case 'vitals':
      return {
        t: 'vitals',
        sid,
        path: p,
        ttfb: num(raw.ttfb, 0, 60_000),
        fcp: num(raw.fcp, 0, 60_000),
        lcp: num(raw.lcp, 0, 60_000),
        cls: num(raw.cls, 0, 100),
        inp: num(raw.inp, 0, 60_000),
        proto: str(raw.proto, 12) || null,
        nav: str(raw.nav, 20) || null,
      }
    default:
      return null
  }
}

const REFERRER_ALIASES: Record<string, string> = {
  't.co': 'x.com',
  'twitter.com': 'x.com',
  'lnkd.in': 'linkedin.com',
  'com.linkedin.android': 'linkedin.com',
  'l.facebook.com': 'facebook.com',
  'm.facebook.com': 'facebook.com',
  'out.reddit.com': 'reddit.com',
  'old.reddit.com': 'reddit.com',
}

export function referrerSource(referrer: string, ownHost: string): string {
  if (!referrer) return '(direct)'
  let host: string
  try {
    host = new URL(referrer).hostname.replace(/^www\./, '')
  } catch {
    return '(unknown)'
  }
  if (!host || host === ownHost.replace(/^www\./, '').split(':')[0]) return '(internal)'
  if (/^google\.[a-z.]+$/.test(host)) return 'google'
  return REFERRER_ALIASES[host] ?? host
}

export function viewportClass(width: number): string {
  if (width < 640) return 'xs <640'
  if (width < 768) return 'sm 640+'
  if (width < 1024) return 'md 768+'
  if (width < 1280) return 'lg 1024+'
  if (width < 1536) return 'xl 1280+'
  return '2xl 1536+'
}

function gapClass(days: number | null): string {
  if (days === null) return ''
  if (days < 1) return 'same day'
  if (days <= 7) return '1-7 days'
  if (days <= 30) return '8-30 days'
  return '30+ days'
}

export function outboundTarget(href: string): string {
  try {
    const url = new URL(href)
    if (url.protocol === 'mailto:') return 'mailto'
    return `${url.hostname.replace(/^www\./, '')}${url.pathname === '/' ? '' : url.pathname}`.slice(0, 120)
  } catch {
    return ''
  }
}

function decodeHeader(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') {
    res.status(405).end()
    return
  }
  if (!redisConfigured()) {
    res.status(204).end()
    return
  }

  const event = parseEvent(req.body)
  if (!event) {
    res.status(400).json({ error: 'invalid event' })
    return
  }

  const now = Date.now()
  const clock = parisClock(now)
  const ua = header(req, 'user-agent').slice(0, 400)
  const counts = new Map<string, number>()
  const add = (dim: string, value: string | number, by = 1) => {
    if (value === '' || by === 0) return
    const field = `${dim}${FIELD_SEPARATOR}${value}`
    counts.set(field, (counts.get(field) ?? 0) + by)
  }

  let visitor = ''
  let sid = event.sid
  let feed: FeedEntry | null = null

  const bot = botName(ua) ?? (event.t === 'pv' && event.wd ? 'webdriver' : null)
  if (bot) {
    if (event.t !== 'pv') {
      res.status(204).end()
      return
    }
    add('bot', bot)
    sid = ''
  } else {
    const country = header(req, 'x-vercel-ip-country').slice(0, 2).toUpperCase()
    const city = decodeHeader(header(req, 'x-vercel-ip-city')).slice(0, 60)
    const lat = Number.parseFloat(header(req, 'x-vercel-ip-latitude'))
    const lon = Number.parseFloat(header(req, 'x-vercel-ip-longitude'))
    const touch = event.t === 'pv' && event.ctx?.touch === true
    const agent = parseAgent(ua, touch)

    switch (event.t) {
      case 'pv': {
        const ip = header(req, 'x-forwarded-for').split(',')[0].trim() || header(req, 'x-real-ip')
        visitor = createHash('sha256')
          .update(`${clock.day}|${hashSecret()}|${ip}|${ua}`)
          .digest('hex')
          .slice(0, 16)

        add('k', 'pv')
        add('page', event.path)
        add('hour', clock.hour)
        add('wh', `${clock.weekday}-${clock.hour}`)
        if (event.prev && event.prev !== event.path) add('flow', `${event.prev} → ${event.path}`)
        if (event.n === 2) add('k', 'engaged')

        const ctx = event.ctx
        if (event.n === 1 && ctx) {
          add('k', 'sessions')
          if (ctx.visitor === 'new') add('k', 'new')
          add('entry', event.path)
          add('ref', referrerSource(ctx.referrer, header(req, 'host')))
          add('usrc', ctx.utm.source ?? '')
          add('umed', ctx.utm.medium ?? '')
          add('ucamp', ctx.utm.campaign ?? '')
          add('country', country)
          if (city) add('city', `${country};${city}`)
          if (Number.isFinite(lat) && Number.isFinite(lon)) add('geo', `${lat.toFixed(1)};${lon.toFixed(1)};${city}`)
          add('browser', agent.browser)
          if (agent.version) add('bver', `${agent.browser} ${agent.version}`)
          add('os', agent.os)
          add('device', agent.device)
          if (ctx.sw && ctx.sh) add('screen', `${ctx.sw}×${ctx.sh}`)
          if (ctx.vw) add('vp', viewportClass(ctx.vw))
          add('dpr', `${Math.round(ctx.dpr * 100) / 100}x`)
          add('lang', ctx.lang)
          add('tz', ctx.tz)
          add('scheme', ctx.scheme)
          add('theme', ctx.theme)
          add('slang', ctx.siteLang)
          if (ctx.cores) add('cores', ctx.cores)
          if (ctx.mem) add('mem', `${ctx.mem} GB`)
          add('net', ctx.net ?? 'n/a')
          add('touch', ctx.touch ? 'touch' : 'no touch')
          add('motion', ctx.reducedMotion ? 'reduce' : 'no-preference')
          add('visitor', ctx.visitor)
          add('gap', gapClass(ctx.gap))
        }
        feed = { ts: now, t: 'pv', path: event.path, country, city, browser: agent.browser, os: agent.os, device: agent.device }
        break
      }
      case 'leave': {
        const seconds = Math.round(event.ms / 1000)
        add('k', 'time_ms', Math.round(event.ms))
        add('k', 'leaves')
        add('ptime', event.path, seconds)
        add('pleave', event.path)
        add('time', bucketIndex('time', seconds))
        add('scroll', SCROLL_BUCKETS.findLast((b) => event.scroll >= b) ?? 0)
        break
      }
      case 'click': {
        const target = outboundTarget(event.href)
        add('out', target)
        if (target.endsWith('.pdf')) add('k', 'cv')
        feed = { ts: now, t: 'click', path: event.path, href: target, country, city, browser: agent.browser, os: agent.os, device: agent.device }
        break
      }
      case 'vitals': {
        if (event.ttfb !== null) add('v_ttfb', bucketIndex('ttfb', event.ttfb))
        if (event.fcp !== null) add('v_fcp', bucketIndex('fcp', event.fcp))
        if (event.lcp !== null) add('v_lcp', bucketIndex('lcp', event.lcp))
        if (event.cls !== null) add('v_cls', bucketIndex('cls', event.cls * 1000))
        if (event.inp !== null) add('v_inp', bucketIndex('inp', event.inp))
        add('proto', event.proto ?? '')
        add('nav', event.nav ?? '')
        break
      }
    }
  }

  const pairs = [...counts].flatMap(([field, by]) => [field, by])
  try {
    await pipeline([
      [
        'EVAL',
        RECORD_SCRIPT,
        8,
        keys.day(clock.day),
        keys.month(clock.month),
        keys.all,
        keys.uniquesDay(clock.day),
        keys.uniquesMonth(clock.month),
        keys.live,
        keys.feed,
        keys.months,
        visitor,
        now,
        sid,
        feed ? JSON.stringify(feed) : '',
        clock.month,
        ...pairs,
      ],
    ])
    res.status(204).end()
  } catch (error) {
    console.error('[collect]', error)
    res.status(502).json({ error: 'storage unavailable' })
  }
}
