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
    id: 'impulse-lab',
    company: { en: 'Impulse Lab', fr: 'Impulse Lab' },
    role: { en: 'Web developer · Apprenticeship', fr: 'Développeur web · Alternance' },
    period: { en: 'Sep 2026 - Present', fr: 'Sep 2026 - Présent' },
    url: 'https://impulselab.ai',
  },
  {
    id: 'altiora',
    company: { en: 'Altiora', fr: 'Altiora' },
    role: { en: 'Founder & developer', fr: 'Fondateur développeur' },
    period: { en: 'May 2025 - Present', fr: 'Mai 2025 - Présent' },
    url: 'https://altiora.pro',
  },
  {
    id: 'pmp',
    company: {
      en: 'PALM MANAGING PROJECT',
      fr: 'PALM MANAGING PROJECT',
    },
    role: { en: 'Web developer · Apprenticeship', fr: 'Développeur web · Alternance' },
    period: { en: 'Apr 2025 - Sep 2026', fr: 'Avr 2025 - Sep 2026' },
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
    nav: { name: 'Noa' },
    profile: {
      role: 'Full-stack developer',
    },
    about: {
      lead: 'Full-stack developer. I build products that ship — custom apps, AI integrations, and software I can stand behind.',
      bullets: [
        '**Entrepreneurship and code** are the two things I keep trying to hold together. I want to make a living from what I love.',
        'Day to day I’m a web developer at **Impulse Lab**: interfaces that feel fast, schemas that stay honest, and code that actually reaches production.',
        'On the side I founded **Altiora**, and I take freelance work when the problem is worth building.',
      ],
      email: 'Send an email',
      resume: 'View resume',
      socialsLead: 'Here are my',
      socialsEm: 'socials',
    },
    index: {
      label: 'Index',
      experience: 'Experience',
      projects: 'Projects',
      skills: 'Stack',
      github: 'GitHub',
      music: 'Music',
    },
    experience: {
      section: 'Experience',
      viewAll: 'View all',
      archiveTitle: 'All experiences',
      archiveSubtitle: 'Full experience archive',
      timeline: 'Career timeline',
      now: 'Now',
      present: 'Present',
      back: 'Back to home',
      drag: 'drag',
      timelineHint: 'Select a role to open its details below.',
    },
    projects: {
      section: 'Projects',
      view: 'View project',
      repo: 'Repository',
      private: 'Private',
      status: { live: 'Live', archived: 'Archived', internal: 'Internal' },
    },
    skills: {
      section: 'Stack',
      intro: 'Next.js and Tailwind up front. PostgreSQL on Neon, Drizzle as the ORM. Cursor to ship.',
    },
    music: {
      section: 'Music',
      intro: 'Most played on Deezer',
      loading: 'Loading listening stats',
      failed: 'Listening stats unavailable.',
      more: '+{count} more',
      onRepeat: 'On repeat',
    },
    github: {
      section: 'GitHub',
      count: '{count} contributions in the last year',
      loading: 'Loading contribution activity',
      failed: 'Contribution graph unavailable.',
      profile: 'GitHub profile',
      less: 'Less',
      more: 'More',
      scroll: 'Scroll horizontally to read the year.',
    },
    footer: {
      quote: 'I want to give myself the means to make a living from what I love.',
      rights: 'All rights reserved.',
      visitors: '{count} visitors',
    },
    palette: {
      label: 'Command palette',
      placeholder: 'Search for a command to run…',
      empty: 'No matching commands',
      navigate: 'Navigate',
      preferences: 'Preferences',
      contact: 'Contact',
      light: 'Switch to light',
      dark: 'Switch to dark',
      resume: 'Open resume',
      email: 'Send an email',
      move: 'move',
      open: 'open',
      close: 'close',
    },
    dispatch: {
      kicker: 'Dispatch',
      status: 'Opening your mail app',
    },
    theme: 'Toggle theme',
    notFound: {
      title: '404',
      subtitle: 'Page not found',
      description: "This page doesn't exist or has been moved.",
      back: 'Back to home',
    },
  },
  fr: {
    nav: { name: 'Noa' },
    profile: {
      role: 'Développeur full-stack',
    },
    about: {
      lead: 'Développeur full-stack. Je construis des produits qui partent en prod — apps sur mesure, intégrations IA, et du logiciel que je peux assumer.',
      bullets: [
        '**L’entrepreneuriat et le code**, les deux choses que j’essaie de tenir ensemble. Je veux vivre de ce que j’aime.',
        'Au quotidien, développeur web chez **Impulse Lab** : des interfaces qui réagissent vite, des schémas honnêtes, et du code qui finit vraiment en production.',
        'À côté, j’ai fondé **Altiora**, et je prends des missions freelance quand le problème vaut le coup.',
      ],
      email: 'Envoyer un email',
      resume: 'Voir le CV',
      socialsLead: 'Voici mes',
      socialsEm: 'réseaux',
    },
    index: {
      label: 'Index',
      experience: 'Expérience',
      projects: 'Projets',
      skills: 'Stack',
      github: 'GitHub',
      music: 'Musique',
    },
    experience: {
      section: 'Expérience',
      viewAll: 'Tout voir',
      archiveTitle: 'Toutes les expériences',
      archiveSubtitle: 'Archive complète du parcours',
      timeline: 'Frise du parcours',
      now: 'Auj.',
      present: 'Présent',
      back: 'Retour à l’accueil',
      drag: 'glisser',
      timelineHint: 'Choisis un poste pour ouvrir son détail plus bas.',
    },
    projects: {
      section: 'Projets',
      view: 'Voir le projet',
      repo: 'Dépôt',
      private: 'Privé',
      status: { live: 'En ligne', archived: 'Archivé', internal: 'Interne' },
    },
    skills: {
      section: 'Stack',
      intro: 'Next.js et Tailwind devant. PostgreSQL sur Neon, Drizzle en ORM. Cursor pour livrer.',
    },
    music: {
      section: 'Musique',
      intro: 'Les plus écoutés sur Deezer',
      loading: 'Chargement des écoutes',
      failed: 'Statistiques d’écoute indisponibles.',
      more: '+{count} de plus',
      onRepeat: 'En boucle',
    },
    github: {
      section: 'GitHub',
      count: '{count} contributions sur l’année',
      loading: 'Chargement de l’activité',
      failed: 'Graphique de contributions indisponible.',
      profile: 'Profil GitHub',
      less: 'Moins',
      more: 'Plus',
      scroll: 'Défile horizontalement pour lire l’année.',
    },
    footer: {
      quote: 'Je veux me donner les moyens de vivre de ce que j’aime.',
      rights: 'Tous droits réservés.',
      visitors: '{count} visites',
    },
    palette: {
      label: 'Palette de commandes',
      placeholder: 'Chercher une commande…',
      empty: 'Aucune commande',
      navigate: 'Aller à',
      preferences: 'Préférences',
      contact: 'Contact',
      light: 'Passer en clair',
      dark: 'Passer en sombre',
      resume: 'Ouvrir le CV',
      email: 'Envoyer un email',
      move: 'naviguer',
      open: 'ouvrir',
      close: 'fermer',
    },
    dispatch: {
      kicker: 'Envoi',
      status: 'Ouverture de la messagerie',
    },
    theme: 'Changer de thème',
    notFound: {
      title: '404',
      subtitle: 'Page introuvable',
      description: "Cette page n'existe pas ou a été déplacée.",
      back: "Retour à l'accueil",
    },
  },
} as const
