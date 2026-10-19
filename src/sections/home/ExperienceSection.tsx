import { useState } from 'react'
import { Link } from 'react-router-dom'
import { experiences } from '../../content/work.ts'
import { useLanguage } from '../../i18n/LanguageContext.tsx'
import { ArrowIcon } from '../../components/icons.tsx'
import { ExperienceItem } from '../../components/ExperienceItem.tsx'
import { Section } from '../../components/Section.tsx'

export function ExperienceSection() {
  const { t } = useLanguage()
  const [open, setOpen] = useState<Record<string, boolean>>({ 'impulse-lab': true })

  return (
    <Section id="experience" title={t.experience.section}>
      <div className="flex flex-col gap-7">
        {experiences.map((entry) => (
          <ExperienceItem
            key={entry.id}
            entry={entry}
            expanded={Boolean(open[entry.id])}
            onToggle={() => setOpen((current) => ({ ...current, [entry.id]: !current[entry.id] }))}
          />
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <Link to="/experience" className="group relative block">
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-[5px] rounded-[11px] border border-black/5 transition-colors duration-300 group-hover:border-black/10 dark:border-white/5 dark:group-hover:border-white/10"
          />
          <span className="relative flex items-center gap-1.5 rounded-md border border-black/5 bg-zinc-50 px-4 py-2 text-[13px] font-medium text-zinc-600 shadow-sm shadow-black/20 transition-colors duration-300 group-hover:bg-zinc-100 group-hover:text-zinc-900 dark:border-white/5 dark:bg-zinc-950 dark:text-zinc-400 dark:shadow-black/80 dark:group-hover:bg-zinc-900 dark:group-hover:text-zinc-100">
            {t.experience.viewAll}
            <ArrowIcon className="size-3.5 text-zinc-500 transition-colors group-hover:text-zinc-900 dark:group-hover:text-zinc-300" />
          </span>
        </Link>
      </div>
    </Section>
  )
}
