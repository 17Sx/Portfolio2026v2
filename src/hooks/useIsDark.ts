import { useSyncExternalStore } from 'react'

// Suit la classe `dark` posée sur <html> par useTheme, quel que soit le composant qui l'a changée
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  return () => observer.disconnect()
}

function getSnapshot() {
  return document.documentElement.classList.contains('dark')
}

export function useIsDark() {
  return useSyncExternalStore(subscribe, getSnapshot)
}
