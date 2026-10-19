import { useLanguage } from '../i18n/LanguageContext.tsx'
import { useDeezer, type DeezerMusic } from '../hooks/useDeezer.ts'
import { useIsDark } from '../hooks/useIsDark.ts'

function MusicContent({ music }: { music: DeezerMusic }) {
  const { t } = useLanguage()
  const isDark = useIsDark()

  return (
    <div className="flex flex-col gap-8">
      {music.artists.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs text-ink/30 tracking-widest">
            &lt;{t.music.topArtists}/&gt;
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {music.artists.map((artist) => (
              <a
                key={artist.id}
                href={artist.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded border border-ink/15 py-0.5 pl-0.5 pr-2.5 font-mono text-sm text-ink/70 hover:border-ink/35 hover:text-ink"
              >
                <img
                  src={artist.picture}
                  alt=""
                  loading="lazy"
                  className="h-5 w-5 shrink-0 rounded-sm object-cover grayscale"
                />
                {artist.name}
              </a>
            ))}
            {music.moreCount > 0 && (
              <span className="px-1 font-mono text-xs text-ink/35">
                +{music.moreCount} {t.music.more}
              </span>
            )}
          </div>
        </div>
      )}

      {music.onRepeat && (
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs text-ink/30 tracking-widest">
              &lt;{t.music.onRepeat}/&gt;
            </span>
            <span className="font-mono text-xs text-ink/45">{music.onRepeat.artist}</span>
          </div>
          <iframe
            key={isDark ? 'dark' : 'light'}
            title={`${music.onRepeat.title} - ${music.onRepeat.artist} (Deezer)`}
            src={`https://widget.deezer.com/widget/${isDark ? 'dark' : 'light'}/track/${music.onRepeat.id}`}
            height="152"
            loading="lazy"
            allow="encrypted-media; clipboard-write"
            className="block w-full max-w-2xl rounded border border-ink/15"
          />
        </div>
      )}

      <a
        href={music.profileUrl}
        target="_blank"
        rel="noreferrer"
        className="self-start font-mono text-base tracking-wide text-ink/55 underline decoration-ink/25 underline-offset-4 hover:text-ink/80"
      >
        {t.music.profile} →
      </a>
    </div>
  )
}

export default function Music() {
  const { t } = useLanguage()
  const state = useDeezer()

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-8 pb-20 md:pb-6 h-full flex flex-col overflow-y-auto">
      <div className="flex-1 flex flex-col justify-center py-4">
        <h1 className="font-mono text-2xl font-semibold text-ink mb-8">
          {t.music.section}
          <span className="ml-4 font-mono text-sm font-normal text-ink/35 tracking-wide">
            {t.music.subtitle}
          </span>
        </h1>

        {state.status === 'ready' ? (
          <MusicContent music={state.music} />
        ) : (
          <p className="font-mono text-sm text-ink/45">
            {state.status === 'loading' ? t.music.loading : t.music.empty}
          </p>
        )}
      </div>
    </div>
  )
}
