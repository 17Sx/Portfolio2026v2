import { Outlet } from 'react-router-dom'

export default function Root() {
  return (
    <div className="relative min-h-screen overflow-x-hidden w-full h-full bg-black">
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <div className="absolute inset-0" />
        <img
          src="/bg.png"
          alt=""
          className="h-full opacity-5"
        />
      </div>

      <div className="relative z-10 min-h-screen text-white">
        <Outlet />
      </div>
    </div>
  )
}
