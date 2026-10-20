import { useEffect, useRef } from 'react'

const STEP = 7

function seeded(text: string) {
  let hash = 2166136261
  for (const char of text) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619)
  return () => {
    hash = Math.imul(hash ^ (hash >>> 15), 2246822507)
    hash = Math.imul(hash ^ (hash >>> 13), 3266489909)
    return ((hash ^= hash >>> 16) >>> 0) / 4294967296
  }
}

type Field = (u: number, v: number, t: number) => number

function makeField(seed: string): Field {
  const random = seeded(seed)
  const kind = Math.floor(random() * 4)
  const cx = 0.25 + random() * 0.5
  const cy = 0.25 + random() * 0.5
  const freq = 9 + random() * 7
  const tilt = random() * 1.4 - 0.7
  const drift = 0.12 + random() * 0.1

  const fields: Field[] = [
    (u, v, t) => 0.5 + 0.5 * Math.cos(Math.hypot(u - cx, (v - cy) * 0.7) * freq * 1.6 - t * 1.4),
    (u, v, t) => 0.5 + 0.5 * Math.sin((v + u * tilt) * freq - t * 1.1),
    (u, v, t) => {
      const x = cx + Math.sin(t * 0.45) * drift
      const y = cy + Math.cos(t * 0.6) * drift
      return Math.max(0, 1 - Math.hypot((u - x) / 0.32, (v - y) / 0.42))
    },
    (u, v, t) => {
      const sweep = ((t * 0.12) % 1.6) - 0.3
      return Math.max(0, 1 - Math.abs(u + (v - 0.5) * tilt - sweep) / 0.18)
    },
  ]
  const shape = fields[kind]

  return (u, v, t) => {
    const fade = Math.max(0.2, 1 - Math.hypot(u - cx, v - cy) * 1.15)
    return Math.min(1, Math.max(0, shape(u, v, t) * fade))
  }
}

export function DotField({ seed, active }: { seed: string; active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const activeRef = useRef(active)

  useEffect(() => {
    activeRef.current = active
  }, [active])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    const field = makeField(seed)
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let width = 0
    let height = 0
    let frame = 0
    let visible = false
    let time = 0
    let boost = 0
    let last = performance.now()

    function resize() {
      const rect = canvas!.getBoundingClientRect()
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      canvas!.width = Math.round(width * ratio)
      canvas!.height = Math.round(height * ratio)
      context!.setTransform(ratio, 0, 0, ratio, 0, 0)
      draw()
    }

    function draw() {
      context!.clearRect(0, 0, width, height)
      context!.fillStyle = getComputedStyle(canvas!).color
      const cols = Math.ceil(width / STEP)
      const rows = Math.ceil(height / STEP)
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const value = field(x / cols, y / rows, time)
          context!.globalAlpha = 0.07 + value * (0.5 + boost * 0.35)
          context!.beginPath()
          context!.arc(x * STEP + STEP / 2, y * STEP + STEP / 2, 0.45 + value * (1.1 + boost * 0.6), 0, Math.PI * 2)
          context!.fill()
        }
      }
      context!.globalAlpha = 1
    }

    function tick(now: number) {
      const delta = Math.min(0.05, (now - last) / 1000)
      last = now
      boost += ((activeRef.current ? 1 : 0) - boost) * Math.min(1, delta * 6)
      time += delta * (1 + boost * 1.8)
      draw()
      frame = visible ? requestAnimationFrame(tick) : 0
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)

    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible && !still && !frame) {
        last = performance.now()
        frame = requestAnimationFrame(tick)
      }
    })
    visibility.observe(canvas)

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      visibility.disconnect()
    }
  }, [seed])

  return <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />
}
