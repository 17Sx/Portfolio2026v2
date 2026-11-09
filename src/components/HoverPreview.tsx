import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { experiences, projects, type Copy } from '../content/work.ts'
import type { Lang } from '../i18n/translations.ts'

export type Preview = {
  name: string
  url: string | null
  image: string | null
  logo: string | null
  tile: 'light' | 'dark'
  caption: string | null
}

/** Cherche de quoi illustrer un nom en gras : capture côté projets, logo et rôle côté expériences */
export function findPreview(label: string, lang: Lang): Preview | null {
  const matches = (copy: Copy) => copy[lang] === label
  const project = projects.find((item) => matches(item.name))
  const experience = experiences.find((item) => matches(item.company))
  if (!project?.image && !experience?.logo) return null
  return {
    name: label,
    url: experience?.url ?? project?.url ?? null,
    image: project?.image ?? null,
    logo: experience?.logo ?? null,
    tile: experience?.tile ?? 'light',
    caption: experience ? experience.role[lang] : (project?.description[lang] ?? null),
  }
}

const GUTTER = 16

export function HoverPreview({ preview, children }: { preview: Preview; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  // La bulle n'est montée qu'au premier survol : la capture ne se charge pas pour rien
  const [mounted, setMounted] = useState(false)
  const [shift, setShift] = useState(0)
  const bubble = useRef<HTMLSpanElement>(null)

  const show = () => {
    setMounted(true)
    setOpen(true)
  }
  const hide = () => setOpen(false)

  // Centrée sur le mot, puis décalée pour ne jamais sortir de l'écran (gouttière de 16px)
  useLayoutEffect(() => {
    if (!open || !bubble.current) return
    const rect = bubble.current.getBoundingClientRect()
    const left = rect.left - shift
    const right = rect.right - shift
    if (left < GUTTER) setShift(GUTTER - left)
    else if (right > window.innerWidth - GUTTER) setShift(window.innerWidth - GUTTER - right)
    else setShift(0)
  }, [open])

  const host = preview.url ? new URL(preview.url).host : null
  const Trigger = preview.url ? 'a' : 'span'

  return (
    <span className="relative inline-block" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      <Trigger
        {...(preview.url ? { href: preview.url, target: '_blank', rel: 'noreferrer' } : { tabIndex: 0 })}
        className="cursor-pointer underline decoration-zinc-300 decoration-dotted underline-offset-4 transition-colors hover:decoration-zinc-500 dark:decoration-zinc-600 dark:hover:decoration-zinc-400"
      >
        {children}
      </Trigger>
      {mounted ? (
        <span
          ref={bubble}
          role="tooltip"
          style={{ translate: `calc(-50% + ${shift}px) 0` }}
          className={`pointer-events-none absolute bottom-full left-1/2 z-50 mb-2.5 block w-64 origin-bottom transition duration-200 ease-out motion-reduce:transition-none ${
            open ? 'scale-100 opacity-100' : 'translate-y-1 scale-95 opacity-0'
          }`}
        >
          <span className="block overflow-hidden rounded-xl border border-black/10 bg-white shadow-[0_12px_32px_rgba(0,0,0,0.16)] dark:border-white/10 dark:bg-zinc-900 dark:shadow-[0_12px_32px_rgba(0,0,0,0.5)]">
            {preview.image ? (
              <img
                src={preview.image}
                alt=""
                className="block aspect-[16/10] w-full border-b border-black/5 object-cover object-top dark:border-white/5"
              />
            ) : null}
            <span className="flex items-center gap-2.5 px-3 py-2.5">
              {preview.logo ? (
                <img
                  src={preview.logo}
                  alt=""
                  className={`size-7 shrink-0 rounded-md border border-black/10 object-contain dark:border-white/10 ${
                    preview.tile === 'dark' ? 'bg-black' : 'bg-white'
                  }`}
                />
              ) : null}
              <span className="min-w-0 flex-1 leading-tight">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-[13px] font-semibold text-zinc-900 dark:text-zinc-50">{preview.name}</span>
                  {host ? (
                    <span className="shrink-0 font-mono text-[10px] font-normal text-zinc-400">{host}</span>
                  ) : null}
                </span>
                {preview.caption ? (
                  <span className="mt-0.5 block text-[11px] font-normal text-zinc-500">{preview.caption}</span>
                ) : null}
              </span>
            </span>
          </span>
        </span>
      ) : null}
    </span>
  )
}
