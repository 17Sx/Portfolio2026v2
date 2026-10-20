import { SOCIAL } from '../../constants/social.ts'
import { resumeHref } from '../../content/work.ts'
import { useLanguage } from '../../i18n/LanguageContext.tsx'
import { FileIcon, GitHubIcon, LinkedInIcon, MailIcon, XIcon } from '../../components/icons.tsx'
import { Rich } from '../../components/RichText.tsx'

const pill =
  'inline-flex items-center gap-2 rounded-md border border-black/10 bg-zinc-50 px-2.5 py-1.5 text-[13px] text-zinc-700 transition hover:border-black/25 hover:bg-white dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-white/25 dark:hover:bg-zinc-800'

export function AboutSection() {
  const { t, lang } = useLanguage()

  return (
    <section id="about" className="pt-2">
      <p className="text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-200">
        <Rich text={t.about.lead} />
      </p>
      <ul className="mt-4 space-y-2.5 text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-300">
        {t.about.bullets.map((bullet) => (
          <li key={bullet} className="flex gap-2.5">
            <span aria-hidden className="mt-px text-zinc-400">
              •
            </span>
            <span>
              <Rich text={bullet} />
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-wrap gap-2">
        <a
          href={SOCIAL.email}
          className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-3 py-1.5 text-[13px] font-medium text-white transition hover:bg-zinc-700 active:scale-[0.98] dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <MailIcon className="size-3.5" />
          {t.about.email}
        </a>
        <a
          href={resumeHref(lang)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-md bg-zinc-100 px-3 py-1.5 text-[13px] font-medium text-zinc-800 transition hover:bg-zinc-200 active:scale-[0.98] dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
        >
          <FileIcon className="size-3.5" />
          {t.about.resume}
        </a>
      </div>

      <p className="mt-7 text-[14px] text-zinc-500">
        {t.about.socialsLead}{' '}
        <span className="font-semibold text-zinc-800 dark:text-zinc-100">{t.about.socialsEm}</span>
      </p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        <a href={SOCIAL.github} target="_blank" rel="noreferrer" className={pill}>
          <GitHubIcon className="size-3.5" />
          GitHub
        </a>
        <a href={SOCIAL.twitter} target="_blank" rel="noreferrer" className={pill}>
          <XIcon className="size-3.5" />
          X
        </a>
        <a href={SOCIAL.linkedin} target="_blank" rel="noreferrer" className={pill}>
          <LinkedInIcon className="size-3.5" />
          LinkedIn
        </a>
      </div>
    </section>
  )
}
