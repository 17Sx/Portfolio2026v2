import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { copy, type Lang } from './translations.ts'

const STORAGE_KEY = 'portfolio-lang'

type Messages = (typeof copy)['en'] | (typeof copy)['fr']

type Ctx = {
  lang: Lang
  setLang: (l: Lang) => void
  toggleLang: () => void
  t: Messages
}

const LanguageContext = createContext<Ctx | null>(null)

function readStoredLang(): Lang {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'en' || v === 'fr') return v
  } catch {
    /* ignore */
  }
  return 'en'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => readStoredLang())

  useEffect(() => {
    document.documentElement.lang = lang === 'fr' ? 'fr' : 'en'
  }, [lang])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try {
      localStorage.setItem(STORAGE_KEY, l)
    } catch {
      /* ignore */
    }
  }, [])

  const toggleLang = useCallback(() => {
    setLang(lang === 'en' ? 'fr' : 'en')
  }, [lang, setLang])

  const t = copy[lang]

  const value = useMemo(
    () => ({ lang, setLang, toggleLang, t }),
    [lang, setLang, toggleLang, t],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
