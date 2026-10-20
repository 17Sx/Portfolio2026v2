import { useLayoutEffect, useRef, useState } from 'react'
import { HISTOGRAMS, type HistogramName, type SeriesPoint, type StatsRange } from '../../shared/stats-schema.ts'
import { bucketLabel, formatNumber } from './format.ts'
import { WORLD_MAP } from './worldMap.ts'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function seriesLabel(label: string, range: StatsRange): string {
  if (range === 'today') return label
  const [y, m, d] = label.split('-')
  const month = MONTHS[Number(m) - 1] ?? m
  return d ? `${month} ${Number(d)}` : `${month} ${y.slice(2)}`
}

function niceMax(value: number): number {
  if (value <= 4) return 4
  const magnitude = 10 ** Math.floor(Math.log10(value))
  const step = [1, 2, 2.5, 5, 10].find((s) => s * magnitude * 4 >= value) ?? 10
  return step * magnitude * 4
}

/** Rendered width of the wrapper, so SVG text stays at its real pixel size. */
function useWidth() {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(600)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    setWidth(el.clientWidth || 600)
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(240, Math.round(entry.contentRect.width))))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return [ref, width] as const
}

export function TrafficChart({ series, range }: { series: SeriesPoint[]; range: StatsRange }) {
  const [hovered, setHovered] = useState<number | null>(null)
  const [ref, W] = useWidth()
  const H = W < 560 ? 170 : 230
  const pad = { top: 8, right: 4, bottom: 22, left: 36 }
  const innerW = W - pad.left - pad.right
  const innerH = H - pad.top - pad.bottom
  const max = niceMax(Math.max(1, ...series.map((p) => Math.max(p.pv, p.uv))))
  const slot = innerW / Math.max(1, series.length)
  const barW = Math.max(2, slot * 0.62)
  const y = (v: number) => pad.top + innerH - (v / max) * innerH
  const showUniques = range !== 'today'
  const line = series.map((p, i) => `${pad.left + slot * (i + 0.5)},${y(p.uv)}`).join(' ')
  const point = hovered === null ? null : series[hovered]
  const tickEvery = Math.ceil(series.length / Math.max(3, Math.floor(W / 110)))

  return (
    <figure className="flex flex-col gap-3">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 font-mono text-xs uppercase tracking-widest text-zinc-500">
        <span className="flex gap-4">
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2 bg-zinc-900/80 dark:bg-zinc-100/80" aria-hidden /> pageviews
          </span>
          {showUniques && (
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-px w-3 bg-zinc-900 dark:bg-zinc-100" aria-hidden /> unique visitors
            </span>
          )}
        </span>
        <span className="tabular-nums text-zinc-600 dark:text-zinc-300" aria-live="polite">
          {point
            ? `${seriesLabel(point.label, range)} · ${formatNumber(point.pv)} pv${showUniques ? ` · ${formatNumber(point.uv)} uv` : ''}`
            : 'hover a bar'}
        </span>
      </figcaption>
      <div ref={ref}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block text-zinc-900 dark:text-zinc-100" role="img" aria-label="Pageviews over time">
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <g key={f}>
            <line x1={pad.left} x2={W - pad.right} y1={y(max * f)} y2={y(max * f)} stroke="currentColor" strokeOpacity={f === 0 ? 0.3 : 0.08} />
            <text x={pad.left - 6} y={y(max * f) + 3} textAnchor="end" fontSize="10" fill="currentColor" fillOpacity={0.45}>
              {formatNumber(max * f)}
            </text>
          </g>
        ))}
        {series.map((p, i) => {
          const x = pad.left + slot * i
          return (
            <g key={p.label} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
              <rect x={x} y={pad.top} width={slot} height={innerH} fill="currentColor" fillOpacity={hovered === i ? 0.05 : 0} />
              <rect
                x={x + (slot - barW) / 2}
                y={y(p.pv)}
                width={barW}
                height={pad.top + innerH - y(p.pv)}
                fill="currentColor"
                fillOpacity={hovered === null || hovered === i ? 0.8 : 0.35}
              />
              {i % tickEvery === 0 && (
                <text x={x + slot / 2} y={H - 6} textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity={0.45}>
                  {seriesLabel(p.label, range)}
                </text>
              )}
            </g>
          )
        })}
        {showUniques && series.length > 1 && (
          <polyline points={line} fill="none" stroke="currentColor" strokeWidth={1.25} pointerEvents="none" />
        )}
        {showUniques &&
          series.map((p, i) => (
            <rect
              key={p.label}
              x={pad.left + slot * (i + 0.5) - 2}
              y={y(p.uv) - 2}
              width={4}
              height={4}
              className="fill-white dark:fill-black"
              stroke="currentColor"
              pointerEvents="none"
            />
          ))}
      </svg>
      </div>
    </figure>
  )
}

export function PunchCard({ cells }: { cells: Record<string, number> | undefined }) {
  const [ref, width] = useWidth()
  const max = Math.max(1, ...Object.values(cells ?? {}))
  const left = 30
  const top = 16
  const size = (width - left) / 24
  return (
    <div ref={ref}>
    <svg
      width={width}
      height={top + 7 * size}
      viewBox={`0 0 ${width} ${top + 7 * size}`}
      className="block text-zinc-900 dark:text-zinc-100"
      role="img"
      aria-label="Pageviews by weekday and hour, Paris time"
    >
      {Array.from({ length: 24 }, (_, h) =>
        h % (size < 16 ? 6 : 3) === 0 ? (
          <text key={h} x={left + h * size + size / 2} y={10} textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity={0.45}>
            {String(h).padStart(2, '0')}
          </text>
        ) : null,
      )}
      {WEEKDAYS.map((day, d) => (
        <g key={day}>
          <text x={0} y={top + d * size + size / 2 + 3} fontSize="10" fill="currentColor" fillOpacity={0.45}>
            {day}
          </text>
          {Array.from({ length: 24 }, (_, h) => {
            const n = cells?.[`${d}-${h}`] ?? 0
            const r = n === 0 ? 1 : 1.5 + Math.sqrt(n / max) * (size / 2 - 2)
            return (
              <circle key={h} cx={left + h * size + size / 2} cy={top + d * size + size / 2} r={r} fill="currentColor" fillOpacity={n === 0 ? 0.12 : 0.25 + 0.65 * (n / max)}>
                <title>{`${day} ${String(h).padStart(2, '0')}:00 · ${n} pageviews`}</title>
              </circle>
            )
          })}
        </g>
      ))}
    </svg>
    </div>
  )
}

export function WorldMap({ geo }: { geo: Record<string, number> | undefined }) {
  const cell = 10
  const { rows, step, latTop } = WORLD_MAP
  const width = rows[0].length * cell
  const height = rows.length * cell
  const points = Object.entries(geo ?? {}).flatMap(([key, n]) => {
    const [lat, lon, city] = key.split(';')
    const la = Number(lat)
    const lo = Number(lon)
    if (!Number.isFinite(la) || !Number.isFinite(lo)) return []
    return [{ x: ((lo + 180) / step) * cell, y: ((latTop - la) / step) * cell, n, city: city || `${lat}, ${lon}` }]
  })
  const max = Math.max(1, ...points.map((p) => p.n))

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full text-zinc-900 dark:text-zinc-100" role="img" aria-label="Map of visitor locations">
      {rows.map((row, r) =>
        [...row].map((c, col) =>
          c === '#' ? <circle key={`${r}-${col}`} cx={col * cell + cell / 2} cy={r * cell + cell / 2} r={2.2} fill="currentColor" fillOpacity={0.16} /> : null,
        ),
      )}
      {points
        .sort((a, b) => b.n - a.n)
        .map((p) => {
          const r = 4 + Math.sqrt(p.n / max) * 12
          return (
            <g key={`${p.x}-${p.y}-${p.city}`}>
              <circle cx={p.x} cy={p.y} r={r} fill="currentColor" fillOpacity={0.18} />
              <circle cx={p.x} cy={p.y} r={3.2} fill="currentColor">
                <title>{`${p.city} · ${p.n} session${p.n > 1 ? 's' : ''}`}</title>
              </circle>
            </g>
          )
        })}
    </svg>
  )
}

const RATING_OPACITY = { good: 0.85, ni: 0.45, poor: 0.2 }

export function Histogram({ name, counts }: { name: HistogramName; counts: number[] }) {
  const { edges, good, poor } = HISTOGRAMS[name]
  const [ref, W] = useWidth()
  const max = Math.max(1, ...counts)
  const H = 104
  const slot = W / counts.length
  return (
    <div ref={ref}>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block text-zinc-900 dark:text-zinc-100" role="img" aria-label={`${name} distribution`}>
      {counts.map((n, i) => {
        const upper = i < edges.length ? edges[i] : Infinity
        const rating = good === null || poor === null ? 'good' : upper <= good ? 'good' : upper <= poor ? 'ni' : 'poor'
        const h = (n / max) * (H - 30)
        return (
          <g key={i}>
            <rect x={i * slot + 2} y={H - 18 - h} width={slot - 4} height={Math.max(h, 1)} fill="currentColor" fillOpacity={RATING_OPACITY[rating]}>
              <title>{`${bucketLabel(name, i)} · ${n}`}</title>
            </rect>
            {n > 0 && (
              <text x={i * slot + slot / 2} y={H - 22 - h} textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity={0.6}>
                {formatNumber(n)}
              </text>
            )}
            <text x={i * slot + slot / 2} y={H - 5} textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity={0.45}>
              {bucketLabel(name, i)}
            </text>
          </g>
        )
      })}
    </svg>
    </div>
  )
}
