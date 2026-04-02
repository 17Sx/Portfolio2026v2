import { projectItems } from '../../i18n/translations.ts'
import { useLanguage } from '../../i18n/LanguageContext.tsx'
import { LinkListSection } from './LinkListSection.tsx'

export function ProjectsSection() {
  const { t, lang } = useLanguage()

  return (
    <LinkListSection
      id="projects"
      sectionLabel={t.projects.section}
      items={projectItems}
      lang={lang}
    />
  )
}
