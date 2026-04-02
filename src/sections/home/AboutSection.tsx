import { useLanguage } from '../../i18n/LanguageContext.tsx'
import { SectionLabel } from './SectionLabel.tsx'

export function AboutSection() {
  const { t } = useLanguage()

  return (
    <section className="mt-10 border-t border-white/15 pt-10">
      <div className="flex flex-col gap-10 md:flex-row md:gap-14">
        <SectionLabel>{t.nav.about}</SectionLabel>
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <p className="font-mono text-sm font-medium uppercase leading-relaxed tracking-[0.08em] text-white">
            {t.about.title}
          </p>
          <p className="font-mono text-xs uppercase leading-relaxed tracking-[0.12em] text-white/50">
            {t.about.subtitle}
          </p>
        </div>
      </div>
    </section>
  )
}
