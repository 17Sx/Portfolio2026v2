import { useState, type ReactNode } from 'react'
import type { FeedEntry, HistogramName } from '../../shared/stats-schema.ts'
import { Histogram } from './charts.tsx'
import { countryName, flag, formatMetric, formatNumber, formatPercent, histogramCounts, percentile, ratingSplit, timeAgo } from './format.ts'

export function Panel({ title, hint, children, className = '' }: { title: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`flex min-w-0 flex-col gap-4 border-t border-zinc-200 dark:border-zinc-800 pt-4 ${className}`}>
      <header className="flex items-baseline justify-between gap-4">
        <h2 className="font-mono text-sm uppercase tracking-widest text-zinc-600 dark:text-zinc-400">{title}</h2>
        {hint && <p className="text-right font-mono text-xs tracking-wide text-zinc-400 dark:text-zinc-500">{hint}</p>}
      </header>
      {children}
    </section>
  )
}

export function Empty({ children = 'Nothing recorded in this range yet.' }: { children?: ReactNode }) {
  return <p className="font-mono text-sm text-zinc-400 dark:text-zinc-500">{children}</p>
}

export function Kpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 border-t border-zinc-200 dark:border-zinc-800 pt-3">
      <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">{label}</p>
      <p className="font-doto text-[32px] leading-none font-bold tracking-[0.06em] tabular-nums text-zinc-900 dark:text-zinc-100">{value}</p>
      {sub && <p className="font-mono text-xs tracking-wide text-zinc-400 dark:text-zinc-500">{sub}</p>}
    </div>
  )
}

type Row = { key: string; label: ReactNode; value: number; extra?: string }

export function BarList({ rows, limit = 8, unit }: { rows: Row[]; limit?: number; unit?: string }) {
  const [expanded, setExpanded] = useState(false)
  if (rows.length === 0) return <Empty />
  const total = rows.reduce((t, r) => t + r.value, 0)
  const max = rows[0]?.value || 1
  const visible = expanded ? rows : rows.slice(0, limit)
  return (
    <div className="flex flex-col gap-1">
      <ul className="flex flex-col gap-1">
        {visible.map((row) => (
          <li key={row.key} className="relative flex items-baseline justify-between gap-3 px-2 py-1 font-mono text-sm">
            <span className="absolute inset-y-0 left-0 bg-black/[0.05] dark:bg-white/[0.08]" style={{ width: `${(row.value / max) * 100}%` }} aria-hidden />
            <span className="relative min-w-0 truncate text-zinc-800 dark:text-zinc-200">{row.label}</span>
            <span className="relative shrink-0 tabular-nums text-zinc-600 dark:text-zinc-400">
              {row.extra && <span className="mr-3 text-zinc-400 dark:text-zinc-500">{row.extra}</span>}
              {formatNumber(row.value)}
              {unit ?? ''}
              <span className="ml-2 inline-block w-10 text-right text-zinc-400 dark:text-zinc-500">{formatPercent(row.value / total)}</span>
            </span>
          </li>
        ))}
      </ul>
      {rows.length > limit && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="self-start px-2 py-1 font-mono text-xs uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-zinc-400"
        >
          {expanded ? 'show less' : `show all ${rows.length}`}
        </button>
      )}
    </div>
  )
}

const SEGMENT_OPACITY = [0.85, 0.55, 0.32, 0.18, 0.1]

/** One stacked bar for low-cardinality dimensions (device, scheme, network…). */
export function SplitBar({ label, entries }: { label: string; entries: [string, number][] }) {
  const total = entries.reduce((t, [, n]) => t + n, 0)
  return (
    <div className="flex flex-col gap-1.5">
      <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">{label}</p>
      {total === 0 ? (
        <Empty>–</Empty>
      ) : (
        <>
          <div className="flex h-2.5 w-full gap-px overflow-hidden" aria-hidden>
            {entries.map(([key, n], i) => (
              <span key={key} className="h-full bg-zinc-900 dark:bg-zinc-100" style={{ width: `${(n / total) * 100}%`, opacity: SEGMENT_OPACITY[Math.min(i, 4)] }} />
            ))}
          </div>
          <ul className="flex flex-wrap gap-x-3 gap-y-0.5 font-mono text-xs tabular-nums text-zinc-600 dark:text-zinc-400">
            {entries.map(([key, n], i) => (
              <li key={key} className="flex items-center gap-1.5">
                <span className="inline-block size-2 bg-zinc-900 dark:bg-zinc-100" style={{ opacity: SEGMENT_OPACITY[Math.min(i, 4)] }} aria-hidden />
                {key} <span className="text-zinc-400 dark:text-zinc-500">{formatPercent(n / total)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

const VITAL_LABELS: Record<HistogramName, string> = {
  ttfb: 'Time to first byte',
  fcp: 'First contentful paint',
  lcp: 'Largest contentful paint',
  cls: 'Cumulative layout shift',
  inp: 'Interaction to next paint',
  time: 'Time on page',
}

export function VitalCard({ name, buckets }: { name: HistogramName; buckets: Record<string, number> | undefined }) {
  const counts = histogramCounts(name, buckets)
  const samples = counts.reduce((a, b) => a + b, 0)
  const p75 = percentile(name, counts, 0.75)
  const p50 = percentile(name, counts, 0.5)
  const p95 = percentile(name, counts, 0.95)
  const split = ratingSplit(name, counts)
  return (
    <div className="flex min-w-0 flex-col gap-3 border-t border-zinc-200 dark:border-zinc-800 pt-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">
          {name} <span className="normal-case tracking-normal text-zinc-400 dark:text-zinc-500">{VITAL_LABELS[name]}</span>
        </p>
        <p className="font-mono text-xs tabular-nums text-zinc-400 dark:text-zinc-500">n={formatNumber(samples)}</p>
      </div>
      {samples === 0 ? (
        <Empty>No sample yet.</Empty>
      ) : (
        <>
          <p className="font-doto text-[32px] leading-none font-bold tracking-[0.06em] tabular-nums text-zinc-900 dark:text-zinc-100">
            {p75 === null ? '–' : formatMetric(name, p75)}
            <span className="ml-2 text-xs uppercase tracking-widest text-zinc-400 dark:text-zinc-500">p75</span>
          </p>
          <p className="font-mono text-xs tabular-nums text-zinc-500">
            p50 {p50 === null ? '–' : formatMetric(name, p50)} · p95 {p95 === null ? '–' : formatMetric(name, p95)}
          </p>
          <p className="font-mono text-xs tabular-nums text-zinc-600 dark:text-zinc-400">
            good {formatPercent(split.good / samples)} · needs work {formatPercent(split.ni / samples)} · poor{' '}
            {formatPercent(split.poor / samples)}
          </p>
          <Histogram name={name} counts={counts} />
        </>
      )}
    </div>
  )
}

export function LiveFeed({ entries, now }: { entries: FeedEntry[]; now: number }) {
  if (entries.length === 0) return <Empty>No hit yet. The log fills in as people browse the portfolio.</Empty>
  return (
    <ol className="flex max-h-96 flex-col overflow-y-auto font-mono text-xs leading-6 text-zinc-600 dark:text-zinc-300">
      {entries.map((e, i) => (
        <li key={`${e.ts}-${i}`} className="grid grid-cols-[4.5rem_2.5rem_1fr] gap-x-3 border-b border-zinc-100 dark:border-zinc-900 sm:grid-cols-[4.5rem_2.5rem_minmax(0,1fr)_minmax(0,17rem)]">
          <span className="tabular-nums text-zinc-400 dark:text-zinc-500">{timeAgo(e.ts, now)}</span>
          <span className="uppercase text-zinc-500">{e.t === 'pv' ? 'GET' : 'OUT'}</span>
          <span className="truncate text-zinc-800 dark:text-zinc-200">
            {e.t === 'pv' ? e.path : `${e.path} → ${e.href ?? ''}`}
          </span>
          <span className="col-span-3 truncate text-zinc-500 sm:col-span-1 sm:text-right">
            {e.country ? `${flag(e.country)} ${e.city || countryName(e.country)}` : 'no geo'} · {e.browser}/{e.os} · {e.device}
          </span>
        </li>
      ))}
    </ol>
  )
}
