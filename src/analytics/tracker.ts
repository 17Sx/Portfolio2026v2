import type { CollectEvent, SessionContext } from '../../shared/stats-schema.ts'

// Cookie-free tracker: a random per-tab session id (sessionStorage) and the
// date of the previous visit (localStorage), never a persistent identifier.

const ENDPOINT = '/api/collect'
const IGNORE_KEY = 'stats-ignore'
const LAST_VISIT_KEY = 'stats-last-visit'
const SID_KEY = 'stats-sid'
const COUNT_KEY = 'stats-pv'
const DAY_MS = 86_400_000

type Page = { path: string; visibleMs: number; visibleSince: number | null; scroll: number }

let started = false
let disabled = false
let webdriver = false
let sid = ''
let currentPath: string | null = null
let page: Page | null = null
let vitalsSent = false

const vitals: { fcp: number | null; lcp: number | null; cls: number; inp: number | null } = {
  fcp: null,
  lcp: null,
  cls: 0,
  inp: null,
}

function send(event: CollectEvent) {
  const body = JSON.stringify(event)
  if (navigator.sendBeacon?.(ENDPOINT, body)) return
  fetch(ENDPOINT, { method: 'POST', body, keepalive: true }).catch(() => {})
}

function storage(kind: 'local' | 'session'): Storage | null {
  try {
    return kind === 'local' ? localStorage : sessionStorage
  } catch {
    return null
  }
}

function randomId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8))
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

function applyOptOut(): boolean {
  const local = storage('local')
  const flag = new URLSearchParams(location.search).get('notrack')
  if (flag === '1') local?.setItem(IGNORE_KEY, '1')
  if (flag === '0') local?.removeItem(IGNORE_KEY)
  return local?.getItem(IGNORE_KEY) === '1'
}

function sessionContext(): SessionContext {
  const local = storage('local')
  const last = Number(local?.getItem(LAST_VISIT_KEY)) || null
  local?.setItem(LAST_VISIT_KEY, String(Date.now()))

  const params = new URLSearchParams(location.search)
  const mem = 'deviceMemory' in navigator && typeof navigator.deviceMemory === 'number' ? navigator.deviceMemory : null
  const connection = 'connection' in navigator ? navigator.connection : null
  const net =
    typeof connection === 'object' && connection !== null && 'effectiveType' in connection
      ? String(connection.effectiveType)
      : null
  return {
    sw: screen.width,
    sh: screen.height,
    vw: innerWidth,
    vh: innerHeight,
    dpr: devicePixelRatio,
    lang: navigator.language,
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    scheme: matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
    theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
    siteLang: document.documentElement.lang,
    cores: navigator.hardwareConcurrency || null,
    mem,
    net,
    touch: navigator.maxTouchPoints > 0,
    reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    visitor: last ? 'returning' : 'new',
    gap: last ? Math.floor((Date.now() - last) / DAY_MS) : null,
    utm: {
      source: params.get('utm_source') ?? undefined,
      medium: params.get('utm_medium') ?? undefined,
      campaign: params.get('utm_campaign') ?? undefined,
    },
    referrer: document.referrer,
  }
}

function flushPage() {
  if (!page) return
  if (page.visibleSince !== null) page.visibleMs += performance.now() - page.visibleSince
  send({ t: 'leave', sid, path: page.path, ms: Math.round(page.visibleMs), scroll: Math.round(page.scroll) })
  page = null
}

function flushVitals() {
  if (vitalsSent) return
  vitalsSent = true
  const entry = performance.getEntriesByType('navigation')[0]
  const navEntry = entry instanceof PerformanceNavigationTiming ? entry : undefined
  send({
    t: 'vitals',
    sid,
    path: location.pathname,
    ttfb: navEntry ? Math.round(navEntry.responseStart) : null,
    fcp: vitals.fcp,
    lcp: vitals.lcp,
    cls: Math.round(vitals.cls * 1000) / 1000,
    inp: vitals.inp,
    proto: navEntry?.nextHopProtocol || null,
    nav: navEntry?.type ?? null,
  })
}

function observe(type: string, callback: (entries: PerformanceEntryList) => void, extra: object = {}) {
  try {
    new PerformanceObserver((list) => callback(list.getEntries())).observe({ type, buffered: true, ...extra })
  } catch {
    // Entry type unsupported by this browser (e.g. LCP on Safari < 18).
  }
}

function observeVitals() {
  observe('paint', (entries) => {
    const fcp = entries.find((e) => e.name === 'first-contentful-paint')
    if (fcp) vitals.fcp = Math.round(fcp.startTime)
  })
  observe('largest-contentful-paint', (entries) => {
    const last = entries.at(-1)
    if (last) vitals.lcp = Math.round(last.startTime)
  })

  // CLS: the largest burst of shifts (session window: <1s apart, ≤5s long).
  let windowValue = 0
  let windowStart = 0
  let windowLast = 0
  observe('layout-shift', (entries) => {
    for (const entry of entries) {
      if (!('value' in entry) || typeof entry.value !== 'number') continue
      if ('hadRecentInput' in entry && entry.hadRecentInput) continue
      if (entry.startTime - windowLast > 1000 || entry.startTime - windowStart > 5000) {
        windowValue = 0
        windowStart = entry.startTime
      }
      windowValue += entry.value
      windowLast = entry.startTime
      vitals.cls = Math.max(vitals.cls, windowValue)
    }
  })

  // INP approximated by the slowest interaction, exact below 50 interactions.
  observe(
    'event',
    (entries) => {
      for (const entry of entries) {
        if ('interactionId' in entry && entry.interactionId) vitals.inp = Math.max(vitals.inp ?? 0, Math.round(entry.duration))
      }
    },
    { durationThreshold: 16 },
  )
}

function trackScroll(event: Event) {
  if (!page) return
  const el = event.target instanceof Element ? event.target : document.documentElement
  const depth = el.scrollHeight > el.clientHeight ? ((el.scrollTop + el.clientHeight) / el.scrollHeight) * 100 : 100
  page.scroll = Math.max(page.scroll, depth)
}

function trackClick(event: MouseEvent) {
  const link = event.target instanceof Element ? event.target.closest('a[href]') : null
  if (!(link instanceof HTMLAnchorElement)) return
  const url = new URL(link.href, location.href)
  if (url.host === location.host && !url.pathname.endsWith('.pdf')) return
  send({ t: 'click', sid, path: location.pathname, href: url.href })
}

function start() {
  started = true
  disabled = applyOptOut() || location.hostname.startsWith('stats.')
  if (disabled) return
  webdriver = navigator.webdriver === true

  const session = storage('session')
  sid = session?.getItem(SID_KEY) ?? randomId()
  session?.setItem(SID_KEY, sid)
  if (webdriver) return

  observeVitals()
  document.addEventListener('scroll', trackScroll, { capture: true, passive: true })
  document.addEventListener('click', trackClick, { capture: true })
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushVitals()
      flushPage()
    } else if (page && page.visibleSince === null) {
      page.visibleSince = performance.now()
    }
  })
  addEventListener('pagehide', () => {
    flushVitals()
    flushPage()
  })
}

/** Share of the page visible without scrolling, from its tallest scroll container. */
function initialDepth(): number {
  let depth = 100
  for (const el of [document.documentElement, ...document.body.querySelectorAll('*')]) {
    const overflow = getComputedStyle(el).overflowY
    const scrollable = el === document.documentElement || overflow === 'auto' || overflow === 'scroll'
    if (scrollable && el.scrollHeight > el.clientHeight + 1) {
      depth = Math.min(depth, (el.clientHeight / el.scrollHeight) * 100)
    }
  }
  return depth
}

export function trackPageview(path: string) {
  if (!started) start()
  // React StrictMode replays effects in development: one pageview per path change.
  if (disabled || currentPath === path) return

  const previous = currentPath
  currentPath = path
  flushPage()

  const session = storage('session')
  const n = (Number(session?.getItem(COUNT_KEY)) || 0) + 1
  session?.setItem(COUNT_KEY, String(n))

  send({ t: 'pv', sid, path, n, prev: previous, wd: webdriver, ctx: n === 1 ? sessionContext() : null })
  if (webdriver) return

  const visible = document.visibilityState === 'visible'
  page = { path, visibleMs: 0, visibleSince: visible ? performance.now() : null, scroll: 0 }
  requestAnimationFrame(() => {
    if (page?.path === path) page.scroll = Math.max(page.scroll, initialDepth())
  })
}
