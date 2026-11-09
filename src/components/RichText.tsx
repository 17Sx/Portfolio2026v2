import { useLanguage } from '../i18n/LanguageContext.tsx'
import { findPreview, HoverPreview } from './HoverPreview.tsx'

export function Rich({
  text,
  strongClassName = 'font-semibold text-zinc-900 dark:text-zinc-50',
  previews = false,
}: {
  text: string
  strongClassName?: string
  /** Les noms en gras connus (projets, entreprises) affichent une bulle d'aperçu au survol */
  previews?: boolean
}) {
  const { lang } = useLanguage()
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((part, index) => {
        if (!(part.startsWith('**') && part.endsWith('**'))) return <span key={index}>{part}</span>
        const label = part.slice(2, -2)
        const strong = (
          <strong key={index} className={strongClassName}>
            {label}
          </strong>
        )
        const preview = previews ? findPreview(label, lang) : null
        return preview ? (
          <HoverPreview key={index} preview={preview}>
            {strong}
          </HoverPreview>
        ) : (
          strong
        )
      })}
    </>
  )
}
