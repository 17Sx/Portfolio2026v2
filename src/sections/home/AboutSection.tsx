import { useLanguage } from '../../i18n/LanguageContext.tsx'
import { SectionLabel } from './SectionLabel.tsx'

export function AboutSection() {
  const { t } = useLanguage()

  return (
    <section className="border-t border-black/15 pt-5">
      <div className="flex flex-col gap-5 md:flex-row md:gap-8">
        <SectionLabel>{t.nav.about}</SectionLabel>
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <p className="font-mono text-lg font-medium leading-relaxed text-black">
            {t.about.title}
          </p>
          <p className="font-mono text-base leading-relaxed text-black/65">
            {t.about.subtitle}
          </p>
          <p className="font-mono text-sm leading-relaxed text-black/55 md:text-base">
            {t.about.detail}
          </p>
        </div>
      </div>
    </section>
  )
}
