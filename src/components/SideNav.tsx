import { NavLink } from 'react-router-dom'

export function SideNav() {
  return (
    <nav className="hidden md:flex fixed right-6 top-1/2 -translate-y-1/2 z-20 flex-col items-center gap-8">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `font-mono text-xs uppercase tracking-widest transition-colors [writing-mode:vertical-rl] ${
            isActive ? 'text-black' : 'text-black/30 hover:text-black/60'
          }`
        }
      >
        Home
      </NavLink>
      <NavLink
        to="/projects"
        className={({ isActive }) =>
          `font-mono text-xs uppercase tracking-widest transition-colors [writing-mode:vertical-rl] ${
            isActive ? 'text-black' : 'text-black/30 hover:text-black/60'
          }`
        }
      >
        Projects
      </NavLink>
      <NavLink
        to="/stack"
        className={({ isActive }) =>
          `font-mono text-xs uppercase tracking-widest transition-colors [writing-mode:vertical-rl] ${
            isActive ? 'text-black' : 'text-black/30 hover:text-black/60'
          }`
        }
      >
        Stack
      </NavLink>
    </nav>
  )
}
