import { Icon } from '@iconify/react'
import { useLanguage } from '../i18n/LanguageContext.tsx'

type Project = {
  id: string
  name: { en: string; fr: string }
  description: { en: string; fr: string }
  tech: string[]
  year: string
  url: string | null
  github: string | null
  /** Pas de lien public : affiche un cadenas (ex. dépôt entreprise). */
  githubLocked?: boolean
}

const projects: Project[] = [
  {
    id: 'altiora',
    name: { en: 'Altiora', fr: 'Altiora' },
    description: {
      en: 'SaaS platform empowering users to optimize trading, build better habits, achieve goals, and master time management all in one place.',
      fr: "Plateforme SaaS pour optimiser le trading, de meilleures habitudes, atteindre ses objectifs et maîtriser le temps, le tout au même endroit.",
    },
    tech: [
      'Next.js',
      'Drizzle ORM',
      'Stripe',
      'oRPC',
      'Better Auth',
      'Neon Postgres',
    ],
    year: '2025',
    url: 'https://altiora.pro',
    github: 'https://github.com/AltioraPro/altiora',
  },
  {
    id: 'bkm',
    name: { en: 'BKM Poker', fr: 'BKM Poker' },
    description: {
      en: 'SaaS platform for poker players to manage their entire bankroll efficiently.',
      fr: 'Plateforme SaaS pour les joueurs de poker afin de gérer leur bankroll efficacement.',
    },
    tech: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Supabase'],
    year: '2025',
    url: 'https://bkm-nine.vercel.app/',
    github: 'https://github.com/17Sx/BKM-Poker',
  },
  {
    id: 'yh',
    name: { en: 'YH Trading', fr: 'YH Trading' },
    description: {
      en: 'A trading platform for traders to manage their entire trades with tracker and statistics.',
      fr: 'Plateforme de trading pour suivre les trades, les statistiques et le suivi des positions.',
    },
    tech: ['TypeScript', 'Next.js', 'Tailwind CSS', 'Supabase'],
    year: '2025',
    url: 'https://yhtrading.vercel.app',
    github: 'https://github.com/17Sx/YH-Trading',
  },
  {
    id: 'pmp-admin-v3',
    name: { en: 'PMP Admin V3', fr: 'PMP Admin V3' },
    description: {
      en: 'Internal PMP management back office I rebuilt for my company (React, Express, Prisma, MySQL).',
      fr: 'Back-office interne de gestion PMP que j’ai refait pour ma boîte (React, Express, Prisma, MySQL).',
    },
    tech: ['React', 'Express', 'Prisma', 'MySQL'],
    year: '2025',
    url: null,
    github: null,
    githubLocked: true,
  },
  {
    id: 'ulabs',
    name: { en: 'U-Labs Dentist', fr: 'U-Labs Dentiste' },
    description: {
      en: 'Dentist-facing portal for ordering and managing medical samples, used by 20,000+ dentists (live demo).',
      fr: 'Portail dentiste pour la commande et la gestion d’échantillons médicaux, utilisé par plus de 20 000 dentistes (démo en ligne).',
    },
    tech: [
      'Node.js',
      'Express',
      'TypeScript',
      'React',
      'Tailwind CSS',
      'MySQL',
      'JWT',
      'PM2',
    ],
    year: '2025',
    url: 'https://ulabs-dentiste.pmp.fr/',
    github: null,
  },
  {
    id: 'portfolio24',
    name: { en: 'Portfolio 2024', fr: 'Portfolio 2024' },
    description: {
      en: 'This project showcases my first personal website portfolio, highlighting my skills and experiences as a developer and my first step to learn Three.js.',
      fr: 'Premier site portfolio : compétences, expériences, et première approche de Three.js.',
    },
    tech: ['HTML', 'SCSS', 'Three.js', 'JavaScript'],
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
  const privateRepoHint =
    lang === 'fr'
      ? 'Dépôt interne, pas de lien public.'
      : 'Internal repo, no public link.'

  return (
    <div className="relative flex flex-col justify-between min-h-[180px] sm:min-h-[200px] p-6 sm:p-8 border border-black/10 bg-white cursor-default overflow-hidden">
      {/* Large decorative index number */}
      <span
        className="pointer-events-none absolute -bottom-3 -right-1 font-mono font-semibold leading-none select-none text-black/[0.04] text-[5rem] sm:text-[6rem]"
        aria-hidden
      >
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* Top row */}
      <div className="flex items-start justify-between gap-4 relative z-10">
        <div className="flex flex-col gap-2.5 min-w-0">
          <span className="font-mono text-[0.55rem] tracking-[0.22em] uppercase text-black/35">
            {String(index + 1).padStart(2, '0')} · {project.year}
          </span>
          <h2 className="font-mono text-xl sm:text-2xl font-semibold tracking-tight leading-tight text-black">
            {project.name[lang]}
          </h2>
          <p className="font-mono text-[0.7rem] leading-relaxed text-black/45 line-clamp-5">
            {project.description[lang]}
          </p>
        </div>
      </div>

      {/* Bottom row */}
      <div className="flex items-end justify-between gap-3 mt-6 relative z-10">
        <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
          {project.tech.map((tag) => (
            <span
              key={tag}
              className="font-mono text-[0.52rem] tracking-wider uppercase px-2 py-0.5 border border-black/10 text-black/40"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Links */}
        <div className="flex items-center gap-2 shrink-0">
          {project.githubLocked && (
            <span
              className="flex items-center justify-center w-8 h-8 shrink-0 border border-dashed border-black/25 text-black/45 cursor-default"
              title={privateRepoHint}
              role="img"
              aria-label={privateRepoHint}
            >
              <Icon icon="mdi:lock-outline" className="w-4 h-4" aria-hidden />
            </span>
          )}
          {project.github && !project.githubLocked && (
            <a
              href={project.github}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center w-8 h-8 border border-black/15 text-black/40 transition-all duration-200 hover:border-black hover:text-black hover:scale-105 active:scale-95"
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
              className="flex items-center justify-center w-8 h-8 border border-black/15 text-black/40 font-mono text-base transition-all duration-200 hover:border-black hover:text-black hover:scale-105 active:scale-95"
              title={lang === 'fr' ? 'Voir la démo' : 'Visit demo'}
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
    <div className="h-full min-h-0 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div className="min-h-full flex flex-col justify-center py-4 md:py-6">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-8 lg:px-12 pb-20 md:pb-4">
          {/* Section header */}
          <div className="flex items-center justify-between py-2 mb-2 md:mb-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[0.55rem] tracking-[0.28em] uppercase text-black/35">
                {lang === 'fr' ? 'Projets' : 'Projects'}
              </span>
            </div>
            <span className="font-mono text-[0.55rem] tracking-widest text-black/25">
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
      </div>
    </div>
  )
}
