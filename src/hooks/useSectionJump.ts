import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

// Les sections vivent sur l'accueil : depuis une autre page, on y retourne et Home défile jusqu'au hash
export function useSectionJump() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return useCallback(
    (id: string) => {
      if (pathname !== '/') {
        navigate({ pathname: '/', hash: id })
        return
      }
      navigate({ hash: id }, { replace: true })
      // Sans `behavior` : le défilement doux vient du CSS, qui respecte prefers-reduced-motion
      document.getElementById(id)?.scrollIntoView({ block: 'start' })
    },
    [navigate, pathname],
  )
}
