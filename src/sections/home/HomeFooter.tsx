import { SOCIAL } from '../../constants/social.ts'
import { isPlainClick } from '../../components/emailSequence.ts'
import { useSendEmail } from '../../components/EmailDispatch.tsx'
import { useVisitorCount } from '../../hooks/useVisitorCount.ts'
import { useLanguage } from '../../i18n/LanguageContext.tsx'
import { DitherGrid } from '../../components/DitherGrid.tsx'
import { Section } from '../../components/Section.tsx'

export function HomeFooter() {
  const { t, lang } = useLanguage()
  const sendEmail = useSendEmail()
  const count = useVisitorCount()
  const year = new Date().getFullYear()

  return (
    <Section id="colophon">
      <blockquote>
        <p className="max-w-[28ch] text-[22px] leading-snug font-medium tracking-tight text-zinc-900 dark:text-zinc-50">
          “{t.footer.quote}”
        </p>
        <footer className="mt-4 text-[11px] tracking-[0.22em] text-zinc-400">NOA</footer>
      </blockquote>

      <div className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-[13px] text-zinc-500">
        <a href={SOCIAL.github} target="_blank" rel="noreferrer" className="hover:text-zinc-900 dark:hover:text-zinc-100">
          GitHub
        </a>
        <a href={SOCIAL.linkedin} target="_blank" rel="noreferrer" className="hover:text-zinc-900 dark:hover:text-zinc-100">
          LinkedIn
        </a>
        <a href={SOCIAL.twitter} target="_blank" rel="noreferrer" className="hover:text-zinc-900 dark:hover:text-zinc-100">
          X
        </a>
        <a
          href={SOCIAL.email}
          onClick={(event) => {
            if (!isPlainClick(event)) return
            event.preventDefault()
            sendEmail()
          }}
          className="hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          Email
        </a>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-[12px] text-zinc-400">
        <p>
          © {year} {t.nav.name}. {t.footer.rights}
        </p>
        {typeof count === 'number' ? <p>{t.footer.visitors.replace('{count}', count.toLocaleString(lang))}</p> : null}
      </div>

    </Section>
  )
}

// The grid fills the whole block, from the dotted rule down to the bottom of the page, edge to edge of the column.
export function ExtraFooter() {
  return (
    <Section id="extra-footer">
      <div className="relative -mx-4 -mt-8 -mb-20 h-64">
        <DitherGrid />
      </div>
    </Section>
  )
}
