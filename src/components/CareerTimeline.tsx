import { Link } from 'react-router-dom'
import { experiences } from '../content/work.ts'
import { useLanguage } from '../i18n/LanguageContext.tsx'

const dottedY = {
  maskImage: 'repeating-linear-gradient(to bottom, black 0, black 1px, transparent 1px, transparent 6px)',
  WebkitMaskImage: 'repeating-linear-gradient(to bottom, black 0, black 1px, transparent 1px, transparent 6px)',
}

function toMonth(value: string) {
  const [year, month] = value.split('-').map(Number)
  return year * 12 + month - 1
}

export function CareerTimeline() {
  const { t, lang } = useLanguage()
  const today = new Date()
  const now = today.getFullYear() * 12 + today.getMonth()
  const first = Math.min(...experiences.map((entry) => toMonth(entry.start)))
  // Un mois de marge pour que les postes en cours touchent la ligne « Now »
  const span = Math.max(now + 1 - first, 1)
  const pct = (month: number) => Math.min(Math.max(((month - first) / span) * 100, 0), 100)
  const firstYear = Math.floor(first / 12)
  const years = Array.from({ length: today.getFullYear() - firstYear }, (_, index) => firstYear + index + 1)
  const rows = experiences.length

  return (
    <div className="relative h-full w-full">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 text-zinc-400 opacity-20 dark:text-zinc-500 dark:opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '16px 16px',
          backgroundPosition: 'center',
          maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
        }}
      />

      <div
        aria-hidden
        className="rule-dots rule-dots-x pointer-events-none absolute -right-[100vw] bottom-0 -left-[100vw] translate-y-1/2"
      />

      <section aria-labelledby="career-timeline-title" className="relative z-10 flex h-full flex-col px-4 pt-4 pb-4">
        <div className="flex h-8 shrink-0 items-start justify-between gap-4">
          <div className="flex min-w-0 items-baseline gap-2">
            <h2
              id="career-timeline-title"
              className="truncate text-[15px] font-bold tracking-tight text-zinc-800 sm:text-[16px] dark:text-zinc-100"
            >
              {t.experience.timeline}
            </h2>
            <span className="text-[9px] font-medium tracking-[0.18em] text-zinc-400 uppercase sm:hidden dark:text-zinc-600">
              {t.experience.drag}
            </span>
          </div>
          <span className="shrink-0 pt-0.5 font-mono text-[10px] font-medium tracking-[0.12em] text-zinc-500 uppercase sm:text-[11px]">
            {firstYear}—{t.experience.present}
          </span>
        </div>

        {/* rtl : sur mobile le défilement démarre à droite, sur « Now » */}
        <div dir="rtl" className="relative min-h-0 flex-1 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div dir="ltr" className="flex h-full w-[620px] flex-col sm:w-full">
            <div className="relative h-6 shrink-0 font-mono text-[9px] tracking-[0.08em] text-zinc-400 sm:text-[10px] dark:text-zinc-600">
              <span className="absolute left-0">{firstYear}</span>
              {years.map((year) => {
                const left = pct(year * 12)
                return left < 92 ? (
                  <span key={year} className="absolute -translate-x-1/2" style={{ left: `${left}%` }}>
                    {year}
                  </span>
                ) : null
              })}
              <span className="absolute right-0 flex items-center gap-1 text-zinc-600 uppercase dark:text-zinc-400">
                <span aria-hidden className="size-1 rounded-full bg-orange-500" />
                {t.experience.now}
              </span>
            </div>

            <div
              className="relative grid min-h-0 flex-1 gap-1 border-b border-black/[0.08] dark:border-white/[0.065]"
              style={{
                gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                backgroundImage:
                  'linear-gradient(to right, transparent 24.5%, rgba(113,113,122,0.07) 24.5%, rgba(113,113,122,0.07) 25%, transparent 25%, transparent 49.5%, rgba(113,113,122,0.07) 49.5%, rgba(113,113,122,0.07) 50%, transparent 50%, transparent 74.5%, rgba(113,113,122,0.07) 74.5%, rgba(113,113,122,0.07) 75%, transparent 75%)',
              }}
            >
              {years.map((year) => (
                <span
                  key={year}
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 z-0 w-px border-l border-black/20 dark:border-white/[0.12]"
                  style={{ left: `${pct(year * 12)}%`, ...dottedY }}
                />
              ))}
              <span aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-20 w-px bg-orange-500/90" />

              {experiences.map((entry, index) => {
                const left = pct(toMonth(entry.start))
                const right = 100 - pct(entry.end ? toMonth(entry.end) + 1 : now + 1)
                const width = 100 - left - right
                // Libellé du côté où il reste de la place ; dans la barre si elle occupe presque toute la largeur
                const labelInside = width > 70
                const labelBefore = !labelInside && left > 50
                const tipBelow = index < rows / 2
                return (
                  <div key={entry.id} className="relative border-t border-black/[0.08] dark:border-white/[0.065]">
                    <div
                      className="group absolute top-1/2 z-10 -translate-y-1/2 focus-within:z-30 hover:z-30"
                      style={{ left: `${left}%`, right: `${right}%`, minWidth: 26 }}
                    >
                      <Link
                        to={{ pathname: '/experience', hash: `experience-${entry.id}` }}
                        aria-label={entry.company[lang]}
                        aria-describedby={`timeline-tip-${entry.id}`}
                        className="relative flex h-8 w-full items-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500"
                      >
                        <span
                          aria-hidden
                          className="absolute inset-0 overflow-hidden rounded-md border border-white/10 shadow-[0_3px_10px_rgba(0,0,0,0.18)] ring-1 ring-white/15 ring-inset transition-[filter,box-shadow] duration-200 group-hover:shadow-[0_3px_12px_rgba(0,0,0,0.24)] group-hover:brightness-110 before:absolute before:inset-0 before:-translate-x-full before:bg-[linear-gradient(110deg,transparent_42%,rgba(255,255,255,0.24)_50%,transparent_58%)] before:transition-transform before:duration-700 before:ease-in-out before:content-[''] group-hover:before:translate-x-full motion-reduce:before:hidden"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span
                          className={`relative z-10 flex size-4 shrink-0 items-center justify-center overflow-hidden rounded-[4px] border border-black/10 ${
                            entry.tile === 'dark' ? 'bg-black' : 'bg-white'
                          } ${labelBefore || labelInside ? 'ml-1' : 'mr-1 ml-auto'}`}
                        >
                          {entry.logo ? (
                            <img
                              src={entry.logo}
                              alt=""
                              className={`size-full rounded-[3px] ${entry.logoFit === 'cover' ? 'object-cover' : 'object-contain p-px'}`}
                            />
                          ) : (
                            <span className="text-[6px] font-bold text-zinc-700">{entry.monogram}</span>
                          )}
                        </span>
                        <span
                          className={`pointer-events-none z-10 text-[10px] font-semibold whitespace-nowrap sm:text-[11px] ${
                            labelInside
                              ? 'relative ml-2 text-white'
                              : `absolute text-zinc-700 dark:text-zinc-300 ${labelBefore ? 'right-full mr-2' : 'left-full ml-2'}`
                          }`}
                        >
                          {entry.company[lang]}
                        </span>
                      </Link>
                      <div
                        id={`timeline-tip-${entry.id}`}
                        role="tooltip"
                        className={`pointer-events-none absolute z-50 w-max max-w-56 translate-y-[3px] rounded-md border border-zinc-200 bg-white/95 px-2.5 py-2 text-left opacity-0 shadow-[0_8px_20px_rgba(0,0,0,0.16)] backdrop-blur-sm transition-[opacity,transform] duration-150 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:transition-none dark:border-zinc-700 dark:bg-zinc-900/95 dark:shadow-[0_10px_24px_rgba(0,0,0,0.45)] ${
                          tipBelow ? 'top-full mt-2' : 'bottom-full mb-2'
                        } ${left > 50 ? 'right-0' : 'left-0'}`}
                      >
                        <p className="text-[11px] leading-tight font-semibold text-zinc-900 dark:text-zinc-100">
                          {entry.company[lang]}
                        </p>
                        <p className="mt-1 text-[10px] leading-snug text-zinc-600 dark:text-zinc-300">{entry.role[lang]}</p>
                        <p className="mt-1.5 border-t border-zinc-100 pt-1.5 font-mono text-[10px] text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                          {entry.period[lang]}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        <p className="sr-only">{t.experience.timelineHint}</p>
      </section>
    </div>
  )
}
