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

/** Changement de langue demandé hors React (le shell de la console) : `detail` porte la langue */
export const LANG_EVENT = 'portfolio:lang'

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
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    // Écrit tout de suite, sans attendre l'effet : le shell de la console relit l'attribut dans le même tour
    document.documentElement.lang = l
    try {
      localStorage.setItem(STORAGE_KEY, l)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    function onLangEvent(event: Event) {
      if (!(event instanceof CustomEvent)) return
      const next: unknown = event.detail
      if (next === 'en' || next === 'fr') setLang(next)
    }
    window.addEventListener(LANG_EVENT, onLangEvent)
    return () => window.removeEventListener(LANG_EVENT, onLangEvent)
  }, [setLang])

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
