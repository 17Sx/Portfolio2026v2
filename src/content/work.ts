import type { Lang } from '../i18n/translations.ts'

export const SECTION_IDS = ['experience', 'projects', 'skills', 'github'] as const

export type SectionId = (typeof SECTION_IDS)[number]

type Copy = { en: string; fr: string }

export type Experience = {
  id: string
  monogram: string
  logo: string | null
  tile: 'light' | 'dark'
  logoFit?: 'cover'
  company: Copy
  role: Copy
  period: Copy
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
    company: { en: 'Impulse Lab', fr: 'Impulse Lab' },
    role: { en: 'Web developer · Internship', fr: 'Développeur web · Stage' },
    period: { en: 'Sep 2026 — Present', fr: 'Sep 2026 — Présent' },
    url: 'https://impulselab.ai',
    bullets: [
      {
        en: 'Custom apps, AI integrations, and products that actually reach production.',
        fr: 'Apps sur mesure, intégrations IA, et des produits qui partent vraiment en prod.',
      },
      {
        en: 'Interfaces that feel fast, and data models that stay honest.',
        fr: 'Des interfaces qui réagissent vite, et des modèles de données qui restent honnêtes.',
      },
    ],
    tags: [],
  },
  {
    id: 'altiora',
    monogram: 'AL',
    logo: '/logos/altiora.png',
    tile: 'dark',
    company: { en: 'Altiora', fr: 'Altiora' },
    role: { en: 'Founder & developer', fr: 'Fondateur développeur' },
    period: { en: 'May 2025 — Present', fr: 'Mai 2025 — Présent' },
    url: 'https://altiora.pro',
    bullets: [
      {
        en: 'A SaaS for trading, habits, goals and time — in one place.',
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
    logoFit: 'cover',
    company: { en: 'PALM MANAGING PROJECT', fr: 'PALM MANAGING PROJECT' },
    role: { en: 'Web developer · Apprenticeship', fr: 'Développeur web · Alternance' },
    period: { en: 'Apr 2025 — Sep 2026', fr: 'Avr 2025 — Sep 2026' },
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
    company: { en: 'Freelance', fr: 'Freelance' },
    role: { en: 'Full-stack developer', fr: 'Développeur full-stack' },
    period: { en: '2023 — Present', fr: '2023 — Présent' },
    url: null,
    bullets: [
      {
        en: 'Many projects shipped for clients, most of them private. A few examples:',
        fr: 'De nombreux projets livrés pour des clients, la plupart restés privés. Quelques exemples :',
      },
      {
        en: 'BKM Poker — bankroll management for poker players.',
        fr: 'BKM Poker — gestion de bankroll pour les joueurs de poker.',
      },
      {
        en: 'YH Trading — trade tracking and statistics.',
        fr: 'YH Trading — suivi des trades et des statistiques.',
      },
      {
        en: 'ghostnet_socket, a side project published in 2026.',
        fr: 'ghostnet_socket, un side project publié en 2026.',
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
    id: 'pmp-admin',
    name: { en: 'PMP Admin V3', fr: 'PMP Admin V3' },
    description: {
      en: 'Internal management back office, rebuilt during the apprenticeship.',
      fr: 'Back-office interne de gestion, refait pendant l’alternance.',
    },
    tech: ['React', 'Express', 'Prisma', 'MySQL'],
    year: '2025',
    url: null,
    github: null,
    status: 'internal',
  },
  {
    id: 'ata',
    name: { en: 'ATA', fr: 'ATA' },
    description: {
      en: 'Altiora Trading API, a backend for trading autojournaling. Stopped — MetaAPI and infra costs.',
      fr: 'Altiora Trading API, un backend d’autojournaling trading. Arrêté — coûts MetaAPI et infra.',
    },
    tech: ['TypeScript', 'Drizzle', 'Bun', 'MetaAPI'],
    year: '2025',
    url: null,
    github: 'https://github.com/AltioraPro/ATA',
    status: 'archived',
  },
  {
    id: 'ghostnet',
    name: { en: 'ghostnet_socket', fr: 'ghostnet_socket' },
    description: {
      en: 'Side project published on GitHub in 2026.',
      fr: 'Side project publié sur GitHub en 2026.',
    },
    tech: ['TypeScript'],
    year: '2026',
    url: null,
    github: 'https://github.com/17Sx/ghostnet_socket',
    status: 'live',
  },
]

export type SkillGroup = {
  id: string
  label: Copy
  items: { name: string; icon?: string }[]
}

export const skillGroups: SkillGroup[] = [
  {
    id: 'languages',
    label: { en: 'Languages', fr: 'Langages' },
    items: [
      { name: 'JavaScript', icon: 'logos:javascript' },
      { name: 'TypeScript', icon: 'logos:typescript-icon' },
      { name: 'Python', icon: 'logos:python' },
      { name: 'SQL', icon: 'mdi:database' },
    ],
  },
  {
    id: 'frontend',
    label: { en: 'Frontend', fr: 'Frontend' },
    items: [
      { name: 'React', icon: 'logos:react' },
      { name: 'Next.js', icon: 'logos:nextjs-icon' },
      { name: 'Tailwind CSS', icon: 'logos:tailwindcss-icon' },
      { name: 'TanStack Query', icon: 'logos:react-query-icon' },
      { name: 'React Email', icon: 'logos:react' },
    ],
  },
  {
    id: 'backend',
    label: { en: 'Backend', fr: 'Backend' },
    items: [
      { name: 'Node.js', icon: 'logos:nodejs-icon' },
      { name: 'Express', icon: 'simple-icons:express' },
      { name: 'oRPC', icon: 'mdi:api' },
      { name: 'tRPC', icon: 'logos:trpc' },
      { name: 'Better Auth', icon: 'mdi:lock-outline' },
    ],
  },
  {
    id: 'data',
    label: { en: 'Data', fr: 'Données' },
    items: [
      { name: 'PostgreSQL', icon: 'logos:postgresql' },
      { name: 'Drizzle', icon: 'simple-icons:drizzle' },
      { name: 'Neon', icon: 'logos:neon-icon' },
    ],
  },
  {
    id: 'ml',
    label: { en: 'ML & Vision', fr: 'ML & Vision' },
    items: [
      { name: 'PyTorch', icon: 'logos:pytorch-icon' },
      { name: 'PaddleOCR', icon: 'mdi:ocr' },
      { name: 'pdfplumber', icon: 'mdi:file-pdf-box' },
      { name: 'ONNX', icon: 'simple-icons:onnx' },
    ],
  },
  {
    id: 'infra',
    label: { en: 'Infra', fr: 'Infra' },
    items: [
      { name: 'Docker', icon: 'logos:docker-icon' },
      { name: 'Linux', icon: 'logos:linux-tux' },
      { name: 'Ubuntu', icon: 'logos:ubuntu' },
      { name: 'GitHub', icon: 'logos:github-icon' },
      { name: 'GitHub Actions', icon: 'logos:github-actions' },
      { name: 'Vercel', icon: 'logos:vercel-icon' },
    ],
  },
  {
    id: 'software',
    label: { en: 'Software', fr: 'Logiciels' },
    items: [
      { name: 'Cursor', icon: 'simple-icons:cursor' },
      { name: 'Postman', icon: 'logos:postman-icon' },
    ],
  },
]

export function resumeHref(lang: Lang) {
  return lang === 'fr' ? '/cv_fr.pdf' : '/cv_en.pdf'
}
