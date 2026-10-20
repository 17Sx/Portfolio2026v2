import { useEffect, useMemo, useState } from 'react'
import { SOCIAL } from '../../constants/social.ts'
import { useLanguage } from '../../i18n/LanguageContext.tsx'
import { Section } from '../../components/Section.tsx'

type Day = { date: string; count: number; level: number }

const LEVEL = [
  'bg-zinc-200 dark:bg-white/[0.06]',
  'bg-zinc-300 dark:bg-zinc-600',
  'bg-zinc-400 dark:bg-zinc-400',
  'bg-zinc-600 dark:bg-zinc-200',
  'bg-zinc-800 dark:bg-white',
]

function buildWeeks(days: Day[]) {
  if (days.length === 0) return []
  const first = new Date(`${days[0].date}T00:00:00`)
  const cells: (Day | null)[] = [...Array.from({ length: first.getDay() }, () => null), ...days]
  const weeks: (Day | null)[][] = []
  for (let index = 0; index < cells.length; index += 7) {
    weeks.push(cells.slice(index, index + 7))
  }
  return weeks
}

export function GithubSection() {
  const { t, lang } = useLanguage()
  const [days, setDays] = useState<Day[] | null>(null)
  const [total, setTotal] = useState<number | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    fetch('https://github-contributions-api.jogruber.de/v4/17Sx?y=last', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('bad status')
        return response.json() as Promise<{ total?: { lastYear?: number }; contributions?: Day[] }>
      })
      .then((payload) => {
        const contributions = payload.contributions ?? []
        setDays(contributions)
        const summed = contributions.reduce((sum, day) => sum + day.count, 0)
        setTotal(payload.total?.lastYear ?? summed)
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setFailed(true)
      })
    return () => controller.abort()
  }, [])

  const weeks = useMemo(() => (days ? buildWeeks(days) : []), [days])
  const columns = weeks.length > 0 ? weeks : Array.from({ length: 20 }, () => Array.from({ length: 7 }, () => null))

  let previousMonth: number | null = null
  let lastLabel = -100
  const monthLabels = weeks.map((week, index) => {
    const first = week.find((day) => day !== null)
    if (!first) return ''
    const date = new Date(`${first.date}T00:00:00`)
    const month = date.getMonth()
    const changed = index === 0 || (month !== previousMonth && date.getDate() <= 7)
    previousMonth = month
    if (!changed || index - lastLabel < 5) return ''
    lastLabel = index
    return date.toLocaleDateString(lang, { month: 'short' })
  })

  return (
    <Section id="github" title={t.github.section}>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <p className="text-[13px] text-zinc-500">
          {total !== null ? t.github.count.replace('{count}', total.toLocaleString(lang)) : t.github.loading}
        </p>
        <a
          href={SOCIAL.github}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 text-[13px] text-zinc-500 underline-offset-4 hover:text-zinc-900 hover:underline dark:hover:text-zinc-100"
        >
          @17Sx
        </a>
      </div>

      {failed ? (
        <p className="text-[13px] text-zinc-500">
          {t.github.failed}{' '}
          <a href={SOCIAL.github} className="underline underline-offset-4" target="_blank" rel="noreferrer">
            {t.github.profile}
          </a>
        </p>
      ) : (
        <div className="w-full overflow-hidden">
          <div
            className="mb-1 grid h-4"
            style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`, columnGap: 2 }}
          >
            {(weeks.length > 0 ? monthLabels : columns.map(() => '')).map((label, index) => (
              <span key={index} className="relative">
                {label ? (
                  <span className="absolute top-0 left-0 text-[10px] whitespace-nowrap text-zinc-400">{label}</span>
                ) : null}
              </span>
            ))}
          </div>
          <div
            className="mt-4 grid"
            role="img"
            aria-label={t.github.section}
            style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`, columnGap: 2 }}
          >
            {columns.map(
              (week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-[2px]">
                  {Array.from({ length: 7 }, (_, dayIndex) => week[dayIndex] ?? null).map((day, dayIndex) => (
                    <span
                      key={day?.date ?? `${weekIndex}-${dayIndex}`}
                      title={day ? `${day.date} · ${day.count}` : undefined}
                      className={`aspect-square w-full rounded-[2px] ${day ? LEVEL[Math.min(day.level, 4)] : 'bg-zinc-100 dark:bg-white/[0.04]'}`}
                    />
                  ))}
                </div>
              ),
            )}
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center justify-end text-[11px] text-zinc-400">
        <span className="flex items-center gap-1">
          {t.github.less}
          {LEVEL.map((level) => (
            <span key={level} className={`size-[10px] rounded-[2px] ${level}`} />
          ))}
          {t.github.more}
        </span>
      </div>
    </Section>
  )
}
