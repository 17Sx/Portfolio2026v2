import { Outlet } from 'react-router-dom'
import { SideNav } from '../components/SideNav.tsx'

export default function Root() {
  return (
    <div className="relative h-screen w-full bg-white">
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <div className="absolute inset-0" />
        <img
          src="/image.png"
          alt=""
          className="h-full opacity-5"
        />
      </div>

      <div className="relative z-10 h-screen text-black">
        <Outlet />
      </div>

      <SideNav />
    </div>
  )
}
