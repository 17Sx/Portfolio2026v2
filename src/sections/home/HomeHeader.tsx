import { SOCIAL } from '../../constants/social.ts'
import { useLanguage } from '../../i18n/LanguageContext.tsx'
import { useTheme } from '../../hooks/useTheme.ts'

export function HomeHeader() {
  const { lang, setLang } = useLanguage()
  const { theme, setTheme } = useTheme()

  return (
    <header className="flex flex-wrap items-baseline justify-between">
      <a href="/" className="font-mono text-xl font-semibold uppercase tracking-widest text-ink">
        Sx
      </a>
      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-2 font-mono text-sm uppercase tracking-widest">
          <button
            type="button"
            onClick={() => setLang('en')}
            className={lang === 'en' ? 'text-ink' : 'text-ink/40 hover:text-ink/70'}
          >
            EN
          </button>
          <span className="text-ink/25">/</span>
          <button
            type="button"
            onClick={() => setLang('fr')}
            className={lang === 'fr' ? 'text-ink' : 'text-ink/40 hover:text-ink/70'}
          >
            FR
          </button>
        </div>
        <div className="flex items-center gap-2 font-mono text-sm uppercase tracking-widest">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={theme === 'light' ? 'text-ink' : 'text-ink/40 hover:text-ink/70'}
          >
            LT
          </button>
          <span className="text-ink/25">/</span>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={theme === 'dark' ? 'text-ink' : 'text-ink/40 hover:text-ink/70'}
          >
            DK
          </button>
        </div>
        <a
          href={SOCIAL.github}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-base tracking-wide text-ink/55 hover:text-ink/80"
        >
          @17Sx
        </a>
      </div>
    </header>
  )
}
