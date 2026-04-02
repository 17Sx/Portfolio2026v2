export type Lang = 'en' | 'fr'

export type ListedItem = {
  id: string
  en: string
  fr: string
  url: string | null
}

export type ExperienceEntry = {
  id: string
  company: { en: string; fr: string }
  role: { en: string; fr: string }
  period: { en: string; fr: string }
  /** Lien optionnel sur le nom de l’entreprise / structure */
  url: string | null
}

export const experienceEntries: ExperienceEntry[] = [
  {
    id: 'pmp',
    company: {
      en: 'PMP (Palm Managing Project)',
      fr: 'PMP (Palm Managing Project)',
    },
    role: { en: 'Full-stack developer', fr: 'Développeur full-stack' },
    period: { en: '2024 — present', fr: '2024 — présent' },
    url: null,
  },
  {
    id: 'altiora',
    company: { en: 'Altiora', fr: 'Altiora' },
    role: { en: 'Founder & developer', fr: 'Fondateur & développeur' },
    period: { en: '2025 — Present', fr: '2025 — Présent' },
    url: 'https://altiora.pro',
  },
  {
    id: 'freelance',
    company: { en: 'Freelance', fr: 'Freelance' },
    role: { en: 'Full-stack developer', fr: 'Développeur full-stack' },
    period: { en: '2023 — Present', fr: '2023 — Présent' },
    url: null,
  },
]

export const projectItems: ListedItem[] = [
  { id: 'altiora', en: 'Altiora', fr: 'Altiora', url: 'https://altiora.pro' },
  {
    id: 'bkm',
    en: 'BKM Poker — 2025',
    fr: 'BKM Poker — 2025',
    url: 'https://bkm-nine.vercel.app/',
  },
  {
    id: 'yh',
    en: 'YH Trading — 2025',
    fr: 'YH Trading — 2025',
    url: 'https://yhtrading.vercel.app',
  },
  {
    id: 'portfolio24',
    en: 'First Portfolio — 2024',
    fr: 'Premier Portfolio — 2024',
    url: 'https://17sx.github.io/Portfolio_2024/',
  },
]

export type StackCategory = {
  id: string
  label: { en: string; fr: string }
  items: readonly string[]
}

export const stackCategories: StackCategory[] = [
  {
    id: 'core',
    label: { en: 'Core', fr: 'Base' },
    items: [
      'JavaScript',
      'TypeScript',
      'HTML',
      'CSS',
      'SQL',
      'PostgreSQL',
    ],
  },
  {
    id: 'frameworks',
    label: { en: 'Frameworks', fr: 'Frameworks' },
    items: [
      'Express',
      'Tailwind CSS',
      'TanStack Query',
      'React Email',
      'Better Auth',
    ],
  },
  {
    id: 'tools',
    label: { en: 'Tools', fr: 'Outils' },
    items: ['Drizzle', 'Prisma', 'Neon'],
  },
  {
    id: 'platforms',
    label: { en: 'Platforms', fr: 'Plateformes' },
    items: ['GitHub', 'Vercel', 'Ubuntu'],
  },
  {
    id: 'software',
    label: { en: 'Software', fr: 'Logiciels' },
    items: ['Cursor', 'Postman'],
  },
  {
    id: 'devops',
    label: { en: 'DevOps', fr: 'DevOps' },
    items: ['tRPC', 'GitHub Actions (CI/CD)'],
  },
]

export const copy = {
  en: {
    nav: { name: 'Sx', cv: 'CV', about: 'About' },
    about: {
      title: "I'm Sx, a developer who enjoys building performant interfaces.",
      subtitle:
        'Passionate about entrepreneurship and coding, I try to combine both. I want to give myself the means to make a living from what I love.',
    },
    experience: {
      section: 'Experience',
    },
    projects: {
      section: 'Projects',
    },
    stats: {
      section: 'Stats',
      quote: 'Always grinding — 24/7, no breaks, no excuses.',
      githubProfile: 'GitHub profile',
    },
    cv: {
      title: 'Curriculum Vitae',
      description: 'Want to know more about my background and experience?',
      viewEn: 'View Resume (EN)',
      viewFr: 'Voir le CV (FR)',
    },
    stack: {
      section: 'Stack',
      narrative:
        'My main stack is Next.js with Tailwind CSS for styling. For the database I use PostgreSQL on Neon with Drizzle as an ORM; DataGrip covers database management. Last but not least, Cursor is my IDE for shipping projects. ♥',
    },
    footer: { rights: 'All rights reserved.' },
    notFound: {
      title: '404',
      subtitle: 'Page not found',
      description: "This page doesn't exist or has been moved.",
      back: 'Back to home',
      links: { experience: 'Experience', projects: 'Projects', cv: 'CV', contact: 'Contact' },
    },
  },
  fr: {
    nav: { name: 'Sx', cv: 'CV', about: 'À propos' },
    about: {
      title: 'Je suis Sx, un développeur qui aime créer des interfaces performantes.',
      subtitle:
        "Passionné par l'entrepreneuriat et le code, j'essaie de combiner les deux. Je veux me donner les moyens de vivre de ce que j'aime.",
      technologies: 'Voici quelques technologies avec lesquelles je travaille.',
    },
    experience: {
      section: 'Expérience',
    },
    projects: {
      section: 'Projets',
    },
    stats: {
      section: 'Stats',
      quote: 'Always grinding — 24/7, no breaks, no excuses.',
      githubProfile: 'Profil GitHub',
    },
    cv: {
      title: 'Curriculum Vitae',
      description: 'Vous voulez en savoir plus sur mon parcours et mon expérience ?',
      viewEn: 'View Resume (EN)',
      viewFr: 'Voir le CV (FR)',
    },
    stack: {
      section: 'Stack',
      narrative:
        'Ma stack principale, c’est Next.js avec Tailwind CSS pour le style. Côté données : PostgreSQL sur Neon, Drizzle en ORM ; DataGrip pour l’administration des bases. Enfin, Cursor est mon IDE pour livrer des projets. ♥',
    },
    footer: { rights: 'Tous droits réservés.' },
    notFound: {
      title: '404',
      subtitle: 'Page introuvable',
      description: "Cette page n'existe pas ou a été déplacée.",
      back: "Retour à l'accueil",
      links: { experience: 'Expérience', projects: 'Projets', cv: 'CV', contact: 'Contact' },
    },
  },
} as const
