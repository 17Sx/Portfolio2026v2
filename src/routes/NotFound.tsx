import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext.tsx'

export default function NotFound() {
  const { t } = useLanguage()

  return (
    <div className="py-10">
      <p className="text-[56px] leading-none font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        {t.notFound.title}
      </p>
      <p className="mt-4 text-[14px] tracking-[0.16em] text-zinc-400 uppercase">{t.notFound.subtitle}</p>
      <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-zinc-500">{t.notFound.description}</p>
      <Link
        to="/"
        className="mt-8 inline-flex rounded-md bg-zinc-900 px-3 py-1.5 text-[13px] font-medium text-white dark:bg-white dark:text-zinc-900"
      >
        {t.notFound.back}
      </Link>
    </div>
  )
}
