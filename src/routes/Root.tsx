import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPageview } from '../analytics/tracker.ts'
import { PageFrame } from '../components/PageFrame.tsx'

export default function Root() {
  const { pathname } = useLocation()
  useEffect(() => trackPageview(pathname), [pathname])

  return <PageFrame />
}
