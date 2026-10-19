import { useDeezer } from '../../hooks/useDeezer.ts'
import { useIsDark } from '../../hooks/useIsDark.ts'
import { useLanguage } from '../../i18n/LanguageContext.tsx'
import { Section } from '../../components/Section.tsx'

export function MusicSection() {
  const { t } = useLanguage()
  const state = useDeezer()
  const isDark = useIsDark()
  const music = state.status === 'ready' ? state.music : null

  return (
    <Section id="music" title={t.music.section}>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <p className="text-[13px] text-zinc-500">
          {state.status === 'loading' ? t.music.loading : music ? t.music.intro : t.music.failed}
        </p>
        {music ? (
          <a
            href={music.profileUrl}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 text-[13px] text-zinc-500 underline-offset-4 hover:text-zinc-900 hover:underline dark:hover:text-zinc-100"
          >
            Deezer
          </a>
        ) : null}
      </div>

      {music && music.artists.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {music.artists.map((artist) => (
            <a
              key={artist.id}
              href={artist.link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-zinc-50 py-1 pr-2.5 pl-1 text-[13px] text-zinc-700 transition-colors hover:border-black/20 hover:text-zinc-900 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-white/20 dark:hover:text-zinc-50"
            >
              <img
                src={artist.picture}
                alt=""
                loading="lazy"
                className="size-4 shrink-0 rounded-full object-cover grayscale"
              />
              {artist.name}
            </a>
          ))}
          {music.moreCount > 0 ? (
            <span className="px-1 font-mono text-[11px] text-zinc-400">
              {t.music.more.replace('{count}', String(music.moreCount))}
            </span>
          ) : null}
        </div>
      ) : null}

      {music?.onRepeat ? (
        <div className="mt-6">
          <div className="flex items-baseline gap-2 pb-2.5">
            <p className="font-mono text-[10px] font-medium tracking-wider text-zinc-400 uppercase">
              {t.music.onRepeat}
            </p>
            <span className="font-mono text-[10px] text-zinc-400">{music.onRepeat.artist}</span>
          </div>
          <div className="overflow-hidden rounded-[10px] border border-black/10 dark:border-white/10">
            <iframe
              key={isDark ? 'dark' : 'light'}
              title={`${music.onRepeat.title} · ${music.onRepeat.artist} (Deezer)`}
              src={`https://widget.deezer.com/widget/${isDark ? 'dark' : 'light'}/track/${music.onRepeat.id}`}
              height="152"
              loading="lazy"
              allow="encrypted-media; clipboard-write"
              className="block w-full"
            />
          </div>
        </div>
      ) : null}
    </Section>
  )
}
