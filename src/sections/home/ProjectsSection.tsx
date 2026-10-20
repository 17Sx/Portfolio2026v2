import { useState } from 'react'
import type { Project, ProjectStatus } from '../../content/work.ts'
import { projects } from '../../content/work.ts'
import { useLanguage } from '../../i18n/LanguageContext.tsx'
import { ArrowIcon, GitHubIcon } from '../../components/icons.tsx'
import { DotField } from '../../components/DotField.tsx'
import { Section } from '../../components/Section.tsx'

const statusDot: Record<ProjectStatus, string> = {
  live: 'bg-emerald-400',
  archived: 'bg-zinc-500',
  internal: 'bg-zinc-500',
}

function DotTeaser({ project, active }: { project: Project; active: boolean }) {
  return (
    <div className="relative h-full w-full text-zinc-900 dark:text-white">
      <DotField seed={project.id} active={active} />
      <span className="absolute top-3 left-3.5 font-mono text-[10px] tracking-[0.2em] text-zinc-500">
        {project.year}
      </span>
    </div>
  )
}

export function ProjectsSection() {
  const { t, lang } = useLanguage()
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <Section id="projects" title={t.projects.section}>
      <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
        {projects.map((project) => (
          <article
            key={project.id}
            className="group"
            onMouseEnter={() => setHovered(project.id)}
            onMouseLeave={() => setHovered((current) => (current === project.id ? null : current))}
          >
            <div className="aspect-[16/10] overflow-hidden rounded-xl border border-black/10 bg-zinc-50 transition-colors duration-500 group-hover:border-black/25 dark:border-white/10 dark:bg-zinc-950 dark:group-hover:border-white/25">
              {project.image ? (
                <img
                  src={project.image}
                  alt=""
                  className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              ) : (
                <DotTeaser project={project} active={hovered === project.id} />
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <h3 className="text-[15px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                {project.name[lang]}
              </h3>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-500 dark:bg-zinc-900">
                <span aria-hidden className={`size-1.5 rounded-full ${statusDot[project.status]}`} />
                {t.projects.status[project.status]}
              </span>
            </div>
            <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-500">{project.description[lang]}</p>
            {project.tech.length > 0 ? (
              <p className="mt-2 text-[11px] tracking-wide text-zinc-400">{project.tech.slice(0, 4).join(' · ')}</p>
            ) : null}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px]">
              {project.url ? (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
                >
                  {t.projects.view}
                  <ArrowIcon className="size-3.5" />
                </a>
              ) : null}
              {project.github ? (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  <GitHubIcon className="size-3.5" />
                  {t.projects.repo}
                </a>
              ) : null}
              {!project.url && !project.github ? <span className="text-zinc-400">{t.projects.private}</span> : null}
            </div>
          </article>
        ))}
      </div>
    </Section>
  )
}
