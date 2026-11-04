import type { Lang } from '../i18n/translations.ts'

export const SECTION_IDS = ['experience', 'projects', 'skills', 'github', 'music'] as const

export type SectionId = (typeof SECTION_IDS)[number]

export function isSectionId(value: unknown): value is SectionId {
  return SECTION_IDS.some((id) => id === value)
}

export type Copy = { en: string; fr: string }

export type Experience = {
  id: string
  monogram: string
  logo: string | null
  tile: 'light' | 'dark'
  logoFit?: 'cover'
  /** Couleur de la barre dans la frise du parcours : au moins 3:1 sur fond blanc et sur fond noir */
  color: string
  company: Copy
  role: Copy
  period: Copy
  /** Mois de début et de fin (YYYY-MM) pour la frise ; `end` à null = en cours */
  start: string
  end: string | null
  url: string | null
  bullets: Copy[]
  tags: string[]
  stats?: { value: string; label: Copy }[]
}

export const experiences: Experience[] = [
  {
    id: 'impulse-lab',
    monogram: 'IL',
    logo: '/logos/impulse.png',
    tile: 'light',
    color: '#3f7dfb',
    company: { en: 'Impulse Lab', fr: 'Impulse Lab' },
    role: { en: 'Software Engineer · Apprenticeship', fr: 'Ingénieur logiciel · Alternance' },
    period: { en: 'Sep 2026 - Present', fr: 'Sep 2026 - Présent' },
    start: '2026-09',
    end: null,
    url: 'https://impulselab.ai',
    bullets: [
      {
        en: 'Custom apps, AI integrations, and products.',
        fr: 'Apps sur mesure, intégrations IA.',
      },
      {
        en: 'Interfaces that feel fast.',
        fr: 'Des interfaces qui réagissent vite.',
      },  
    ],
    tags: [],
  },
  {
    id: 'altiora',
    monogram: 'AL',
    logo: '/logos/altiora.png',
    tile: 'dark',
    color: '#0f766e',
    company: { en: 'Altiora', fr: 'Altiora' },
    role: { en: 'Founder & Software Engineer', fr: 'Fondateur & ingénieur logiciel' },
    period: { en: 'May 2025 - Present', fr: 'Mai 2025 - Présent' },
    start: '2025-05',
    end: null,
    url: 'https://altiora.pro',
    bullets: [
      {
        en: 'A SaaS for trading, habits, goals and time, all in one place.',
        fr: 'Un SaaS pour le trading, les habitudes, les objectifs et le temps, au même endroit.',
      },
      {
        en: 'Next.js, Drizzle, Stripe, oRPC, Better Auth and Neon Postgres.',
        fr: 'Next.js, Drizzle, Stripe, oRPC, Better Auth et Neon Postgres.',
      },
    ],
    tags: ['Next.js', 'Drizzle', 'Stripe', 'oRPC', 'Better Auth', 'Neon'],
  },
  {
    id: 'pmp',
    monogram: 'PMP',
    logo: '/logos/pmp.png',
    tile: 'dark',
    color: '#d97706',
    logoFit: 'cover',
    company: { en: 'PALM MANAGING PROJECT', fr: 'PALM MANAGING PROJECT' },
    role: { en: 'Software Engineer · Apprenticeship', fr: 'Ingénieur logiciel · Alternance' },
    period: { en: 'Apr 2025 - Sep 2026', fr: 'Avr 2025 - Sep 2026' },
    start: '2025-04',
    end: '2026-09',
    url: null,
    bullets: [
      {
        en: 'Rebuilt the internal management back office in React, Express, Prisma and MySQL.',
        fr: 'Back-office interne de gestion refait en React, Express, Prisma et MySQL.',
      },
      {
        en: 'Shipped U-Labs, a dentist portal for ordering and tracking medical samples.',
        fr: 'Livraison d’U-Labs, un portail dentiste pour commander et suivre des échantillons médicaux.',
      },
    ],
    tags: ['React', 'Express', 'Prisma', 'MySQL', 'TypeScript'],
    stats: [
      {
        value: '20k+',
        label: { en: 'Dentists on U-Labs', fr: 'Dentistes sur U-Labs' },
      },
    ],
  },
  {
    id: 'freelance',
    monogram: 'FX',
    logo: '/logos/freelance.svg',
    tile: 'dark',
    color: '#7c3aed',
    company: { en: 'Freelance', fr: 'Freelance' },
    role: { en: 'Software Engineer', fr: 'Ingénieur logiciel' },
    period: { en: '2023 - Present', fr: '2023 - Présent' },
    start: '2023-01',
    end: null,
    url: null,
    bullets: [
      {
        en: 'Many projects shipped for clients, most of them private. A few examples:',
        fr: 'De nombreux projets livrés pour des clients, la plupart restés privés. Quelques exemples :',
      },
      {
        en: 'BKM Poker: bankroll management for poker players.',
        fr: 'BKM Poker : gestion de bankroll pour les joueurs de poker.',
      },
      {
        en: 'YH Trading: trade tracking and statistics.',
        fr: 'YH Trading : suivi des trades et des statistiques.',
      },
    ],
    tags: ['Next.js', 'React', 'TypeScript', 'Supabase'],
  },
]

export type ProjectStatus = 'live' | 'archived' | 'internal'

export type Project = {
  id: string
  name: Copy
  description: Copy
  tech: string[]
  year: string
  url: string | null
  github: string | null
  status: ProjectStatus
  image?: string
}

export const projects: Project[] = [
  {
    id: 'impulse-lab',
    name: { en: 'Impulse Lab', fr: 'Impulse Lab' },
    description: {
      en: 'Impulse Lab’s website. I ship the entire internal back office, so the team runs everything from the same site.',
      fr: 'Le site d’Impulse Lab. Je ship l’intégralité du back-office interne, pour que l’équipe gère tout depuis le même site.',
    },
    tech: ['Next.js', 'Vercel', 'oRPC', 'AlignUI'],
    year: '2026',
    url: 'https://impulselab.ai',
    github: "https://github.com/impulse-studio",
    status: 'live',
    image: '/projects/impulse.jpg',
  },
  {
    id: 'altiora',
    name: { en: 'Altiora', fr: 'Altiora' },
    description: {
      en: 'SaaS to optimize trading, build better habits, hit goals, and manage time in one place.',
      fr: 'SaaS pour optimiser le trading, de meilleures habitudes, atteindre ses objectifs et maîtriser le temps, au même endroit.',
    },
    tech: ['Next.js', 'Drizzle', 'Stripe', 'oRPC', 'Better Auth', 'Neon'],
    year: '2025',
    url: 'https://altiora.pro',
    github: null,
    status: 'live',
    image: '/projects/altiora.jpg',
  },
  {
    id: 'bkm',
    name: { en: 'BKM Poker', fr: 'BKM Poker' },
    description: {
      en: 'SaaS for poker players to manage a bankroll from end to end.',
      fr: 'SaaS pour les joueurs de poker, pour gérer une bankroll de bout en bout.',
    },
    tech: ['React', 'Next.js', 'Tailwind', 'Supabase'],
    year: '2025',
    url: 'https://bkm-nine.vercel.app/',
    github: 'https://github.com/17Sx/BKM-Poker',
    status: 'live',
    image: '/projects/bkm.jpg',
  },
  {
    id: 'altiora-discord-bot',
    name: { en: 'Altiora Discord Bot (oss version)', fr: 'Altiora Discord Bot (oss version)' },
    description: {
      en: 'Open source community edition of Altiora’s Discord bot: deepwork voice sessions and role sync over webhooks.',
      fr: 'Édition communautaire open source du bot Discord d’Altiora : sessions de deepwork en vocal et synchro des rôles par webhooks.',
    },
    tech: ['TypeScript', 'discord.js', 'Bun', 'oRPC'],
    year: '2026',
    url: null,
    github: 'https://github.com/AltioraPro/discord-bot-oss',
    status: 'live',
  },
]

export type Tool = { id: string; name: string; icon: string }

/** Outils de la phrase Stack : chaque `id` correspond à un `{id}` dans t.skills.sentence */
export const shipStack: Tool[] = [
  { id: 'next', name: 'Next.js', icon: 'logos:nextjs-icon' },
  { id: 'tailwind', name: 'Tailwind CSS', icon: 'logos:tailwindcss-icon' },
  { id: 'shadcn', name: 'shadcn/ui', icon: 'simple-icons:shadcnui' },
  { id: 'postgres', name: 'PostgreSQL', icon: 'logos:postgresql' },
  { id: 'neon', name: 'Neon', icon: 'logos:neon-icon' },
  { id: 'drizzle', name: 'Drizzle', icon: 'simple-icons:drizzle' },
  { id: 'trpc', name: 'tRPC', icon: 'logos:trpc' },
  { id: 'cursor', name: 'Cursor', icon: 'simple-icons:cursor' },
]

export function resumeHref(lang: Lang) {
  return lang === 'fr' ? '/cv_fr.pdf' : '/cv_en.pdf'
}
