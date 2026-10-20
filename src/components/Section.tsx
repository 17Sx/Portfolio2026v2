import type { ReactNode } from 'react'

export function Section({
  id,
  title,
  children,
}: {
  id: string
  title?: string
  children: ReactNode
}) {
  return (
    <section id={id} className="relative mt-14 scroll-mt-8 pt-8">
      <div
        aria-hidden
        className="rule-dots rule-dots-x pointer-events-none absolute top-0 -right-[100vw] -left-[100vw] -translate-y-1/2"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute top-0 -left-4 z-20 hidden size-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-900 md:block dark:bg-white"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute top-0 -right-4 z-20 hidden size-[3px] translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-900 md:block dark:bg-white"
      />
      {title ? (
        <h2 className="mb-5 text-[18px] font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {title}
        </h2>
      ) : null}
      {children}
    </section>
  )
}
