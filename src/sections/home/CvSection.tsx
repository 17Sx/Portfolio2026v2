import { stackCategories } from '../../i18n/translations.ts'
import { useLanguage } from '../../i18n/LanguageContext.tsx'
import { SectionLabel } from './SectionLabel.tsx'

export function CvSection() {
  const { t, lang } = useLanguage()
  const s = t.stack

  return (
    <section id="cv" className="mt-14 border-t border-white/15 pt-10">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-10 md:flex-row md:gap-14">
          <SectionLabel>{t.cv.title}</SectionLabel>
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <p className="font-mono text-xs uppercase leading-relaxed tracking-[0.12em] text-white/45">
              {t.cv.description}
            </p>
            <div className="flex flex-wrap gap-4 font-mono text-[10px] uppercase tracking-[0.2em]">
              <a
                href="/cv_en.pdf"
                target="_blank"
                rel="noreferrer"
                className="border border-white/20 px-4 py-2 text-white/80 hover:border-white/40 hover:text-white"
              >
                {t.cv.viewEn}
              </a>
              <a
                href="/cv_fr.pdf"
                target="_blank"
                rel="noreferrer"
                className="border border-white/20 px-4 py-2 text-white/80 hover:border-white/40 hover:text-white"
              >
                {t.cv.viewFr}
              </a>
            </div>
          </div>
        </div>

        <div
          id="stack"
          className="flex flex-col gap-10 border-t border-white/10 pt-10 md:flex-row md:gap-14"
        >
          <SectionLabel>{s.section}</SectionLabel>
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <p className="max-w-xl font-mono text-xs leading-relaxed tracking-[0.06em] text-white/50 normal-case">
              {s.narrative}
            </p>
            <div className="flex flex-col gap-5">
              {stackCategories.map((cat) => (
                <div key={cat.id} className="flex flex-col gap-1.5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">
                    {cat.label[lang]}
                  </p>
                  <p className="font-mono text-xs uppercase leading-relaxed tracking-[0.1em] text-white/45">
                    {cat.items.join(' · ')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
