import type { Experience } from '../content/work.ts'
import { useLanguage } from '../i18n/LanguageContext.tsx'
import { ChevronIcon } from './icons.tsx'

export function ExperienceItem({
  entry,
  expanded,
  onToggle,
}: {
  entry: Experience
  expanded: boolean
  onToggle: () => void
}) {
  const { lang } = useLanguage()

  return (
    <article className="flex gap-3">
      <div
        className={`flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-black/10 dark:border-white/10 ${
          entry.tile === 'dark' ? 'bg-black' : 'bg-white'
        }`}
      >
        {entry.logo ? (
          <img
            src={entry.logo}
            alt=""
            className={`size-full ${entry.logoFit === 'cover' ? 'object-cover' : 'object-contain'}`}
          />
        ) : (
          <span className="text-[11px] font-semibold tracking-wide text-zinc-700">{entry.monogram}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          {entry.url ? (
            <a
              href={entry.url}
              target="_blank"
              rel="noreferrer"
              className="text-[15px] font-semibold tracking-tight text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-50"
            >
              {entry.company[lang]}
            </a>
          ) : (
            <p className="text-[15px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {entry.company[lang]}
            </p>
          )}
        </div>
        <p className="mt-0.5 text-[13px] text-zinc-500">{entry.role[lang]}</p>
        <button
          type="button"
          aria-expanded={expanded}
          onClick={onToggle}
          className="mt-1.5 inline-flex items-center gap-1 text-left text-[13px] font-semibold text-zinc-800 dark:text-zinc-100"
        >
          {entry.period[lang]}
          <ChevronIcon className={`size-3.5 text-zinc-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>

        <div
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
            expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden">
            <ul className="mt-3 space-y-1.5 text-[14px] leading-relaxed text-zinc-600 dark:text-zinc-400">
              {entry.bullets.map((bullet) => (
                <li key={bullet.en} className="flex gap-2">
                  <span aria-hidden className="text-zinc-400">
                    •
                  </span>
                  <span>{bullet[lang]}</span>
                </li>
              ))}
            </ul>
            {entry.stats && entry.stats.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 border-y border-black/8 py-3 dark:border-white/10">
                {entry.stats.map((stat) => (
                  <div key={stat.label.en}>
                    <p className="text-[18px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                      {stat.value}
                    </p>
                    <p className="text-[11px] tracking-wide text-zinc-400 uppercase">{stat.label[lang]}</p>
                  </div>
                ))}
              </div>
            ) : null}
            {entry.tags.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-zinc-100 px-2 py-0.5 text-[12px] text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  )
}
