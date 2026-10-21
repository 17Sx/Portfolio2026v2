import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { SOCIAL } from '../constants/social.ts'
import { resumeHref, SECTION_IDS } from '../content/work.ts'
import { useLanguage } from '../i18n/LanguageContext.tsx'
import { useSectionJump } from '../hooks/useSectionJump.ts'
import { useTheme } from '../hooks/useTheme.ts'
import { useSendEmail } from './EmailDispatch.tsx'
import { SearchIcon } from './icons.tsx'

type Command = {
  id: string
  group: string
  label: string
  run: () => void
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, lang, toggleLang } = useLanguage()
  const { theme, toggle } = useTheme()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listId = useId()
  const jump = useSectionJump()
  const sendEmail = useSendEmail()

  const commands = useMemo<Command[]>(() => {
    const go = (id: string) => {
      onClose()
      jump(id)
    }

    const sectionLabels: Record<(typeof SECTION_IDS)[number], string> = {
      experience: t.index.experience,
      projects: t.index.projects,
      skills: t.index.skills,
      github: t.index.github,
      music: t.index.music,
    }

    return [
      ...SECTION_IDS.map((id) => ({
        id: `go-${id}`,
        group: t.palette.navigate,
        label: sectionLabels[id],
        run: () => go(id),
      })),
      {
        id: 'theme',
        group: t.palette.preferences,
        label: theme === 'dark' ? t.palette.light : t.palette.dark,
        run: () => {
          toggle()
          onClose()
        },
      },
      {
        id: 'lang',
        group: t.palette.preferences,
        label: lang === 'en' ? 'Français' : 'English',
        run: () => {
          toggleLang()
          onClose()
        },
      },
      {
        id: 'email',
        group: t.palette.contact,
        label: t.palette.email,
        run: () => {
          onClose()
          sendEmail()
        },
      },
      {
        id: 'resume',
        group: t.palette.contact,
        label: t.palette.resume,
        run: () => {
          window.open(resumeHref(lang), '_blank', 'noopener')
          onClose()
        },
      },
      {
        id: 'github',
        group: t.palette.contact,
        label: 'GitHub',
        run: () => {
          window.open(SOCIAL.github, '_blank', 'noopener')
          onClose()
        },
      },
      {
        id: 'linkedin',
        group: t.palette.contact,
        label: 'LinkedIn',
        run: () => {
          window.open(SOCIAL.linkedin, '_blank', 'noopener')
          onClose()
        },
      },
      {
        id: 'x',
        group: t.palette.contact,
        label: 'X',
        run: () => {
          window.open(SOCIAL.twitter, '_blank', 'noopener')
          onClose()
        },
      },
    ]
  }, [jump, lang, onClose, sendEmail, t, theme, toggle, toggleLang])

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return commands
    return commands.filter((command) => command.label.toLowerCase().includes(needle))
  }, [commands, query])

  useEffect(() => {
    if (!open) return
    setQuery('')
    setSelected(0)
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus())
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.cancelAnimationFrame(frame)
      document.body.style.overflow = previous
    }
  }, [open])

  useEffect(() => {
    setSelected(0)
  }, [query])

  if (!open) return null

  const active = results[Math.min(selected, Math.max(results.length - 1, 0))]

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setSelected((index) => (results.length === 0 ? 0 : (index + 1) % results.length))
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setSelected((index) => (results.length === 0 ? 0 : (index - 1 + results.length) % results.length))
      return
    }
    if (event.key === 'Enter' && active) {
      event.preventDefault()
      active.run()
    }
  }

  let lastGroup = ''

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center bg-black/50 px-4 pt-[16vh] backdrop-blur-[2px]"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t.palette.label}
        className="w-full max-w-[520px] overflow-hidden rounded-xl border border-black/10 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.28)] dark:border-white/10 dark:bg-zinc-950"
        onMouseDown={(event) => event.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-2 border-b border-black/8 px-3 dark:border-white/10">
          <SearchIcon className="size-4 shrink-0 text-zinc-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.palette.placeholder}
            aria-controls={listId}
            aria-activedescendant={active ? `${listId}-${active.id}` : undefined}
            className="h-12 w-full min-w-0 bg-transparent text-[15px] text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
          />
          <span aria-hidden className="font-doto pr-1 text-[12px] leading-none font-bold tracking-[0.2em] text-zinc-300 dark:text-zinc-600">
            NOA
          </span>
        </div>
        <ul id={listId} role="listbox" className="max-h-[320px] overflow-auto p-1.5">
          {results.length === 0 ? (
            <li className="px-3 py-6 text-center text-[13px] text-zinc-400">{t.palette.empty}</li>
          ) : (
            results.map((command, index) => {
              const showGroup = command.group !== lastGroup
              lastGroup = command.group
              const isSelected = command.id === active?.id
              return (
                <li key={command.id} role="presentation">
                  {showGroup ? (
                    <p className="font-doto px-2 pt-2.5 pb-1 text-[12px] leading-none font-bold tracking-[0.18em] text-zinc-400 uppercase">
                      {command.group}
                    </p>
                  ) : null}
                  <button
                    id={`${listId}-${command.id}`}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`flex w-full items-center rounded-md px-2.5 py-2 text-left text-[14px] ${
                      isSelected
                        ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
                        : 'text-zinc-600 dark:text-zinc-300'
                    }`}
                    onMouseEnter={() => setSelected(index)}
                    onClick={() => command.run()}
                  >
                    {command.label}
                  </button>
                </li>
              )
            })
          )}
        </ul>
        <div className="flex gap-4 border-t border-black/8 px-3 py-2 text-[11px] text-zinc-400 dark:border-white/10">
          <span>↑↓ {t.palette.move}</span>
          <span>↵ {t.palette.open}</span>
          <span>esc {t.palette.close}</span>
        </div>
      </div>
    </div>
  )
}
