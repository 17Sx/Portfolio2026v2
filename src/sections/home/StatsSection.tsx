import { useLanguage } from '../../i18n/LanguageContext.tsx'
import { SectionLabel } from './SectionLabel.tsx'

export function StatsSection() {
  const { t } = useLanguage()

  return (
    <section className="mt-14 border-t border-white/15 pt-10">
      <div className="flex flex-col gap-10 md:flex-row md:gap-14">
        <SectionLabel>{t.stats.section}</SectionLabel>
        <div className="flex min-w-0 flex-1 flex-col gap-8">
          <p className="font-mono text-sm font-medium uppercase italic tracking-[0.12em] text-white/80">
            “{t.stats.quote}”
          </p>
          <a
            href="https://github.com/17Sx"
            target="_blank"
            rel="noreferrer"
            className="font-mono text-xs uppercase tracking-[0.12em] text-white/45 underline decoration-white/20 underline-offset-4 hover:text-white/70"
          >
            {t.stats.githubProfile} →
          </a>
        </div>
      </div>
    </section>
  )
}
