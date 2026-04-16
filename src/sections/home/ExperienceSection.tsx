import { experienceEntries } from '../../i18n/translations.ts'
import { useLanguage } from '../../i18n/LanguageContext.tsx'

export function ExperienceSection() {
  const { t, lang } = useLanguage()

  return (
    <section id="experience" className="border-t border-black/15 pt-5">
      <div className="flex flex-col gap-5 md:flex-row md:gap-8">
        <p className="shrink-0 font-mono text-sm uppercase tracking-widest text-black/50 md:w-36">
          {t.experience.section}
        </p>
        <div className="min-w-0 flex-1 divide-y divide-black/10">
          {experienceEntries.map((entry) => {
            const company = entry.company[lang]
            const role = entry.role[lang]
            const period = entry.period[lang]
            const companyEl = entry.url ? (
              <a
                href={entry.url}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-base font-semibold tracking-wide text-black underline-offset-4 transition-colors underline"
              >
                {company}
              </a>
            ) : (
              <span className="font-mono text-base font-semibold tracking-wide text-black">
                {company}
              </span>
            )
            return (
              <div
                key={entry.id}
                className="flex flex-col gap-0.5 py-2 first:pt-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
              >
                <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  {companyEl}
                  <span className="font-mono text-base leading-relaxed text-black/55">
                    {role}
                  </span>
                </div>
                <span className="shrink-0 font-mono text-sm tracking-wide text-black/45 sm:text-right">
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
