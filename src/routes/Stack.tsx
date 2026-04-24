import { Icon } from '@iconify/react'
import { useLanguage } from '../i18n/LanguageContext.tsx'
import type { Lang } from '../i18n/translations.ts'

type Skill = {
  name: string
  icon?: string
}

const introStack: Record<string, Skill> = {
  next: { name: 'Next.js', icon: 'logos:nextjs-icon' },
  tailwind: { name: 'Tailwind CSS', icon: 'logos:tailwindcss-icon' },
  postgres: { name: 'PostgreSQL', icon: 'logos:postgresql' },
  neon: { name: 'Neon', icon: 'logos:neon-icon' },
  drizzle: { name: 'Drizzle', icon: 'simple-icons:drizzle' },
  cursor: { name: 'Cursor', icon: 'simple-icons:cursor' },
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

function StackIntroBadges({ lang }: { lang: Lang }) {
  const s = introStack
  const className =
    'mt-4 mb-8 font-mono text-sm leading-relaxed text-black/60 max-w-2xl'

  if (lang === 'fr') {
    return (
      <p className={className}>
        Ma stack principale est <SkillBadge skill={s.next} /> avec{' '}
        <SkillBadge skill={s.tailwind} /> pour le style. Pour la base de données,
        j&apos;utilise <SkillBadge skill={s.postgres} /> sur{' '}
        <SkillBadge skill={s.neon} /> avec <SkillBadge skill={s.drizzle} /> comme
        ORM. Je déploie le tout avec <SkillBadge skill={s.cursor} />.
      </p>
    )
  }

  return (
    <p className={className}>
      My main stack is <SkillBadge skill={s.next} /> with{' '}
      <SkillBadge skill={s.tailwind} /> for styling. For the database I use{' '}
      <SkillBadge skill={s.postgres} /> on <SkillBadge skill={s.neon} /> with{' '}
      <SkillBadge skill={s.drizzle} /> as ORM. I ship everything with{' '}
      <SkillBadge skill={s.cursor} />.
    </p>
  )
}

export default function Stack() {
  const { t, lang } = useLanguage()

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-8 pb-20 md:pb-6 h-full flex flex-col overflow-y-auto">
      <div className="flex-1 flex flex-col justify-center py-4">
        <h1 className="font-mono text-2xl font-semibold text-black mb-1">
          {t.stack.section}
          <span className="ml-4 font-mono text-sm font-normal text-black/35 tracking-wide">
            {t.stack.subtitle}
          </span>
        </h1>

        <StackIntroBadges lang={lang} />

        <div className="flex flex-col gap-5">
          {categories.map((cat) => {
            const tagKey = cat.tag as keyof typeof t.stack.tags
            const tagLabel =
              tagKey in t.stack.tags ? t.stack.tags[tagKey] : cat.tag
            return (
            <div key={cat.tag} className="flex flex-col gap-2">
              <span className="font-mono text-xs text-black/30 tracking-widest">
                &lt;{tagLabel}/&gt;
              </span>
              <div className="flex flex-wrap gap-2">
                {cat.items.map((skill) => (
                  <SkillBadge key={skill.name} skill={skill} />
                ))}
              </div>
            </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
