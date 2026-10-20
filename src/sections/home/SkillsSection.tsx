import { Icon } from '@iconify/react'
import { skillGroups } from '../../content/work.ts'
import { useLanguage } from '../../i18n/LanguageContext.tsx'
import { Section } from '../../components/Section.tsx'

export function SkillsSection() {
  const { t, lang } = useLanguage()

  return (
    <Section id="skills" title={t.skills.section}>
      <p className="max-w-prose text-[14px] leading-relaxed text-zinc-500">{t.skills.intro}</p>
      <div className="mt-2 flex flex-col gap-5">
        {skillGroups.map((group) => (
          <div key={group.id}>
            <p className="text-[11px] font-medium tracking-[0.16em] text-zinc-400 uppercase">
              {group.label[lang]}
            </p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {group.items.map((skill) => (
                <span
                  key={skill.name}
                  className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-zinc-50 px-2.5 py-1 text-[13px] text-zinc-700 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200"
                >
                  {skill.icon ? <Icon icon={skill.icon} className="size-3.5 shrink-0" /> : null}
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
