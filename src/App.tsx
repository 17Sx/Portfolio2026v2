import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './routes/Home.tsx'
import Experience from './routes/Experience.tsx'
import Projects from './routes/Projects.tsx'
import Stack from './routes/Stack.tsx'
import NotFound from './routes/NotFound.tsx'
import Root from './routes/Root.tsx'

// stats.17sx.me (or stats.localhost in development) serves the analytics dashboard.
const StatsApp = lazy(() => import('./stats/StatsApp.tsx'))
const isStatsHost = location.hostname.startsWith('stats.')

export default function App() {
  if (isStatsHost) {
    return (
      <Suspense fallback={null}>
        <StatsApp />
      </Suspense>
    )
  }

  return (
    <Routes>
      <Route element={<Root />}>
        <Route index element={<Home />} />
        <Route path="experience" element={<Experience />} />
        <Route path="projects" element={<Projects />} />
        <Route path="stack" element={<Stack />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
