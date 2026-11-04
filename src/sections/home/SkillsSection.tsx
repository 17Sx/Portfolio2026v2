import { Icon } from '@iconify/react'
import { shipStack } from '../../content/work.ts'
import { useLanguage } from '../../i18n/LanguageContext.tsx'
import { Section } from '../../components/Section.tsx'

export function SkillsSection() {
  const { t } = useLanguage()
  // split avec un groupe capturant : les index impairs sont les ids entre accolades
  const parts = t.skills.sentence.split(/\{(\w+)\}/)

  return (
    <Section id="skills" title={t.skills.section}>
      <p className="max-w-prose text-[15px] leading-[2.1] text-zinc-500">
        {parts.map((part, index) => {
          const tool = index % 2 === 1 ? shipStack.find((item) => item.id === part) : undefined
          if (!tool) return part
          return (
            <span
              key={index}
              className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-zinc-50 px-2.5 py-0.5 align-middle text-[13px] leading-normal text-zinc-700 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200"
            >
              <Icon icon={tool.icon} className="size-3.5 shrink-0" />
              {tool.name}
            </span>
          )
        })}
      </p>
    </Section>
  )
}
