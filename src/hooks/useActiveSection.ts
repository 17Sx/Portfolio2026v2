import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

export function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState(ids[0] ?? '')
  // Les sections n'existent que sur l'accueil : on se réabonne à chaque changement de page
  const { pathname } = useLocation()

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null)
    if (elements.length === 0) {
      // Page sans sections (archive des expériences) : aucune entrée de l'index n'est active
      setActive('')
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        const top = visible[0]
        if (top?.target.id) setActive(top.target.id)
      },
      { rootMargin: '-15% 0px -60% 0px', threshold: [0.1, 0.3, 0.6] },
    )

    for (const element of elements) observer.observe(element)
    return () => observer.disconnect()
  }, [ids, pathname])

  return active
}
