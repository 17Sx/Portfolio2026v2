import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { useLanguage } from '../i18n/LanguageContext.tsx'

type Skill = {
  name: string
  icon?: string
}

type Category = {
  tag: string
  items: Skill[]
}

const categories: Category[] = [
  {
    tag: 'CORE',
    items: [
      { name: 'JavaScript', icon: 'logos:javascript' },
      { name: 'TypeScript', icon: 'logos:typescript-icon' },
      { name: 'HTML', icon: 'logos:html-5' },
      { name: 'CSS', icon: 'logos:css-3' },
      { name: 'SQL', icon: 'mdi:database' },
      { name: 'PostgreSQL', icon: 'logos:postgresql' },
    ],
  },
  {
    tag: 'FRAMEWORKS',
    items: [
      { name: 'Next.js', icon: 'logos:nextjs-icon' },
      { name: 'React', icon: 'logos:react' },
      { name: 'Express', icon: 'logos:express' },
      { name: 'Tailwind CSS', icon: 'logos:tailwindcss-icon' },
      { name: 'TanStack Query', icon: 'logos:react-query-icon' },
      { name: 'React Email', icon: 'logos:react' },
      { name: 'Better Auth', icon: 'mdi:lock' },
    ],
  },
  {
    tag: 'TOOLS',
    items: [
      { name: 'Drizzle', icon: 'simple-icons:drizzle' },
      { name: 'Prisma', icon: 'logos:prisma' },
      { name: 'Neon', icon: 'logos:neon-icon' },
    ],
  },
  {
    tag: 'PLATFORMS',
    items: [
      { name: 'GitHub', icon: 'logos:github-icon' },
      { name: 'Vercel', icon: 'logos:vercel-icon' },
      { name: 'Ubuntu', icon: 'logos:ubuntu' },
    ],
  },
  {
    tag: 'SOFTWARE',
    items: [
      { name: 'Cursor', icon: 'simple-icons:cursor' },
      { name: 'Postman', icon: 'logos:postman-icon' },
    ],
  },
  {
    tag: 'DEV OPS',
    items: [
      { name: 'tRPC', icon: 'logos:trpc' },
      { name: 'GitHub Actions (CI/CD)', icon: 'logos:github-actions' },
    ],
  },
]

function SkillBadge({ skill }: { skill: Skill }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded border border-black/15 px-2.5 font-mono text-sm text-black/70">
      {skill.icon && (
        <Icon icon={skill.icon} className="h-3.5 w-3.5 shrink-0" />
      )}
      {skill.name}
    </span>
  )
}

export default function Stack() {
  const { } = useLanguage()

  return (
    <div className="mx-auto max-w-5xl px-8 py-6 h-full flex flex-col overflow-y-auto">
      <header className="flex items-baseline justify-between">
        <Link to="/" className="font-mono text-xl font-semibold uppercase tracking-widest text-black">
          Sx
        </Link>
      </header>

      <div className="flex-1 flex flex-col justify-center py-8">
        <h1 className="font-mono text-2xl font-semibold text-black mb-1">
          Stack
          <span className="ml-4 font-mono text-sm font-normal text-black/35 tracking-wide">
            What I use
          </span>
        </h1>

        <p className="mt-4 mb-8 font-mono text-sm leading-relaxed text-black/60 max-w-2xl">
          My main stack is{' '}
          <SkillBadge skill={{ name: 'Next.js', icon: 'logos:nextjs-icon' }} />
          {' '}with{' '}
          <SkillBadge skill={{ name: 'Tailwind CSS', icon: 'logos:tailwindcss-icon' }} />
          {' '}for styling. For the database I use{' '}
          <SkillBadge skill={{ name: 'PostgreSQL', icon: 'logos:postgresql' }} />
          {' '}on{' '}
          <SkillBadge skill={{ name: 'Neon', icon: 'logos:neon-icon' }} />
          {' '}with{' '}
          <SkillBadge skill={{ name: 'Drizzle', icon: 'simple-icons:drizzle' }} />
          {' '}as ORM. I ship everything with{' '}
          <SkillBadge skill={{ name: 'Cursor', icon: 'simple-icons:cursor' }} />.
        </p>

        <div className="flex flex-col gap-5">
          {categories.map((cat) => (
            <div key={cat.tag} className="flex flex-col gap-2">
              <span className="font-mono text-xs text-black/30 tracking-widest">
                &lt;{cat.tag}/&gt;
              </span>
              <div className="flex flex-wrap gap-2">
                {cat.items.map((skill) => (
                  <SkillBadge key={skill.name} skill={skill} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
