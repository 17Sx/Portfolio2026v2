import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { experiences } from '../content/work.ts'
import { useLanguage } from '../i18n/LanguageContext.tsx'
import { ExperienceItem } from '../components/ExperienceItem.tsx'
import { Section } from '../components/Section.tsx'

function toMonth(value: string) {
  const [year, month] = value.split('-').map(Number)
  return year * 12 + month - 1
}

function CareerTimeline() {
  const { t, lang } = useLanguage()
  const today = new Date()
  const now = today.getFullYear() * 12 + today.getMonth()
  const first = Math.min(...experiences.map((entry) => toMonth(entry.start)))
  // Un mois de marge à droite pour que les postes en cours touchent le repère « Now »
  const span = Math.max(now + 1 - first, 1)
  const at = (month: number) => `${((month - first) / span) * 100}%`
  const firstYear = Math.floor(first / 12)
  const years = Array.from({ length: today.getFullYear() - firstYear + 1 }, (_, index) => firstYear + index).filter(
    (year) => year * 12 >= first,
  )

  return (
    <Section id="timeline">
      <div className="mb-5 flex items-baseline justify-between gap-3">
        <h2 className="text-[18px] font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{t.experience.timeline}</h2>
        <p className="font-mono text-[11px] tracking-[0.16em] text-zinc-400 uppercase">
          {firstYear} — {t.experience.present}
        </p>
      </div>

      <div className="grid grid-cols-[minmax(0,7.5rem)_1fr] gap-x-3">
        <span />
        <div className="relative h-5">
          <span className="absolute right-0 flex items-center gap-1 font-mono text-[10px] tracking-wider text-zinc-500 uppercase">
            <span aria-hidden className="size-1.5 rounded-full bg-emerald-500" />
            {t.experience.now}
          </span>
        </div>

        {experiences.map((entry) => {
          const start = toMonth(entry.start)
          const end = entry.end ? toMonth(entry.end) + 1 : now + 1
          return (
            <div key={entry.id} className="contents">
              <p className="truncate py-1.5 text-[12px] text-zinc-600 dark:text-zinc-400">{entry.company[lang]}</p>
              <div className="relative">
                <span
                  aria-hidden
                  className="rule-dots rule-dots-y absolute inset-y-0 right-0 translate-x-1/2"
                />
                <span
                  title={entry.period[lang]}
                  className={`absolute top-1/2 h-2 -translate-y-1/2 rounded-full ${
                    entry.end ? 'bg-zinc-400 dark:bg-zinc-600' : 'bg-zinc-900 dark:bg-zinc-100'
                  }`}
                  style={{ left: at(start), width: `calc(${at(end)} - ${at(start)})` }}
                />
              </div>
            </div>
          )
        })}

        <span />
        <div className="relative mt-2 h-4">
          {years.map((year) => (
            <span
              key={year}
              className="absolute -translate-x-1/2 font-mono text-[10px] text-zinc-400"
              style={{ left: at(year * 12) }}
            >
              {year}
            </span>
          ))}
        </div>
      </div>
    </Section>
  )
}

export default function Experience() {
  const { t } = useLanguage()
  const [open, setOpen] = useState<Record<string, boolean>>({ [experiences[0]?.id ?? '']: true })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <Link
        to={{ pathname: '/', hash: 'experience' }}
        className="text-[13px] text-zinc-500 underline-offset-4 hover:text-zinc-900 hover:underline dark:hover:text-zinc-100"
      >
        ← {t.experience.back}
      </Link>

      <CareerTimeline />

      <Section id="all-experiences">
        <h2 className="text-[18px] font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {t.experience.archiveTitle}
        </h2>
        <p className="mt-1 mb-6 text-[13px] text-zinc-500">{t.experience.archiveSubtitle}</p>
        <div className="flex flex-col gap-7">
          {experiences.map((entry) => (
            <ExperienceItem
              key={entry.id}
              entry={entry}
              expanded={Boolean(open[entry.id])}
              onToggle={() => setOpen((current) => ({ ...current, [entry.id]: !current[entry.id] }))}
            />
          ))}
        </div>
      </Section>
    </>
  )
}
