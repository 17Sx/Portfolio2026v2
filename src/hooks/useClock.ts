import { useEffect, useState } from 'react'

function pad(value: number) {
  return String(value).padStart(2, '0')
}

export function useClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  return {
    h: pad(now.getHours()),
    m: pad(now.getMinutes()),
    s: pad(now.getSeconds()),
  }
}
