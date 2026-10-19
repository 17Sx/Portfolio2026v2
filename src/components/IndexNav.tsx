import { SECTION_IDS } from '../content/work.ts'
import { useActiveSection } from '../hooks/useActiveSection.ts'
import { useSectionJump } from '../hooks/useSectionJump.ts'
import { useLanguage } from '../i18n/LanguageContext.tsx'

const labels = {
  experience: 'experience',
  projects: 'projects',
  skills: 'skills',
  github: 'github',
} as const

export function IndexNav() {
  const { t } = useLanguage()
  const active = useActiveSection(SECTION_IDS)
  const jump = useSectionJump()

  return (
    <nav
      aria-label={t.index.label}
      className="fixed top-[calc(var(--banner-h)+18px)] left-[calc(70%+28px)] z-30 hidden w-36 flex-col md:flex"
    >
      <p className="mb-3 text-[11px] tracking-[0.22em] text-zinc-400 uppercase">{t.index.label}</p>
      <ul className="flex flex-col gap-2.5">
        {SECTION_IDS.map((id) => {
          const isActive = active === id
          const key = labels[id]
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => jump(id)}
                className={`grid w-full grid-cols-[16px_1fr] items-center text-left text-[14px] transition-colors ${
                  isActive
                    ? 'text-zinc-900 dark:text-zinc-50'
                    : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                }`}
              >
                <span aria-hidden className={isActive ? 'opacity-100' : 'opacity-0'}>
                  —
                </span>
                <span>{t.index[key]}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
