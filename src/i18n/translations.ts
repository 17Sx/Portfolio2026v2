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
    id: 'altiora',
    company: { en: 'Altiora', fr: 'Altiora' },
    role: { en: 'Founder & developer', fr: 'Fondateur & développeur' },
    period: { en: '2025 - Present', fr: '2025 - Présent' },
    url: 'https://altiora.pro',
  },
  {
    id: 'pmp',
    company: {
      en: 'PMP (Palm Managing Project)',
      fr: 'PMP (Palm Managing Project)',
    },
    role: { en: 'Full-stack developer', fr: 'Développeur full-stack' },
    period: { en: '2024 - present', fr: '2024 - présent' },
    url: null,
  },
  {
    id: 'freelance',
    company: { en: 'Freelance', fr: 'Freelance' },
    role: { en: 'Full-stack developer', fr: 'Développeur full-stack' },
    period: { en: '2023 - Present', fr: '2023 - Présent' },
    url: null,
  },
]

export const projectItems: ListedItem[] = [
  { id: 'altiora', en: 'Altiora', fr: 'Altiora', url: 'https://altiora.pro' },
  {
    id: 'bkm',
    en: 'BKM Poker (2025)',
    fr: 'BKM Poker (2025)',
    url: 'https://bkm-nine.vercel.app/',
  },
  {
    id: 'yh',
    en: 'YH Trading (2025)',
    fr: 'YH Trading (2025)',
    url: 'https://yhtrading.vercel.app',
  },
  {
    id: 'ghostnet',
    en: 'ghostnet_socket (2026)',
    fr: 'ghostnet_socket (2026)',
    url: 'https://github.com/17Sx/ghostnet_socket',
  },
]

export type StackCategory = {
  id: string
  label: { en: string; fr: string }
  items: readonly string[]
}

export const stackCategories: StackCategory[] = [
  {
    id: 'languages',
    label: { en: 'Languages', fr: 'Langages' },
    items: ['JavaScript', 'TypeScript', 'Python', 'SQL'],
  },
  {
    id: 'frontend',
    label: { en: 'Frontend', fr: 'Frontend' },
    items: ['React', 'Next.js', 'Tailwind CSS', 'TanStack Query', 'React Email'],
  },
  {
    id: 'backend',
    label: { en: 'Backend', fr: 'Backend' },
    items: ['Node.js', 'Express', 'oRPC', 'tRPC', 'Better Auth'],
  },
  {
    id: 'data',
    label: { en: 'Data', fr: 'Données' },
    items: ['PostgreSQL', 'Drizzle', 'Neon'],
  },
  {
    id: 'ml',
    label: { en: 'ML & Vision', fr: 'ML & Vision' },
    items: ['PyTorch', 'PaddleOCR', 'pdfplumber', 'ONNX'],
  },
  {
    id: 'infra',
    label: { en: 'Infra', fr: 'Infra' },
    items: ['Docker', 'Linux', 'Ubuntu', 'GitHub', 'GitHub Actions', 'Vercel'],
  },
  {
    id: 'software',
    label: { en: 'Software', fr: 'Logiciels' },
    items: ['Cursor', 'Postman'],
  },
]

export const copy = {
  en: {
    nav: { name: 'Noa', cv: 'CV', about: 'About' },
    about: {
      title: 'I\'m "Noa", a full-stack developer.',
      subtitle:
        'Passionate about entrepreneurship and coding, I try to combine both. I want to give myself the means to make a living from what I love.',
      detail:
        "Day to day I'm a full-stack dev at PMP : internal admin tools, integrations, and products. I like interfaces that feel fast, schemas that stay honest, and code that actually reaches production.",
    },
    experience: {
      section: 'Experience',
    },
    projects: {
      section: 'Projects',
    },
    stats: {
      section: 'Stats',
      githubProfile: 'GitHub profile',
    },
    cv: {
      title: 'Curriculum Vitae',
      description: 'Want to know more about my background and experience?',
      viewResume: 'View my resume',
    },
    stack: {
      section: 'Stack',
      subtitle: 'What I use',
      narrative:
        'My main stack is Next.js with Tailwind CSS for styling. For the database I use PostgreSQL on Neon with Drizzle as an ORM; DataGrip covers database management. Last but not least, Cursor is my IDE for shipping projects. ♥',
      tags: {
        LANGUAGES: 'Languages',
        FRONTEND: 'Frontend',
        BACKEND: 'Backend',
        DATA: 'Data',
        ML: 'ML & Vision (learning)',
        INFRA: 'Infra',
        SOFTWARE: 'Software',
      } as const,
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
    nav: { name: 'Noa', cv: 'CV', about: 'À propos' },
    about: {
      title: 'Je suis "Noa", développeur full-stack.',
      subtitle:
        "Passionné par l'entrepreneuriat et le code, j'essaie de combiner les deux. Je veux me donner les moyens de vivre de ce que j'aime.",
      detail:
          "Au quotidien je suis full-stack chez PMP : outils d’admin internes, intégrations, et des produits. J’aime les interfaces qui réagissent vite, les modèles de données propres, et le code qui finit vraiment en prod.",
    },
      experience: {
      section: 'Expérience',
    },
    projects: {
      section: 'Projets',
    },
    stats: {
      section: 'Stats',
      githubProfile: 'Profil GitHub',
    },
    cv: {
      title: 'Curriculum Vitae',
      description: 'Vous voulez en savoir plus sur mon parcours et mon expérience ?',
      viewResume: 'Voir mon CV',
    },
    stack: {
      section: 'Stack',
      subtitle: 'Ce que j’utilise',
      narrative:
        'Ma stack principale, c’est Next.js avec Tailwind CSS pour le style. Côté données : PostgreSQL sur Neon, Drizzle en ORM ; DataGrip pour l’administration des bases. Enfin, Cursor est mon IDE pour livrer des projets. ♥',
      tags: {
        LANGUAGES: 'Langages',
        FRONTEND: 'Frontend',
        BACKEND: 'Backend',
        DATA: 'Données',
        ML: 'ML & Vision (en apprentissage)',
        INFRA: 'Infra',
        SOFTWARE: 'Logiciels',
      } as const,
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
