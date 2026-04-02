import { experienceEntries } from '../../i18n/translations.ts'
import { useLanguage } from '../../i18n/LanguageContext.tsx'

export function ExperienceSection() {
  const { t, lang } = useLanguage()

  return (
    <section id="experience" className="mt-14 border-t border-white/15 pt-10">
      <div className="flex flex-col gap-10 md:flex-row md:gap-14">
        <p className="shrink-0 font-mono text-[10px] uppercase tracking-[0.35em] text-white/40 md:w-36">
          {t.experience.section}
        </p>
        <div className="min-w-0 flex-1 divide-y divide-white/10">
          {experienceEntries.map((entry) => {
            const company = entry.company[lang]
            const role = entry.role[lang]
            const period = entry.period[lang]
            const companyEl = entry.url ? (
              <a
                href={entry.url}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-sm font-semibold uppercase tracking-[0.08em] text-white underline-offset-4 transition-colors hover:underline"
              >
                {company}
              </a>
            ) : (
              <span className="font-mono text-sm font-semibold uppercase tracking-[0.08em] text-white">
                {company}
              </span>
            )
            return (
              <div
                key={entry.id}
                className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
              >
                <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
                  {companyEl}
                  <span className="font-mono text-xs uppercase leading-relaxed tracking-[0.1em] text-white/45">
                    {role}
                  </span>
                </div>
                <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-white/40 sm:text-right">
                  {period}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
