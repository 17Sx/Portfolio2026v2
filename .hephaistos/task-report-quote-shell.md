## Scope
Repo: 17Sx/Portfolio2026v2, branch `feat/console-sx-shell` (HEAD). Prior art on `origin/dev`. `src/console/shell.ts` is new (not on `origin/dev`).

Commands: `git show origin/dev:src/main.tsx`; `git grep -n` on `origin/dev`; `git show origin/dev:<file>`; `git show b8c3bde7899a3518a8e68536b3d91a8eab640742:src/hooks/useTheme.ts` and `:src/i18n/LanguageContext.tsx`.

---

### 1. Console ascii-art easter egg

**shell.ts:** `installShell()` fetch + `boot()` `console.log` (~265–277, 289–292).

**Match — `git show origin/dev:src/main.tsx`:**

```
     4	import { LanguageProvider } from './i18n/LanguageContext.tsx'
     5	import App from './App.tsx'
     6	import './index.css'
     7	
     8	fetch('/ascii/ascii-art.txt')
     9	  .then((res) => (res.ok ? res.text() : Promise.reject()))
    10	  .then((art) => {
    11	    console.log(`%c${art}`, 'font-family: monospace')
    12	    console.log('%c@17Sx — https://github.com/17Sx', 'font-family: monospace; opacity: 0.6')
    13	  })
    14	  .catch(() => {})
```

Shell omits the second `@17Sx` log line.

---

### 2. Section title/label maps

**shell.ts:** `sectionLabels` 54–60 (inline EN/FR).

**Match A — `origin/dev:src/i18n/translations.ts`:**

```
    21	    index: {
    22	      label: 'Index',
    23	      experience: 'Experience',
    24	      projects: 'Projects',
    25	      skills: 'Stack',
    26	      github: 'GitHub',
    27	      music: 'Music',
    28	    },
```

```
   116	    index: {
   117	      label: 'Index',
   118	      experience: 'Expérience',
   119	      projects: 'Projets',
   120	      skills: 'Stack',
   121	      github: 'GitHub',
   122	      music: 'Musique',
   123	    },
```

**Match B — `origin/dev:src/components/CommandPalette.tsx`:**

```
    27	      onClose()
    28	      jump(id)
    29	    }
    30	
    31	    const sectionLabels: Record<(typeof SECTION_IDS)[number], string> = {
    32	      experience: t.index.experience,
    33	      projects: t.index.projects,
    34	      skills: t.index.skills,
    35	      github: t.index.github,
    36	      music: t.index.music,
    37	    }
    38	
    39	    return [
```

`SECTION_IDS`: `origin/dev:src/content/work.ts` lines 3–5.

---

### 3. Theme classList / localStorage outside useTheme.ts

**shell.ts:** `theme()` uses `getTheme`/`setTheme` (186–194). `rm()` uses `classList` for `sx-wipe` only, not theme.

**NO MATCHES** on `origin/dev` for theme `classList` or theme `localStorage` outside `src/hooks/useTheme.ts`.

Command: `git grep -n 'localStorage|classList' origin/dev -- '*.ts' '*.tsx'` → theme DOM/storage only in `useTheme.ts`; lang storage in `LanguageContext.tsx`.

---

### 4. Language toggle outside LanguageContext.tsx

**shell.ts:** `lang()` + `LANG_EVENT` (197–205); `currentLang()` reads `document.documentElement.lang` (34–36).

**Match — `origin/dev:src/components/PageFrame.tsx`:**

```
   185	            <div className="flex shrink-0 items-center gap-2 pt-1.5">
   186	              <div className="mr-1 flex items-center font-mono text-[11px] tracking-[0.16em]">
   187	                <button
   188	                  type="button"
   189	                  onClick={() => setLang('en')}
   190	                  className={lang === 'en' ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'}
   191	                >
   192	                  EN
   193	                </button>
   194	                <span className="mx-1 text-zinc-300 dark:text-zinc-600">/</span>
   195	                <button
   196	                  type="button"
   197	                  onClick={() => setLang('fr')}
```

**Match — `origin/dev:src/components/CommandPalette.tsx`:**

```
    55	      {
    56	        id: 'lang',
    57	        group: t.palette.preferences,
    58	        label: lang === 'en' ? 'Français' : 'English',
    59	        run: () => {
    60	          toggleLang()
    61	          onClose()
    62	        },
    63	      },
```

**NO MATCHES** on `origin/dev` for `LANG_EVENT` / `portfolio:lang` (`git grep` empty).

---

### 5. { en, fr } Copy helpers

**shell.ts:** `currentLang()` + `function t(copy: Copy)` (34–40).

**Match — `origin/dev:src/content/work.ts`:**

```
     3	export const SECTION_IDS = ['experience', 'projects', 'skills', 'github', 'music'] as const
     4	
     5	export type SectionId = (typeof SECTION_IDS)[number]
     6	
     7	type Copy = { en: string; fr: string }
     8	
     9	export type Experience = {
```

**Match — `field[lang]` pattern, `origin/dev:src/components/ExperienceItem.tsx`:**

```
    40	              className="text-[15px] font-semibold tracking-tight text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-50"
    41	            >
    42	              {entry.company[lang]}
    43	            </a>
    44	          ) : (
    45	            <p className="text-[15px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
    46	              {entry.company[lang]}
```

**Match — `resumeHref`, `origin/dev:src/content/work.ts`:**

```
   305	]
   306	
   307	export function resumeHref(lang: Lang) {
   308	  return lang === 'fr' ? '/cv_fr.pdf' : '/cv_en.pdf'
   309	}
```

**NO MATCHES** for standalone `function t(copy: Copy)` on `origin/dev`.

---

### 6. fetch('/api/deezer')

**shell.ts:** `music()` 153–170.

**Match — `origin/dev:src/hooks/useDeezer.ts`:**

```
    16	  const [state, setState] = useState<DeezerState>({ status: 'loading' })
    17	  useEffect(() => {
    18	    const controller = new AbortController()
    19	    fetch('/api/deezer', { signal: controller.signal })
    20	      .then((r) => r.json())
    21	      .then((d: { music?: DeezerMusic | null }) => {
    22	        setState(d.music ? { status: 'ready', music: d.music } : { status: 'empty' })
    23	      })
```

---

### 7. fetch('/ascii/ascii-art.txt')

Same as §1 (`origin/dev:src/main.tsx` 8–14); shell `installShell()` 289–292.

---

### 8. b8c3bde7899a3518a8e68536b3d91a8eab640742 quotes

**getInitialTheme — `src/hooks/useTheme.ts`:**

```
     3	type Theme = 'light' | 'dark'
     4	
     5	function getInitialTheme(): Theme {
     6	  try {
     7	    const stored = localStorage.getItem('theme')
     8	    if (stored === 'light' || stored === 'dark') return stored
     9	  } catch {
```

**apply — same file:**

```
    13	}
    14	
    15	function apply(theme: Theme) {
    16	  document.documentElement.classList.toggle('dark', theme === 'dark')
    17	  document
    18	    .querySelector('meta[name="theme-color"]')
    19	    ?.setAttribute('content', theme === 'dark' ? '#000000' : '#ffffff')
    20	  try {
    21	    localStorage.setItem('theme', theme)
    22	  } catch {
    23	    // ignore
    24	  }
    25	}
```

**LanguageProvider — `src/i18n/LanguageContext.tsx`:**

```
    38	export function LanguageProvider({ children }: { children: ReactNode }) {
    39	  const [lang, setLangState] = useState<Lang>(() => readStoredLang())
    40	
    41	  useEffect(() => {
    42	    document.documentElement.lang = lang === 'fr' ? 'fr' : 'en'
    43	  }, [lang])
    44	
    45	  const setLang = useCallback((l: Lang) => {
```

```
    54	  useEffect(() => {
    55	    function onLangEvent(event: Event) {
    56	      if (!(event instanceof CustomEvent)) return
    57	      const next: unknown = event.detail
    58	      if (next === 'en' || next === 'fr') setLang(next)
    59	    }
    60	    window.addEventListener(LANG_EVENT, onLangEvent)
    61	    return () => window.removeEventListener(LANG_EVENT, onLangEvent)
    62	  }, [setLang])
    63	
    64	  const toggleLang = useCallback(() => {
    65	    setLang(lang === 'en' ? 'fr' : 'en')
    66	  }, [lang, setLang])
    67	
    68	  const t = copy[lang]
    69	
    70	  const value = useMemo(
    71	    () => ({ lang, setLang, toggleLang, t }),
    72	    [lang, setLang, toggleLang, t],
    73	  )
    74	
    75	  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
```

At b8c3bde, `LANG_EVENT` listener is new vs `origin/dev`; `getInitialTheme`/`apply` match `origin/dev:useTheme.ts`.
