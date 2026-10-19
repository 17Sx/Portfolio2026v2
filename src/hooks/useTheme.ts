import { useSyncExternalStore } from 'react'

type Theme = 'light' | 'dark'

function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem('theme')
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // localStorage indisponible : on retombe sur la préférence système
  }
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function apply(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#000000' : '#ffffff')
  try {
    localStorage.setItem('theme', theme)
  } catch {
    // ignore
  }
}

// Une seule source de vérité pour tous les appelants (header, palette de commandes, bannière).
let current = getInitialTheme()
const listeners = new Set<() => void>()
apply(current)

function setTheme(theme: Theme) {
  current = theme
  apply(theme)
  for (const listener of listeners) listener()
}

function toggle() {
  setTheme(current === 'dark' ? 'light' : 'dark')
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, () => current)
  return { theme, toggle, setTheme }
}
