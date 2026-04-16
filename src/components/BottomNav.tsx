import { NavLink } from 'react-router-dom'

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 flex md:hidden border-t border-black/10 bg-white/95 backdrop-blur-sm">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `flex flex-1 items-center justify-center py-4 font-mono text-xs uppercase tracking-widest transition-colors ${
            isActive ? 'text-black' : 'text-black/35 hover:text-black/60'
          }`
        }
      >
        Home
      </NavLink>
      <NavLink
        to="/projects"
        className={({ isActive }) =>
          `flex flex-1 items-center justify-center py-4 font-mono text-xs uppercase tracking-widest transition-colors border-l border-black/10 ${
            isActive ? 'text-black' : 'text-black/35 hover:text-black/60'
          }`
        }
      >
        Projects
      </NavLink>
      <NavLink
        to="/stack"
        className={({ isActive }) =>
          `flex flex-1 items-center justify-center py-4 font-mono text-xs uppercase tracking-widest transition-colors border-l border-black/10 ${
            isActive ? 'text-black' : 'text-black/35 hover:text-black/60'
          }`
        }
      >
        Stack
      </NavLink>
    </nav>
  )
}
