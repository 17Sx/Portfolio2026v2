import { SOCIAL } from '../../constants/social.ts'
import { useLanguage } from '../../i18n/LanguageContext.tsx'

export function HomeHeader() {
  const { lang, setLang } = useLanguage()

  return (
    <header className="flex flex-wrap items-baseline justify-between">
      <span className="font-mono text-xl font-semibold uppercase tracking-widest text-black">
        Sx
      </span>
      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-2 font-mono text-sm uppercase tracking-widest">
          <button
            type="button"
            onClick={() => setLang('en')}
            className={lang === 'en' ? 'text-black' : 'text-black/40 hover:text-black/70'}
          >
            EN
          </button>
          <span className="text-black/25">/</span>
          <button
            type="button"
            onClick={() => setLang('fr')}
            className={lang === 'fr' ? 'text-black' : 'text-black/40 hover:text-black/70'}
          >
            FR
          </button>
        </div>
        <a
          href={SOCIAL.github}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-base tracking-wide text-black/55 hover:text-black/80"
        >
          @17Sx
        </a>
      </div>
    </header>
  )
}

