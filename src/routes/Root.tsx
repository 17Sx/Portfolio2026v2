import { Outlet } from 'react-router-dom'
import { SideNav } from '../components/SideNav.tsx'
import { BottomNav } from '../components/BottomNav.tsx'
import { HomeHeader } from '../sections/home/HomeHeader.tsx'

export default function Root() {
  return (
    <div className="relative h-dvh w-full bg-white">
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <div className="absolute inset-0" />
        <img src="/image.png" alt="" className="h-full opacity-5" />
      </div>

      <div className="relative z-10 h-dvh flex flex-col text-black">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-8 pt-6">
          <HomeHeader />
        </div>
        <div className="flex-1 min-h-0">
          <Outlet />
        </div>
      </div>

      <SideNav />
      <BottomNav />
    </div>
  )
}
