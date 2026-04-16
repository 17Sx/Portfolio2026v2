import { useLanguage } from '../../i18n/LanguageContext.tsx'
import { SectionLabel } from './SectionLabel.tsx'

export function StatsSection() {
  const { t } = useLanguage()

  return (
    <section className="border-t border-black/15 pt-5">
      <div className="flex flex-col gap-5 md:flex-row md:gap-8">
        <SectionLabel>{t.stats.section}</SectionLabel>
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <p className="font-mono text-base italic leading-relaxed text-black/80">
            "{t.stats.quote}"
          </p>
          <a
            href="https://github.com/17Sx"
            target="_blank"
            rel="noreferrer"
            className="font-mono text-base tracking-wide text-black/55 underline decoration-black/25 underline-offset-4 hover:text-black/80"
          >
            {t.stats.githubProfile} →
          </a>
          <a href="https://github.com/17Sx" target="_blank" rel="noreferrer" className="block">
            <img
              src="https://ghchart.rshah.org/171717/17Sx"
              alt="GitHub contribution graph"
              className="w-full opacity-70"
            />
          </a>
        </div>
      </div>
    </section>
  )
}
