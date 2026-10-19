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
      window.history.replaceState(null, '', `#${id}`)
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    },
    [navigate, pathname],
  )
}
