import { version as reactVersion } from 'react'
import { SOCIAL } from '../constants/social.ts'
import { experiences, isSectionId, projects, resumeHref, SECTION_IDS, skillGroups, type Copy } from '../content/work.ts'
import type { DeezerMusic } from '../hooks/useDeezer.ts'
import { SECTION_EVENT } from '../hooks/useSectionJump.ts'
import { getTheme, setTheme } from '../hooks/useTheme.ts'
import { LANG_EVENT } from '../i18n/LanguageContext.tsx'
import { copy, type Lang } from '../i18n/translations.ts'
import { isDestructiveRm, resolveToggle } from './args.ts'

// Easter egg : un petit shell dans la console du navigateur. Les commandes sont regroupées
// sous window.sx et, sauf `help`, exposées aussi directement sur window (whoami()…).

const WIPE_CLASS = 'sx-wipe'
const WIPE_MS = 1400
const BOOT_STEP_MS = 120
const THEMES = ['light', 'dark'] as const
const LANGS: readonly Lang[] = ['en', 'fr']

const S = {
  dim: 'color:#8a8a8a',
  ok: 'color:#16a34a;font-weight:600',
  err: 'color:#dc2626;font-weight:600',
  warn: 'color:#d97706;font-weight:600',
  key: 'color:#2563eb;font-weight:600',
  bold: 'font-weight:700',
  badge: 'background:#18181b;color:#fafafa;padding:2px 6px;border-radius:3px;font-weight:700;border:1px solid #52525b',
  prompt: 'color:#16a34a;font-weight:700',
  none: '',
}

type Segment = [text: string, style: string]

function line(...segments: Segment[]) {
  console.log(segments.map(([text]) => `%c${text}`).join(''), ...segments.map(([, style]) => style))
}

function currentLang(): Lang {
  return document.documentElement.lang === 'fr' ? 'fr' : 'en'
}

function t(text: Copy) {
  return text[currentLang()]
}

function prompt(text: string) {
  line(['noa@sx', S.prompt], [':~$ ', S.dim], [text, S.none])
}

function ok(text: string) {
  line(['[ok] ', S.ok], [text, S.none])
}

function usage(text: string) {
  line([t({ en: 'usage: ', fr: 'usage : ' }), S.dim], [text, S.key])
}

const commands = [
  { call: 'sx.help()', about: { en: 'this list', fr: 'cette liste' } },
  { call: 'ls()', about: { en: 'sections of the page', fr: 'les sections de la page' } },
  { call: "cd('projects')", about: { en: 'scroll to a section', fr: 'défiler jusqu’à une section' } },
  { call: 'whoami()', about: { en: 'who is behind this', fr: 'qui est derrière tout ça' } },
  { call: 'experience()', about: { en: 'where I have worked', fr: 'où j’ai travaillé' } },
  { call: 'projects()', about: { en: 'what I have shipped', fr: 'ce que j’ai livré' } },
  { call: 'stack()', about: { en: 'what I use', fr: 'ce que j’utilise' } },
  { call: 'music()', about: { en: 'what I listen to', fr: 'ce que j’écoute' } },
  { call: 'contact()', about: { en: 'how to reach me', fr: 'comment me joindre' } },
  { call: 'cv()', about: { en: 'open my resume', fr: 'ouvrir mon CV' } },
  { call: "theme('dark')", about: { en: 'light / dark, or toggle', fr: 'clair / sombre, ou bascule' } },
  { call: "lang('fr')", about: { en: 'en / fr, or toggle', fr: 'en / fr, ou bascule' } },
  { call: "sudo('hire noa')", about: { en: 'try it', fr: 'essaie' } },
  { call: "rm('-rf')", about: { en: 'do not', fr: 'non' } },
  { call: 'exit()', about: { en: 'good luck', fr: 'bonne chance' } },
]

function help() {
  line(['sx-shell', S.badge], ['  ' + t({ en: 'available commands', fr: 'commandes disponibles' }), S.dim])
  const width = Math.max(...commands.map((command) => command.call.length))
  for (const command of commands) {
    line(['  ' + command.call.padEnd(width + 2), S.key], [t(command.about), S.none])
  }
  line([t({ en: 'everything also lives under ', fr: 'tout existe aussi sous ' }), S.dim], ['sx.*', S.key])
}

function ls() {
  const labels = copy[currentLang()].index
  for (const id of SECTION_IDS) {
    line([id.padEnd(12), S.key], [labels[id], S.dim])
  }
  usage("cd('projects')")
}

function cd(section?: unknown) {
  if (!isSectionId(section)) {
    line([`cd: ${t({ en: 'no such section', fr: 'section introuvable' })}`, S.err])
    usage(`cd('${SECTION_IDS.join("' | '")}')`)
    return
  }
  // Le défilement et le hash passent par le routeur, comme la palette et l'index
  window.dispatchEvent(new CustomEvent(SECTION_EVENT, { detail: section }))
  prompt(`~/${section}`)
}

function whoami() {
  const now = experiences.filter((experience) => experience.end === null)
  line(['Noa', S.bold], [' · ', S.dim], [copy[currentLang()].profile.role, S.none], [' · ', S.dim], ['@17Sx', S.key])
  line([t({ en: 'now:      ', fr: 'en ce moment : ' }), S.dim], [now.map((experience) => t(experience.company)).join(' · '), S.none])
  line([t({ en: 'github:   ', fr: 'github :       ' }), S.dim], [SOCIAL.github, S.none])
  line([t({ en: 'linkedin: ', fr: 'linkedin :     ' }), S.dim], [SOCIAL.linkedin, S.none])
}

function experience() {
  console.table(
    experiences.map((entry) => ({
      [t({ en: 'company', fr: 'entreprise' })]: t(entry.company),
      [t({ en: 'role', fr: 'poste' })]: t(entry.role),
      [t({ en: 'period', fr: 'période' })]: t(entry.period),
      url: entry.url ?? '—',
    })),
  )
}

function projectsCommand() {
  const status = copy[currentLang()].projects.status
  console.table(
    projects.map((project) => ({
      [t({ en: 'project', fr: 'projet' })]: t(project.name),
      [t({ en: 'year', fr: 'année' })]: project.year,
      [t({ en: 'status', fr: 'statut' })]: status[project.status],
      [t({ en: 'link', fr: 'lien' })]: project.url ?? project.github ?? '—',
    })),
  )
}

function stack() {
  for (const group of skillGroups) {
    line([t(group.label).padEnd(12), S.key], [group.items.map((item) => item.name).join(' · '), S.none])
  }
}

function music() {
  line([t({ en: 'asking Deezer…', fr: 'je demande à Deezer…' }), S.dim])
  fetch('/api/deezer')
    .then((response) => response.json())
    .then((body: { music?: DeezerMusic | null }) => {
      const data = body.music
      if (!data) {
        line([t({ en: 'nothing to show, Deezer is quiet.', fr: 'rien à montrer, Deezer est silencieux.' }), S.warn])
        return
      }
      console.table(data.artists.map((artist) => ({ artist: artist.name, link: artist.link })))
      if (data.onRepeat) {
        line([t({ en: 'on repeat: ', fr: 'en boucle : ' }), S.dim], [`${data.onRepeat.title} — ${data.onRepeat.artist}`, S.none])
      }
    })
    .catch(() => {
      line([t({ en: 'Deezer did not answer.', fr: 'Deezer n’a pas répondu.' }), S.err])
    })
}

function contact() {
  line(['email:    ', S.dim], [SOCIAL.email.replace('mailto:', ''), S.none])
  line(['github:   ', S.dim], [SOCIAL.github, S.none])
  line(['linkedin: ', S.dim], [SOCIAL.linkedin, S.none])
  line(['x:        ', S.dim], [SOCIAL.twitter, S.none])
}

function cv() {
  const href = resumeHref(currentLang())
  window.open(href, '_blank', 'noopener')
  ok(`${t({ en: 'opening', fr: 'ouverture de' })} ${href}`)
}

function theme(value?: unknown) {
  const next = resolveToggle(value, getTheme(), THEMES)
  if (next === null) {
    line([`theme: ${t({ en: 'unknown theme', fr: 'thème inconnu' })}`, S.err])
    usage("theme('dark' | 'light')")
    return
  }
  setTheme(next)
  ok(`theme → ${next}`)
}

function lang(value?: unknown) {
  const next = resolveToggle(value, currentLang(), LANGS)
  if (next === null) {
    line([`lang: ${t({ en: 'unknown language', fr: 'langue inconnue' })}`, S.err])
    usage("lang('en' | 'fr')")
    return
  }
  window.dispatchEvent(new CustomEvent(LANG_EVENT, { detail: next }))
  ok(`lang → ${next}`)
}

function sudo(...args: unknown[]) {
  const command = args.map(String).join(' ').toLowerCase()
  line(['[sudo] ', S.dim], [t({ en: 'password for visitor: ', fr: 'mot de passe de visitor : ' }), S.none], ['••••••••', S.dim])
  line([t({ en: 'visitor is not in the sudoers file. this incident will be reported.', fr: 'visitor n’est pas dans le fichier sudoers. cet incident sera signalé.' }), S.err])
  if (!command.includes('hire') && !command.includes('embauche')) return
  line([t({ en: '…reported to Noa, who says: let’s talk.', fr: '…signalé à Noa, qui répond : on en parle ?' }), S.ok])
  window.location.href = SOCIAL.email
}

let wiping = false

function rm(...args: unknown[]) {
  const flags = args.map(String)
  if (!isDestructiveRm(flags)) {
    line([`rm: ${t({ en: 'cannot remove', fr: 'impossible de supprimer' })} '${flags[0] ?? ''}': ${t({ en: 'read-only portfolio', fr: 'portfolio en lecture seule' })}`, S.err])
    return
  }
  if (wiping) return
  wiping = true
  // Avec prefers-reduced-motion, la blague reste dans la console : la page ne bouge pas
  const animate = !matchMedia('(prefers-reduced-motion: reduce)').matches
  if (animate) document.documentElement.classList.add(WIPE_CLASS)
  line([`rm: ${t({ en: 'removing', fr: 'suppression de' })} '/'…`, S.warn])
  SECTION_IDS.forEach((name, index) => {
    setTimeout(() => line([`rm: ${t({ en: 'removed', fr: 'supprimé' })} '${name}'`, S.dim]), (index + 1) * (WIPE_MS / (SECTION_IDS.length + 1)))
  })
  setTimeout(() => {
    if (animate) document.documentElement.classList.remove(WIPE_CLASS)
    wiping = false
    line([t({ en: 'jk.', fr: 'nan.' }), S.bold], [' git checkout -- .', S.key])
    ok(t({ en: 'restored. please don’t.', fr: 'restauré. s’il te plaît, non.' }))
  }, WIPE_MS + 200)
}

function exit() {
  line([t({ en: 'exit: there is no exit. close the tab like everyone else.', fr: 'exit : il n’y a pas de sortie. ferme l’onglet comme tout le monde.' }), S.warn])
}

const api = {
  help,
  ls,
  cd,
  whoami,
  experience,
  projects: projectsCommand,
  stack,
  music,
  contact,
  cv,
  theme,
  lang,
  sudo,
  rm,
  exit,
}

function boot(art: string | null) {
  const steps: (() => void)[] = [
    () => line(['sx-shell', S.badge], [' v1 · ' + t({ en: 'booting', fr: 'démarrage' }), S.dim]),
    () => ok(`react ${reactVersion} · vite · tailwind`),
    () =>
      ok(
        `${experiences.length} ${t({ en: 'experiences', fr: 'expériences' })} · ${projects.length} ${t({ en: 'projects', fr: 'projets' })} · ${skillGroups.length} ${t({ en: 'skill groups', fr: 'groupes de compétences' })}`,
      ),
    () => ok(`1 ${t({ en: 'human found', fr: 'humain trouvé' })}: Noa (@17Sx)`),
    () => prompt(t({ en: 'type sx.help() to start', fr: 'tape sx.help() pour commencer' })),
  ]
  if (art) console.log(`%c${art}`, 'font-family: monospace')
  steps.forEach((step, index) => setTimeout(step, index * BOOT_STEP_MS))
}

export function installShell() {
  if ('sx' in window) return
  Object.defineProperty(window, 'sx', { value: api, configurable: true })
  for (const [name, command] of Object.entries(api)) {
    // `help` reste sous sx : la console de Firefox a son propre help(). Un nom déjà pris
    // par le navigateur ou une extension reste intact lui aussi : sx.<nom> marche toujours.
    if (name === 'help' || name in window) continue
    Object.defineProperty(window, name, { value: command, configurable: true, writable: true })
  }

  fetch('/ascii/ascii-art.txt')
    .then((response) => (response.ok ? response.text() : null))
    .catch(() => null)
    .then((art) => boot(art?.trimEnd() || null))
}
