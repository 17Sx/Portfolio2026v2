import { useLanguage } from '../../i18n/LanguageContext.tsx'
import { SectionLabel } from './SectionLabel.tsx'

export function CvSection() {
  const { t, lang } = useLanguage()
  const cvHref = lang === 'fr' ? '/cv_fr.pdf' : '/cv_en.pdf'

  return (
    <section id="cv" className="border-t border-black/15 pt-5">
      <div className="flex flex-col gap-5 md:flex-row md:gap-8">
        <SectionLabel>{t.cv.title}</SectionLabel>
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <p className="font-mono text-base leading-relaxed text-black/60">
            {t.cv.description}
          </p>
          <div className="flex flex-wrap gap-3 font-mono text-sm uppercase tracking-widest">
            <a
              href={cvHref}
              target="_blank"
              rel="noreferrer"
              className="border border-black/20 px-4 py-2 text-black/75 hover:border-black/40 hover:text-black"
            >
              {t.cv.viewResume}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
