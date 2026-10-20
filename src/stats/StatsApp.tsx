import { useEffect, useState } from 'react'
import { STATS_RANGES, type StatsRange, type StatsResponse } from '../../shared/stats-schema.ts'
import { ArrowLeftIcon, MoonIcon, SunIcon } from '../components/icons.tsx'
import { useTheme } from '../hooks/useTheme.ts'
import { Histogram, PunchCard, TrafficChart, WorldMap } from './charts.tsx'
import { countryName, flag, formatDuration, formatNumber, formatPercent, histogramCounts, sorted, sum } from './format.ts'
import { BarList, Empty, Kpi, LiveFeed, Panel, SplitBar, VitalCard } from './panels.tsx'
import { useStats } from './useStats.ts'

const RANGE_LABELS: Record<StatsRange, string> = { today: 'Today', '7d': '7 days', '30d': '30 days', '12m': '12 months', all: 'All time' }

function rows(values: Record<string, number> | undefined, label: (key: string) => string = (k) => k) {
  return sorted(values).map(([key, value]) => ({ key, label: label(key), value }))
}

function useNow(intervalMs: number) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

function Dashboard({ data, range }: { data: StatsResponse; range: StatsRange }) {
  const now = useNow(5000)
  const f = data.fields
  const k = f.k ?? {}
  const pv = k.pv ?? 0
  const sessions = k.sessions ?? 0
  const pages = sorted(f.page).map(([path, n]) => {
    const leaves = f.pleave?.[path] ?? 0
    return { key: path, label: path, value: n, extra: leaves ? formatDuration(((f.ptime?.[path] ?? 0) * 1000) / leaves) : undefined }
  })
  const bots = sum(f.bot)

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
        <Kpi label="Pageviews" value={formatNumber(pv)} sub={`${formatNumber(bots)} bot hits filtered`} />
        <Kpi label="Visitors" value={formatNumber(data.uniques)} sub="distinct daily salted hashes" />
        <Kpi label="Sessions" value={formatNumber(sessions)} sub={`${formatPercent((k.new ?? 0) / sessions)} first visits`} />
        <Kpi label="Bounce rate" value={formatPercent(1 - (k.engaged ?? 0) / sessions)} sub="sessions with a single page" />
        <Kpi label="Pages / session" value={sessions ? (pv / sessions).toFixed(2) : '–'} />
        <Kpi label="Engaged time" value={formatDuration((k.time_ms ?? 0) / (k.leaves || 1))} sub="visible time per page, avg" />
        <Kpi label="CV downloads" value={formatNumber(k.cv ?? 0)} sub="clicks on a .pdf" />
        <Kpi label="Online now" value={formatNumber(data.live)} sub="active in the last 5 minutes" />
      </div>

      <Panel
        title="Traffic"
        hint={range === 'today' ? 'pageviews per hour, Paris time' : 'visitors are unique per day, summed per bucket'}
      >
        {pv === 0 ? <Empty>No pageview recorded in this range yet. Visit the portfolio to see the first bar.</Empty> : <TrafficChart series={data.series} range={range} />}
      </Panel>

      <div className="grid gap-x-10 gap-y-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel title="Where they browse from" hint="one dot per city, from Vercel edge geo-IP">
          <WorldMap geo={f.geo} />
        </Panel>
        <Panel title="Countries">
          <BarList rows={rows(f.country, (c) => `${flag(c)}  ${countryName(c)}`)} limit={10} />
        </Panel>
      </div>

      <div className="grid gap-x-10 gap-y-10 md:grid-cols-3">
        <Panel title="Cities">
          <BarList
            rows={sorted(f.city).map(([key, value]) => {
              const [country, city] = key.split(';')
              return { key, label: `${flag(country)}  ${city}`, value }
            })}
          />
        </Panel>
        <Panel title="Time zones">
          <BarList rows={rows(f.tz)} />
        </Panel>
        <Panel title="Languages" hint="navigator.language">
          <BarList rows={rows(f.lang)} />
        </Panel>
      </div>

      <div className="grid gap-x-10 gap-y-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel title="Punch card" hint="weekday × hour, Paris time">
          <PunchCard cells={f.wh} />
        </Panel>
        <Panel title="Engagement">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">Time on page</p>
              <Histogram name="time" counts={histogramCounts('time', f.time)} />
            </div>
            <div className="flex flex-col gap-2">
              <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">Max scroll depth</p>
              <BarList rows={sorted(f.scroll).map(([depth, value]) => ({ key: depth, label: `≥ ${depth}%`, value }))} />
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-x-10 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
        <Panel title="Referrers">
          <BarList rows={rows(f.ref)} />
        </Panel>
        <Panel title="Pages" hint="views · avg visible time">
          <BarList rows={pages} />
        </Panel>
        <Panel title="Entry pages">
          <BarList rows={rows(f.entry)} />
        </Panel>
        <Panel title="Navigation flows" hint="in-session path A → B">
          <BarList rows={rows(f.flow)} />
        </Panel>
        <Panel title="Outbound clicks">
          <BarList rows={rows(f.out)} />
        </Panel>
        <Panel title="UTM campaigns" hint="utm_source / utm_medium / utm_campaign">
          {sum(f.usrc) + sum(f.ucamp) === 0 ? (
            <Empty>No tagged link yet. Share 17sx.me/?utm_source=linkedin to see it here.</Empty>
          ) : (
            <BarList
              rows={[
                ...rows(f.usrc, (v) => `source: ${v}`),
                ...rows(f.umed, (v) => `medium: ${v}`),
                ...rows(f.ucamp, (v) => `campaign: ${v}`),
              ].map((r) => ({ ...r, key: r.label }))}
            />
          )}
        </Panel>
      </div>

      <Panel title="Core web vitals" hint="field data from real visitors · bucketed histograms, interpolated percentiles">
        <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          <VitalCard name="lcp" buckets={f.v_lcp} />
          <VitalCard name="inp" buckets={f.v_inp} />
          <VitalCard name="cls" buckets={f.v_cls} />
          <VitalCard name="fcp" buckets={f.v_fcp} />
          <VitalCard name="ttfb" buckets={f.v_ttfb} />
          <div className="flex flex-col gap-5 border-t border-zinc-200 dark:border-zinc-800 pt-3">
            <SplitBar label="Protocol (nextHopProtocol)" entries={sorted(f.proto)} />
            <SplitBar label="Navigation type" entries={sorted(f.nav)} />
          </div>
        </div>
      </Panel>

      <div className="grid gap-x-10 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
        <Panel title="Browsers">
          <BarList rows={rows(f.browser)} />
        </Panel>
        <Panel title="Browser versions">
          <BarList rows={rows(f.bver)} />
        </Panel>
        <Panel title="Operating systems">
          <BarList rows={rows(f.os)} />
        </Panel>
        <Panel title="Screen resolutions" hint="CSS pixels">
          <BarList rows={rows(f.screen)} />
        </Panel>
        <Panel title="Viewport breakpoints" hint="Tailwind classes">
          <BarList rows={rows(f.vp)} />
        </Panel>
        <Panel title="CPU cores" hint="hardwareConcurrency">
          <BarList rows={sorted(f.cores).map(([c, value]) => ({ key: c, label: `${c} threads`, value }))} />
        </Panel>
      </div>

      <Panel title="Hardware & preferences">
        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          <SplitBar label="Device" entries={sorted(f.device)} />
          <SplitBar label="Pixel ratio" entries={sorted(f.dpr)} />
          <SplitBar label="Device memory" entries={sorted(f.mem)} />
          <SplitBar label="Network (effectiveType)" entries={sorted(f.net)} />
          <SplitBar label="Pointer" entries={sorted(f.touch)} />
          <SplitBar label="OS color scheme" entries={sorted(f.scheme)} />
          <SplitBar label="Theme on the site" entries={sorted(f.theme)} />
          <SplitBar label="Site language" entries={sorted(f.slang)} />
          <SplitBar label="Reduced motion" entries={sorted(f.motion)} />
          <SplitBar label="Visitors" entries={sorted(f.visitor)} />
          <SplitBar label="Back after" entries={sorted(f.gap)} />
          <SplitBar label="Bots filtered" entries={sorted(f.bot)} />
        </div>
      </Panel>

      <Panel title="Live log" hint="last 40 hits · refreshed every 15s">
        <LiveFeed entries={data.feed} now={now} />
      </Panel>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="flex flex-col gap-10" aria-busy>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="h-20 border-t border-zinc-200 dark:border-zinc-800 bg-black/[0.03] dark:bg-white/[0.04] motion-safe:animate-pulse" />
        ))}
      </div>
      <div className="h-56 border-t border-zinc-200 dark:border-zinc-800 bg-black/[0.03] dark:bg-white/[0.04] motion-safe:animate-pulse" />
    </div>
  )
}

export default function StatsApp() {
  const [range, setRange] = useState<StatsRange>('30d')
  const state = useStats(range)
  const { theme, toggle } = useTheme()

  useEffect(() => {
    document.title = 'stats · 17sx.me'
  }, [])

  return (
    <div className="min-h-dvh bg-white text-zinc-900 antialiased dark:bg-black dark:text-zinc-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-6 sm:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <a
              href="https://17sx.me"
              aria-label="Back to 17sx.me"
              className="group flex size-8 shrink-0 items-center justify-center rounded-md border border-zinc-200/50 bg-zinc-100 text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-900 dark:border-zinc-800/50 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              <ArrowLeftIcon className="size-4 transition-transform group-hover:-translate-x-0.5" />
            </a>
            <div className="min-w-0">
              <h1 className="text-[22px] leading-none font-bold tracking-tight text-zinc-900 [text-shadow:-1.5px_0_0_rgba(0,200,255,0.35),1.5px_0_0_rgba(255,80,0,0.35)] sm:text-[24px] dark:text-zinc-50 dark:[text-shadow:-1.5px_0_0_rgba(0,200,255,0.65),1.5px_0_0_rgba(255,80,0,0.65)]">
                stats.17sx.me
              </h1>
              <p className="mt-1 flex items-center gap-2 font-mono text-[11px] tracking-[0.16em] text-zinc-500 uppercase">
                <span className="relative inline-flex size-2">
                  <span className="absolute inline-flex size-full rounded-full bg-zinc-400 motion-safe:animate-ping" />
                  <span className="relative inline-flex size-2 rounded-full bg-zinc-900 dark:bg-zinc-100" />
                </span>
                {state.data ? `${state.data.live} online` : '…'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={toggle}
            aria-label="Toggle theme"
            aria-pressed={theme === 'dark'}
            className="flex size-7 items-center justify-center text-zinc-500 transition hover:text-zinc-900 dark:hover:text-zinc-200"
          >
            {theme === 'dark' ? <SunIcon className="size-[18px]" /> : <MoonIcon className="size-[18px]" />}
          </button>
        </header>

        <nav aria-label="Range" className="flex flex-wrap gap-x-1 gap-y-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
          {STATS_RANGES.map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={range === r}
              onClick={() => setRange(r)}
              className={[
                'px-3 py-1.5 font-mono text-xs uppercase tracking-widest transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 active:translate-y-px',
                range === r ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100',
              ].join(' ')}
            >
              {RANGE_LABELS[r]}
            </button>
          ))}
          <span className="ml-auto self-center font-mono text-xs tabular-nums text-zinc-400 dark:text-zinc-500">
            {state.status === 'loading' ? 'querying postgres…' : state.data ? `generated ${new Date(state.data.generatedAt).toLocaleTimeString()}` : ''}
          </span>
        </nav>

        {state.status === 'error' && (
          <p role="alert" className="border-l-2 border-zinc-900 dark:border-zinc-100 px-3 py-2 font-mono text-sm text-zinc-800 dark:text-zinc-200">
            ! {state.message}
          </p>
        )}

        <main className={state.status === 'loading' && state.data ? 'opacity-50 transition-opacity' : 'transition-opacity'}>
          {state.data ? <Dashboard data={state.data} range={state.data.range} /> : state.status === 'loading' ? <Skeleton /> : null}
        </main>

        <footer className="flex flex-col gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-4 font-mono text-xs leading-relaxed tracking-wide text-zinc-400 dark:text-zinc-500">
          <p>
            Self-hosted analytics: no cookie, no third-party script, IP addresses are never stored. Visitors are counted with a
            hash of IP + user agent salted per day, so nobody can be followed across days.
          </p>
          <p>
            Exclude your own browser: open 17sx.me/?notrack=1 once (?notrack=0 to undo). Raw data:{' '}
            <a href={`/api/stats?range=${range}`} className="underline decoration-zinc-300 dark:decoration-zinc-700 underline-offset-4 hover:text-zinc-900 dark:hover:text-zinc-100">
              /api/stats?range={range}
            </a>
          </p>
        </footer>
      </div>
    </div>
  )
}
