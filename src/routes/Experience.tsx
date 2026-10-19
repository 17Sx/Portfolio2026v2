import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { experiences } from '../content/work.ts'
import { ExperienceItem } from '../components/ExperienceItem.tsx'

const PREFIX = 'experience-'

export default function Experience() {
  const { hash, key } = useLocation()
  const [open, setOpen] = useState<Record<string, boolean>>({ [experiences[0]?.id ?? '']: true })

  // Un clic sur une barre de la frise pointe vers #experience-<id> : on ouvre ce poste et on défile jusqu'à lui.
  // `key` change à chaque navigation, donc un second clic sur la même barre rouvre et recentre le poste.
  useEffect(() => {
    const id = hash.startsWith(`#${PREFIX}`) ? hash.slice(PREFIX.length + 1) : ''
    if (!id) {
      window.scrollTo(0, 0)
      return
    }
    setOpen((current) => ({ ...current, [id]: true }))
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(`${PREFIX}${id}`)?.scrollIntoView({ block: 'start' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [hash, key])

  return (
    <div id="all-experiences" className="relative pt-6">
      <div
        aria-hidden
        className="rule-dots rule-dots-x pointer-events-none absolute top-0 -right-[100vw] -left-[100vw] -translate-y-1/2"
      />
      <div className="flex flex-col gap-7">
        {experiences.map((entry) => (
          <div key={entry.id} id={`${PREFIX}${entry.id}`} className="scroll-mt-6">
            <ExperienceItem
              entry={entry}
              expanded={Boolean(open[entry.id])}
              onToggle={() => setOpen((current) => ({ ...current, [entry.id]: !current[entry.id] }))}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
