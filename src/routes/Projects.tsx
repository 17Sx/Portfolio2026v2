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

function ProjectCard({
  project,
  index,
  lang,
}: {
  project: Project
  index: number
  lang: 'en' | 'fr'
}) {
  return (
    <div className="group relative flex flex-col justify-between p-6 sm:p-8 min-h-[220px] border border-black/10 bg-white transition-all duration-300 cursor-default overflow-hidden hover:border-black/25 hover:bg-black/[0.025]">
      {/* Large decorative index number */}
      <span
        className="pointer-events-none absolute -bottom-4 -right-2 font-mono font-semibold leading-none select-none text-black/[0.04] group-hover:text-black/[0.07] transition-all duration-300 text-[7rem] sm:text-[9rem]"
        aria-hidden
      >
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* Top row */}
      <div className="flex items-start justify-between gap-4 relative z-10">
        <div className="flex flex-col gap-3">
          <span className="font-mono text-[0.65rem] tracking-[0.25em] uppercase text-black/35 group-hover:text-black/50 transition-colors duration-300">
            {String(index + 1).padStart(2, '0')} — {project.year}
          </span>
          <h2 className="font-mono text-2xl sm:text-3xl font-semibold tracking-tight leading-none text-black">
            {project.name[lang]}
          </h2>
          <p className="font-mono text-xs leading-relaxed max-w-xs text-black/45 group-hover:text-black/60 transition-colors duration-300">
            {project.description[lang]}
          </p>
        </div>
      </div>

      {/* Bottom row */}
      <div className="flex items-end justify-between gap-4 mt-6 relative z-10">
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="font-mono text-[0.6rem] tracking-widest uppercase px-2 py-0.5 border border-black/10 text-black/40 group-hover:border-black/20 group-hover:text-black/55 transition-colors duration-300"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Links */}
        <div className="flex items-center gap-2 shrink-0">
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center w-8 h-8 border border-black/15 text-black/40 hover:border-black hover:text-black transition-all duration-200"
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
              className="flex items-center justify-center w-8 h-8 border border-black/15 text-black/40 hover:border-black hover:text-black font-mono text-base transition-all duration-200"
              title="Visit"
            >
              ↗
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Projects() {
  const { lang } = useLanguage()

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-8 pb-20 md:pb-6 h-full flex flex-col overflow-y-auto">
      {/* Section header */}
      <div className="flex items-center justify-between py-5 mb-6">
        <div className="flex items-center gap-4">
          <span className="font-mono text-[0.6rem] tracking-[0.3em] uppercase text-black/35">
            {lang === 'fr' ? 'Projets' : 'Projects'}
          </span>
          <span className="h-px w-12 bg-black/15" />
        </div>
        <span className="font-mono text-[0.6rem] tracking-widest text-black/25">
          {String(projects.length).padStart(2, '0')} TOTAL
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-black/8">
        {projects.map((project, i) => (
          <ProjectCard key={project.id} project={project} index={i} lang={lang} />
        ))}
      </div>
    </div>
  )
}
