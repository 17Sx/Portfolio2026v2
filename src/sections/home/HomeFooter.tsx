import { SOCIAL } from '../../constants/social.ts'
import { useLanguage } from '../../i18n/LanguageContext.tsx'

export function HomeFooter() {
  const { t } = useLanguage()

  return (
    <footer className="mt-16 border-t border-white/15 pt-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/35">
        © {new Date().getFullYear()} {t.nav.name}. {t.footer.rights}
      </p>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 font-mono text-[10px] uppercase tracking-[0.15em] text-white/35">
        <a href={SOCIAL.github} target="_blank" rel="noreferrer" className="hover:text-white/60">
          GitHub
        </a>
        <a href={SOCIAL.linkedin} target="_blank" rel="noreferrer" className="hover:text-white/60">
          LinkedIn
        </a>
        <a href={SOCIAL.twitter} target="_blank" rel="noreferrer" className="hover:text-white/60">
          X
        </a>
        <a href={SOCIAL.email} className="hover:text-white/60">
          Email
        </a>
      </div>
    </footer>
  )
}
