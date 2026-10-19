import { useEffect, useState } from 'react'
import { SOCIAL } from '../constants/social.ts'
import { useClock } from '../hooks/useClock.ts'
import { useLanguage } from '../i18n/LanguageContext.tsx'
import { useTheme } from '../hooks/useTheme.ts'
import { CommandPalette } from './CommandPalette.tsx'
import { MoonIcon, SunIcon } from './icons.tsx'
import { IndexNav } from './IndexNav.tsx'
import { Outlet } from 'react-router-dom'

const column = 'right-0 left-0 md:right-[30%] md:left-[30%]'

function Colon() {
  return (
    <span className="mx-1 flex -translate-y-px flex-col gap-1.5" aria-hidden>
      <span className="size-[2px] rounded-full bg-current" />
      <span className="size-[2px] rounded-full bg-current" />
    </span>
  )
}

function BannerClock() {
  const time = useClock()
  const label = `${time.h}:${time.m}:${time.s}`

  return (
    <div
      className="absolute right-4 bottom-4 flex items-center text-zinc-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)] dark:text-zinc-100 dark:drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]"
      aria-label={label}
    >
      <span className="font-doto text-[24px] leading-none font-bold tracking-[0.14em]">{time.h}</span>
      <Colon />
      <span className="font-doto text-[24px] leading-none font-bold tracking-[0.14em]">{time.m}</span>
      <Colon />
      <span className="font-doto text-[24px] leading-none font-bold tracking-[0.14em]">{time.s}</span>
    </div>
  )
}

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

function BannerMedia({ theme }: { theme: 'light' | 'dark' }) {
  const [still, setStill] = useState(() => matchMedia(REDUCED_MOTION).matches)
  const poster = `/banner/wanderer-${theme}.jpg`
  const media = 'h-full w-full object-cover object-center'

  useEffect(() => {
    const query = matchMedia(REDUCED_MOTION)
    const onChange = () => setStill(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  if (still) return <img src={poster} alt="" className={media} />

  return (
    <video
      key={theme}
      src={`/banner/wanderer-${theme}.mp4`}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      disablePictureInPicture
      disableRemotePlayback
      aria-hidden
      className={media}
    />
  )
}

function isMac() {
  return /Mac|iPhone|iPad/.test(navigator.platform)
}

export function PageFrame() {
  const { t, lang, setLang } = useLanguage()
  const { theme, toggle } = useTheme()
  const [palette, setPalette] = useState(false)
  const [mac, setMac] = useState(true)

  useEffect(() => {
    setMac(isMac())
  }, [])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setPalette((open) => !open)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <IndexNav />
      <CommandPalette open={palette} onClose={() => setPalette(false)} />
      <div className="relative min-h-screen overflow-x-hidden bg-white text-zinc-800 antialiased dark:bg-black dark:text-zinc-100">
        <div
          aria-hidden
          className="rule-dots rule-dots-y pointer-events-none absolute inset-y-0 left-[30%] hidden -translate-x-1/2 md:block"
        />
        <div
          aria-hidden
          className="rule-dots rule-dots-y pointer-events-none absolute inset-y-0 right-[30%] hidden -translate-x-1/2 md:block"
        />

        <div className={`absolute top-0 ${column} z-0 h-[var(--banner-h)] overflow-hidden bg-zinc-100 dark:bg-black`}>
          <BannerMedia theme={theme} />
          <BannerClock />
        </div>

        <header className={`absolute top-[var(--banner-h)] ${column} z-40 flex h-[var(--profile-h)] items-stretch px-4`}>
          <div className="flex h-full w-full items-start justify-between gap-3">
            <div className="flex h-full min-w-0 items-end gap-3.5 sm:gap-4">
              <a
                href={SOCIAL.github}
                target="_blank"
                rel="noreferrer"
                className="relative z-10 mb-1 size-[72px] shrink-0 -translate-y-16 overflow-hidden rounded-xl border border-black/10 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] sm:size-[88px] dark:border-white/15"
              >
                <img src={`${SOCIAL.github}.png`} alt="" className="h-full w-full object-cover" />
              </a>
              <div className="min-w-0 pb-3">
                <h1 className="text-[22px] leading-none font-bold tracking-tight text-zinc-900 [text-shadow:-1.5px_0_0_rgba(0,200,255,0.35),1.5px_0_0_rgba(255,80,0,0.35)] sm:text-[24px] dark:text-zinc-50 dark:[text-shadow:-1.5px_0_0_rgba(0,200,255,0.65),1.5px_0_0_rgba(255,80,0,0.65)]">
                  {t.nav.name}
                </h1>
                <p className="mt-1 truncate text-[13px] text-zinc-500">{t.profile.role}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 pt-1.5">
              <div className="mr-1 flex items-center font-mono text-[11px] tracking-[0.16em]">
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={lang === 'en' ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'}
                >
                  EN
                </button>
                <span className="mx-1 text-zinc-300 dark:text-zinc-600">/</span>
                <button
                  type="button"
                  onClick={() => setLang('fr')}
                  className={lang === 'fr' ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'}
                >
                  FR
                </button>
              </div>
              <button
                type="button"
                onClick={() => setPalette(true)}
                aria-haspopup="dialog"
                aria-label={t.palette.label}
                className="inline-flex items-center gap-1 rounded-md border border-black/10 bg-zinc-50 px-1.5 py-1 text-[11px] text-zinc-500 transition hover:border-black/20 hover:text-zinc-800 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
              >
                <span className="px-0.5">{mac ? '⌘' : 'Ctrl'}</span>
                <span className="rounded bg-black/5 px-1 py-px dark:bg-white/10">K</span>
              </button>
              <button
                type="button"
                onClick={toggle}
                aria-label={t.theme}
                aria-pressed={theme === 'dark'}
                className="flex size-7 items-center justify-center text-zinc-500 transition hover:text-zinc-900 dark:hover:text-zinc-200"
              >
                {theme === 'dark' ? <SunIcon className="size-[18px]" /> : <MoonIcon className="size-[18px]" />}
              </button>
            </div>
          </div>
        </header>

        <main className="relative z-10 px-4 pt-[calc(var(--banner-h)+var(--profile-h)+8px)] pb-20 md:mr-[30%] md:ml-[30%]">
          <Outlet />
        </main>
      </div>
    </>
  )
}
