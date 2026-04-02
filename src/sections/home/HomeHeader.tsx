import { SOCIAL } from '../../constants/social.ts'
import { useLanguage } from '../../i18n/LanguageContext.tsx'

export function HomeHeader() {
  const { t, lang, setLang } = useLanguage()

  return (
    <header className="flex flex-wrap items-baseline justify-between">
      <span className="font-mono text-base font-medium uppercase tracking-[0.2em] text-white sm:text-lg">
        {t.nav.name}
      </span>
      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em]">
          <button
            type="button"
            onClick={() => setLang('en')}
            className={lang === 'en' ? 'text-white' : 'text-white/40 hover:text-white/70'}
          >
            EN
          </button>
          <span className="text-white/25">/</span>
          <button
            type="button"
            onClick={() => setLang('fr')}
            className={lang === 'fr' ? 'text-white' : 'text-white/40 hover:text-white/70'}
          >
            FR
          </button>
        </div>
        <a
          href={SOCIAL.github}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-sm uppercase tracking-[0.15em] text-white/50 hover:text-white/80"
        >
          @17Sx
        </a>
      </div>
    </header>
  )
}
