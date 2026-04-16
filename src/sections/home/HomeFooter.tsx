import { SOCIAL } from '../../constants/social.ts'
import { useLanguage } from '../../i18n/LanguageContext.tsx'
import { useClock } from '../../hooks/useClock.ts'
import { useVisitorCount } from '../../hooks/useVisitorCount.ts'

export function HomeFooter() {
  const { t } = useLanguage()
  const time = useClock()
  const count = useVisitorCount()

  return (
    <footer className="border-t border-black/15 pt-5">
      <div className="flex flex-row justify-between">
      <p className="font-mono text-sm tracking-wide text-black/45">
        © {new Date().getFullYear()} {t.nav.name}. {t.footer.rights}
      </p>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-sm uppercase tracking-widest text-black/45">
        <a href={SOCIAL.github} target="_blank" rel="noreferrer" className="hover:text-black/70">
          GitHub
        </a>
        <a href={SOCIAL.linkedin} target="_blank" rel="noreferrer" className="hover:text-black/70">
          LinkedIn
        </a>
        <a href={SOCIAL.twitter} target="_blank" rel="noreferrer" className="hover:text-black/70">
          X
        </a>
        <a href={SOCIAL.email} className="hover:text-black/70">
          Email
        </a>
      </div>
      </div>
      <div className="mt-3 flex items-center justify-between font-mono text-xs tracking-wide text-black/30">
        <span>{time}</span>
        {count !== null && <span>{count.toLocaleString()} visitors</span>}
      </div>
    </footer>
  )
}
