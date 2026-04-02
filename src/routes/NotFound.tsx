import { Link } from 'react-router-dom'
import { SOCIAL } from '../constants/social.ts'
import { useLanguage } from '../i18n/LanguageContext.tsx'

export default function NotFound() {
  const { t } = useLanguage()
  const n = t.notFound

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
      <p className="font-mono text-4xl font-medium uppercase tracking-[0.2em] text-white">{n.title}</p>
      <p className="mt-4 font-mono text-sm uppercase tracking-[0.15em] text-white/60">{n.subtitle}</p>
      <p className="mt-6 max-w-md font-mono text-xs uppercase leading-relaxed tracking-[0.1em] text-white/45">
        {n.description}
      </p>
      <Link
        to="/"
        className="mt-10 font-mono text-xs uppercase tracking-[0.2em] text-white underline decoration-white/30 underline-offset-4"
      >
        {n.back}
      </Link>
      <div className="mt-8 flex flex-wrap justify-center gap-6 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
        <a href="/#experience" className="hover:text-white/70">
          {n.links.experience}
        </a>
        <a href="/#projects" className="hover:text-white/70">
          {n.links.projects}
        </a>
        <a href="/#cv" className="hover:text-white/70">
          {n.links.cv}
        </a>
        <a href={SOCIAL.email} className="hover:text-white/70">
          {n.links.contact}
        </a>
      </div>
    </div>
  )
}
