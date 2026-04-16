import { Route, Routes } from 'react-router-dom'
import Home from './routes/Home.tsx'
import Projects from './routes/Projects.tsx'
import Stack from './routes/Stack.tsx'
import NotFound from './routes/NotFound.tsx'
import Root from './routes/Root.tsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Root />}>
        <Route index element={<Home />} />
        <Route path="projects" element={<Projects />} />
        <Route path="stack" element={<Stack />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
