import { Link } from 'react-router-dom'
import { SOCIAL } from '../constants/social.ts'
import { useLanguage } from '../i18n/LanguageContext.tsx'

export default function NotFound() {
  const { t } = useLanguage()
  const n = t.notFound

  return (
    <div className="flex h-full flex-col items-center justify-center px-4 sm:px-6 py-16 text-center pb-20 md:pb-16">
      <p className="font-mono text-4xl font-semibold text-black">{n.title}</p>
      <p className="mt-4 font-mono text-sm uppercase tracking-widest text-black/60">{n.subtitle}</p>
      <p className="mt-4 max-w-md font-mono text-sm leading-relaxed text-black/45">
        {n.description}
      </p>
      <Link
        to="/"
        className="mt-10 font-mono text-sm uppercase tracking-widest text-black underline decoration-black/30 underline-offset-4 hover:decoration-black/60"
      >
        {n.back}
      </Link>
      <div className="mt-6 flex flex-wrap justify-center gap-6 font-mono text-xs uppercase tracking-widest text-black/35">
        <a href="/#experience" className="hover:text-black/60">{n.links.experience}</a>
        <Link to="/projects" className="hover:text-black/60">{n.links.projects}</Link>
        <Link to="/stack" className="hover:text-black/60">Stack</Link>
        <a href={SOCIAL.email} className="hover:text-black/60">{n.links.contact}</a>
      </div>
    </div>
  )
}
