import { NavLink } from 'react-router-dom'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'inline-block py-1 font-mono text-sm uppercase tracking-[0.14em] transition-colors [writing-mode:vertical-rl]',
    'outline-none focus-visible:underline focus-visible:decoration-black/35 focus-visible:underline-offset-4',
    isActive ? 'font-medium text-black' : 'text-black/50 hover:text-black/80',
  ].join(' ')

export function SideNav() {
  return (
    <nav
      className="hidden md:flex fixed right-5 sm:right-6 top-1/2 z-20 -translate-y-1/2 flex-col items-center gap-12"
      aria-label="Navigation principale"
    >
      <NavLink to="/" end className={linkClass}>
        Home
      </NavLink>
      <NavLink to="/projects" className={linkClass}>
        Projects
      </NavLink>
      <NavLink to="/stack" className={linkClass}>
        Stack
      </NavLink>
    </nav>
  )
}
