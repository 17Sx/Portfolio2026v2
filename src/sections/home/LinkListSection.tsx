import type { Lang, ListedItem } from '../../i18n/translations.ts'

export function LinkListSection({
  id,
  sectionLabel,
  items,
  lang,
}: {
  id: string
  sectionLabel: string
  items: ListedItem[]
  lang: Lang
}) {
  return (
    <section id={id} className="mt-14 border-t border-black/15 pt-10">
      <div className="flex flex-col gap-10 md:flex-row md:gap-14">
        <p className="shrink-0 font-mono text-[10px] uppercase tracking-[0.35em] text-black/40 md:w-36">
          <span>{sectionLabel}</span>
        </p>
        <ul className="flex min-w-0 flex-1 list-none flex-col gap-3 p-0">
          {items.map((item) => {
            const label = item[lang]
            return (
              <li
                key={item.id}
                className="font-mono text-xs uppercase leading-relaxed tracking-[0.12em]"
              >
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-black/55 underline decoration-black/20 underline-offset-4 transition-colors hover:text-black"
                  >
                    {label}
                  </a>
                ) : (
                  <span className="text-black/50">{label}</span>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
