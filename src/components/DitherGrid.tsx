import { useEffect, useRef } from 'react'

const CELL = 6
const SQUARE = 4
const RADIUS = 64

// Bayer 8x8 thresholds in [0, 1).
const BAYER = (() => {
  const size = 8
  const matrix = new Float32Array(size * size)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let value = 0
      for (let bit = 0, xc = x, yc = x ^ y; bit < 3; bit++, xc >>= 1, yc >>= 1) {
        value = (value << 2) | ((yc & 1) << 1) | (xc & 1)
      }
      matrix[y * size + x] = value / (size * size)
    }
  }
  return matrix
})()

/** A grid of square cells, lit by ordered dithering. The pointer leaves a warm trail that fades out. */
export function DitherGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let width = 0
    let height = 0
    let cols = 0
    let rows = 0
    let heat = new Float32Array(0)
    let frame = 0
    let visible = false
    let time = 0
    let last = performance.now()
    let pointer: { x: number; y: number } | null = null

    function resize() {
      const rect = canvas!.getBoundingClientRect()
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      canvas!.width = Math.round(width * ratio)
      canvas!.height = Math.round(height * ratio)
      context!.setTransform(ratio, 0, 0, ratio, 0, 0)
      cols = Math.ceil(width / CELL)
      rows = Math.ceil(height / CELL)
      heat = new Float32Array(cols * rows)
      draw()
    }

    function warm() {
      if (!pointer) return
      const reach = Math.ceil(RADIUS / CELL)
      const cx = Math.floor(pointer.x / CELL)
      const cy = Math.floor(pointer.y / CELL)
      for (let y = Math.max(0, cy - reach); y <= Math.min(rows - 1, cy + reach); y++) {
        for (let x = Math.max(0, cx - reach); x <= Math.min(cols - 1, cx + reach); x++) {
          const distance = Math.hypot(x * CELL + CELL / 2 - pointer.x, y * CELL + CELL / 2 - pointer.y) / RADIUS
          if (distance >= 1) continue
          const i = y * cols + x
          heat[i] = Math.max(heat[i], (1 - distance * distance) ** 2)
        }
      }
    }

    function draw() {
      context!.clearRect(0, 0, width, height)
      context!.fillStyle = getComputedStyle(canvas!).color
      const offset = (CELL - SQUARE) / 2
      for (let y = 0; y < rows; y++) {
        const ground = (y / rows) ** 1.6 * 0.42
        for (let x = 0; x < cols; x++) {
          const i = y * cols + x
          const wave = 0.06 * Math.sin(x * 0.21 + time * 0.7) * Math.cos(y * 0.33 - time * 0.5)
          const value = 0.04 + ground + wave + heat[i] * 0.95
          const lit = value > BAYER[(y & 7) * 8 + (x & 7)]
          context!.globalAlpha = lit ? 0.22 + heat[i] * 0.6 : 0.06
          context!.fillRect(x * CELL + offset, y * CELL + offset, SQUARE, SQUARE)
        }
      }
      context!.globalAlpha = 1
    }

    function tick(now: number) {
      const delta = Math.min(0.05, (now - last) / 1000)
      last = now
      if (!still) time += delta
      const decay = Math.pow(0.12, delta)
      let warmth = 0
      for (let i = 0; i < heat.length; i++) {
        heat[i] *= decay
        warmth += heat[i]
      }
      warm()
      draw()
      const idle = still && !pointer && warmth < 0.5
      frame = visible && !idle ? requestAnimationFrame(tick) : 0
    }

    function wake() {
      if (!visible || frame) return
      last = performance.now()
      frame = requestAnimationFrame(tick)
    }

    // Text sits on top of the grid, so the pointer is tracked on the window.
    function onPointer(event: PointerEvent) {
      const rect = canvas!.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      const inside = x >= -RADIUS && y >= -RADIUS && x <= rect.width + RADIUS && y <= rect.height + RADIUS
      pointer = inside && event.type !== 'pointerleave' ? { x, y } : null
      if (inside) wake()
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)

    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      wake()
    })
    visibility.observe(canvas)

    window.addEventListener('pointermove', onPointer, { passive: true })
    document.documentElement.addEventListener('pointerleave', onPointer)

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      visibility.disconnect()
      window.removeEventListener('pointermove', onPointer)
      document.documentElement.removeEventListener('pointerleave', onPointer)
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full text-zinc-900 dark:text-zinc-100" />
}
