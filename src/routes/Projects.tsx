import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { useLanguage } from '../i18n/LanguageContext.tsx'

type Project = {
  id: string
  name: { en: string; fr: string }
  description: { en: string; fr: string }
  tags: string[]
  year: string
  url: string | null
  github: string | null
}

const projects: Project[] = [
  {
    id: 'altiora',
    name: { en: 'Altiora', fr: 'Altiora' },
    description: {
      en: 'SaaS platform empowering users to optimize trading, build better habits, achieve goals, and master time management—all in one place.',
      fr: "Plateforme SaaS permettant aux utilisateurs d'optimiser le trading, de construire de meilleures habitudes, d'atteindre des objectifs et de maîtriser la gestion du temps — tout en un seul endroit.",
    },
    tags: ['Next.js', 'PostgreSQL', 'SaaS'],
    year: '2025',
    url: 'https://altiora.pro',
    github: null,
  },
  {
    id: 'bkm',
    name: { en: 'BKM Poker', fr: 'BKM Poker' },
    description: {
      en: 'Online poker league platform with player rankings, seasons and live stats.',
      fr: 'Plateforme de ligue de poker en ligne avec classements joueurs, saisons et stats live.',
    },
    tags: ['Next.js', 'Drizzle', 'Neon'],
    year: '2025',
    url: 'https://bkm-nine.vercel.app/',
    github: 'https://github.com/17Sx/bkm-poker',
  },
  {
    id: 'yh',
    name: { en: 'YH Trading', fr: 'YH Trading' },
    description: {
      en: 'Trading dashboard with portfolio tracking and market data visualization.',
      fr: 'Dashboard de trading avec suivi de portefeuille et visualisation de données marché.',
    },
    tags: ['React', 'TanStack Query', 'Tailwind'],
    year: '2025',
    url: 'https://yhtrading.vercel.app',
    github: 'https://github.com/17Sx/yh-trading',
  },
  {
    id: 'portfolio24',
    name: { en: 'Portfolio 2024', fr: 'Portfolio 2024' },
    description: {
      en: 'First iteration of my personal portfolio.',
      fr: 'Première itération de mon portfolio personnel.',
    },
    tags: ['HTML', 'CSS', 'JS'],
    year: '2024',
    url: 'https://17sx.github.io/Portfolio_2024/',
    github: 'https://github.com/17Sx/Portfolio_2024',
  },
]

export default function Projects() {
  const { lang } = useLanguage()

  return (
    <div className="mx-auto max-w-5xl px-8 py-6 h-full flex flex-col">
      <header className="flex items-baseline justify-between">
        <Link to="/" className="font-mono text-xl font-semibold uppercase tracking-widest text-black">
          Sx
        </Link>
      </header>

      <div className="flex-1 flex flex-col justify-center">
        <div className="flex flex-col">
          {projects.map((project, i) => (
            <div
              key={project.id}
              className="group flex items-center gap-6 border-t border-black/10 py-5 px-4 -mx-4 transition-colors duration-200 hover:bg-black/[0.03]"
            >
              <span className="font-mono text-xs tracking-widest text-black/25 group-hover:text-black/30 w-6 shrink-0 transition-colors duration-200">
                {String(i + 1).padStart(2, '0')}
              </span>

              <div className="flex flex-1 items-center justify-between gap-4 min-w-0">
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="font-mono text-xl font-semibold text-black group-hover:text-black transition-colors duration-200">
                    {project.name[lang]}
                  </span>
                  <span className="font-mono text-sm text-black/45 group-hover:text-black/50 transition-colors duration-200 truncate">
                    {project.description[lang]}
                  </span>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="hidden sm:flex gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-xs tracking-wide text-black/35 group-hover:text-black/40 border border-black/10 group-hover:border-black/25 px-2 py-0.5 transition-colors duration-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <span className="font-mono text-xs tracking-widest text-black/30 group-hover:text-black/35 transition-colors duration-200">
                    {project.year}
                  </span>

                  <div className="flex items-center gap-2">
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-center w-8 h-8 border border-black/10 group-hover:border-black/25 text-black/35 group-hover:text-black/50 hover:!text-black hover:!bg-black/5 transition-colors duration-150"
                        title="GitHub"
                      >
                        <Icon icon="logos:github-icon" className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-center w-8 h-8 border border-black/10 group-hover:border-black/25 text-black/35 group-hover:text-black/50 hover:!text-black hover:!bg-black/5 transition-colors duration-150 font-mono text-sm"
                        title="Visit"
                      >
                        ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className="border-t border-black/10" />
        </div>
      </div>
    </div>
  )
}
