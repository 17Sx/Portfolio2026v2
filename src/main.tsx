import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { LanguageProvider } from './i18n/LanguageContext.tsx'
import App from './App.tsx'
import './index.css'

fetch('/ascii/ascii-art.txt')
  .then((res) => (res.ok ? res.text() : Promise.reject()))
  .then((art) => {
    console.log(`%c${art}`, 'font-family: monospace')
    console.log('%c@17Sx — https://github.com/17Sx', 'font-family: monospace; opacity: 0.6')
  })
  .catch(() => {})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
)
