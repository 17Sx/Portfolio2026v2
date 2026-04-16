import { useState, useEffect } from 'react'

export function useVisitorCount() {
  const [count, setCount] = useState<number | null>(null)
  useEffect(() => {
    fetch('https://api.counterapi.dev/v1/17sx-portfolio/visits/up')
      .then(r => r.json())
      .then(d => setCount(d.count))
      .catch(() => {})
  }, [])
  return count
}
