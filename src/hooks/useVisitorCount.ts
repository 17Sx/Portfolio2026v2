import { useState, useEffect } from 'react'

export function useVisitorCount() {
  const [count, setCount] = useState<number | null>(null)
  useEffect(() => {
    fetch('/api/visitors')
      .then(r => r.json())
      .then((d: { count: number | null }) => setCount(d.count))
      .catch(() => {})
  }, [])
  return count
}
