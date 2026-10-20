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

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let still = motion.matches
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

    const warm = () => {
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

    const draw = () => {
      context.clearRect(0, 0, width, height)
      context.fillStyle = getComputedStyle(canvas).color
      const offset = (CELL - SQUARE) / 2
      for (let y = 0; y < rows; y++) {
        const ground = (y / rows) ** 1.6 * 0.42
        for (let x = 0; x < cols; x++) {
          const i = y * cols + x
          const wave = 0.06 * Math.sin(x * 0.21 + time * 0.7) * Math.cos(y * 0.33 - time * 0.5)
          const value = 0.04 + ground + wave + heat[i] * 0.95
          const lit = value > BAYER[(y & 7) * 8 + (x & 7)]
          context.globalAlpha = lit ? 0.22 + heat[i] * 0.6 : 0.06
          context.fillRect(x * CELL + offset, y * CELL + offset, SQUARE, SQUARE)
        }
      }
      context.globalAlpha = 1
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      cols = Math.ceil(width / CELL)
      rows = Math.ceil(height / CELL)
      heat = new Float32Array(cols * rows)
      draw()
    }

    const tick = (now: number) => {
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

    const wake = () => {
      if (!visible || frame) return
      last = performance.now()
      frame = requestAnimationFrame(tick)
    }

    const onPointer = (event: PointerEvent) => {
      pointer = event.type === 'pointerleave' ? null : { x: event.offsetX, y: event.offsetY }
      wake()
    }

    const onMotion = () => {
      still = motion.matches
      wake()
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)

    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      wake()
    })
    visibility.observe(canvas)

    // The ink follows the theme class on <html>: an idle grid has to repaint when it flips.
    const theme = new MutationObserver(draw)
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    canvas.addEventListener('pointermove', onPointer, { passive: true })
    canvas.addEventListener('pointerleave', onPointer)
    motion.addEventListener('change', onMotion)

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      visibility.disconnect()
      theme.disconnect()
      canvas.removeEventListener('pointermove', onPointer)
      canvas.removeEventListener('pointerleave', onPointer)
      motion.removeEventListener('change', onMotion)
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full text-zinc-900 dark:text-zinc-100" />
}
