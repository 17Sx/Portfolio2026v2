// Renders the looping banner videos and their posters into public/banner.
// Everything is procedural and seeded, so a run always produces the same frames.
// Needs ffmpeg (with libx264) on the PATH.
//
//   node scripts/banner/render.mjs                  both themes -> mp4 + jpg poster
//   node scripts/banner/render.mjs --still=4 --out=/tmp/banner   one png per theme at t=4s

import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { once } from 'node:events'
import { join } from 'node:path'

const W = 1920
const H = 720
const S = H / 600
const FPS = 30
const SECONDS = 16
const FRAMES = FPS * SECONDS
const TAU = Math.PI * 2

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [key, value = 'true'] = arg.replace(/^--/, '').split('=')
    return [key, value]
  }),
)
const outDir = args.out ?? join(import.meta.dirname, '../../public/banner')

const PALETTES = {
  light: {
    skyTop: [221, 221, 219],
    skyBottom: [245, 244, 241],
    disc: [251, 250, 247],
    halo: [250, 249, 245],
    layers: [
      [196, 196, 196],
      [166, 166, 167],
      [128, 128, 130],
      [92, 92, 95],
      [34, 34, 36],
    ],
    haze: [244, 243, 240],
    fog: [245, 244, 241],
    figure: [20, 20, 22],
    birds: [72, 72, 74],
    stars: 0,
  },
  dark: {
    skyTop: [4, 4, 6],
    skyBottom: [31, 31, 36],
    disc: [228, 228, 226],
    halo: [64, 64, 70],
    layers: [
      [20, 20, 23],
      [15, 15, 18],
      [11, 11, 13],
      [7, 7, 9],
      [3, 3, 4],
    ],
    haze: [30, 30, 35],
    fog: [50, 50, 56],
    figure: [1, 1, 2],
    birds: null,
    stars: 150,
  },
}

// ---------------------------------------------------------------- utilities

function rng(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)
const smooth = (a, b, v) => {
  const t = clamp01((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}
const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10)
const mix = (a, b, t) => a + (b - a) * t

function noise1(seed) {
  const random = rng(seed)
  const lattice = Float32Array.from({ length: 1024 }, random)
  return (x) => {
    const i = Math.floor(x)
    const f = fade(x - i)
    return mix(lattice[i & 1023], lattice[(i + 1) & 1023], f)
  }
}

function fbm1(seed, octaves) {
  const layers = Array.from({ length: octaves }, (_, i) => noise1(seed + i * 97))
  return (x) => {
    let sum = 0
    let amp = 0.5
    let norm = 0
    for (let i = 0; i < octaves; i++) {
      sum += layers[i](x * 2 ** i) * amp
      norm += amp
      amp *= 0.5
    }
    return sum / norm
  }
}

// Fog texture: fbm that wraps horizontally so it can scroll forever.
const TW = 1024
const TH = 160
function fogTexture(seed) {
  const tex = new Float32Array(TW * TH)
  const random = rng(seed)
  const octaves = [
    { cells: 8, rows: 3, amp: 0.55 },
    { cells: 16, rows: 6, amp: 0.27 },
    { cells: 32, rows: 12, amp: 0.13 },
    { cells: 64, rows: 24, amp: 0.05 },
  ].map((o) => ({ ...o, lattice: Float32Array.from({ length: o.cells * (o.rows + 1) }, random) }))

  for (let y = 0; y < TH; y++) {
    for (let x = 0; x < TW; x++) {
      let value = 0
      for (const { cells, rows, amp, lattice } of octaves) {
        const fx = (x / TW) * cells
        const fy = (y / TH) * rows
        const ix = Math.floor(fx)
        const iy = Math.floor(fy)
        const tx = fade(fx - ix)
        const ty = fade(fy - iy)
        const x0 = ix % cells
        const x1 = (ix + 1) % cells
        const top = mix(lattice[iy * cells + x0], lattice[iy * cells + x1], tx)
        const bottom = mix(lattice[(iy + 1) * cells + x0], lattice[(iy + 1) * cells + x1], tx)
        value += mix(top, bottom, ty) * amp
      }
      tex[y * TW + x] = value
    }
  }
  return tex
}

function sampleFog(tex, u, v) {
  u = ((u % TW) + TW) % TW
  v = v < 0 ? 0 : v > TH - 1.001 ? TH - 1.001 : v
  const ix = Math.floor(u)
  const iy = Math.floor(v)
  const tx = u - ix
  const ty = v - iy
  const x1 = (ix + 1) % TW
  const r0 = iy * TW
  const r1 = r0 + TW
  return mix(mix(tex[r0 + ix], tex[r0 + x1], tx), mix(tex[r1 + ix], tex[r1 + x1], tx), ty)
}

// Coverage of a point by a polygon, 4x4 supersampled over the pixel.
function insidePolygon(points, x, y) {
  let inside = false
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, yi] = points[i]
    const [xj, yj] = points[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

function segmentDistance(px, py, ax, ay, bx, by) {
  const dx = bx - ax
  const dy = by - ay
  const t = clamp01(((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy))
  return Math.hypot(px - ax - dx * t, py - ay - dy * t)
}

// ---------------------------------------------------------------- scene

// Mountain ridges, far to near. Each returns the ridge height (in px) per column.
const RIDGES = [
  { base: 0.63, amp: 0.25, freq: 2.2, seed: 11, octaves: 6, peak: 1.6 },
  { base: 0.71, amp: 0.17, freq: 3.4, seed: 23, octaves: 6, peak: 1.4 },
  { base: 0.81, amp: 0.12, freq: 4.6, seed: 37, octaves: 5, peak: 1.2 },
  { base: 0.92, amp: 0.08, freq: 6.0, seed: 41, octaves: 5, peak: 1.0 },
]

const CLIFF_EDGE = 0.43 * W
const CLIFF_TOP = 0.64 * H
const CLIFF_DROP = 0.035 * W

function buildRidges() {
  const ridges = RIDGES.map(({ base, amp, freq, seed, octaves, peak }) => {
    const f = fbm1(seed, octaves)
    return Float32Array.from({ length: W }, (_, x) => base * H - amp * H * f((x / W) * freq) ** peak * 1.9)
  })

  const roughness = fbm1(53, 5)
  const cliff = Float32Array.from({ length: W }, (_, x) => {
    const grain = (roughness(x / (40 * S)) - 0.5) * 7 * S
    if (x <= CLIFF_EDGE) {
      const rise = (1 - x / CLIFF_EDGE) ** 1.3 * 0.07 * H
      const lip = smooth(CLIFF_EDGE - 30 * S, CLIFF_EDGE, x) * 5 * S
      return CLIFF_TOP - rise + lip + grain * (x / CLIFF_EDGE)
    }
    if (x <= CLIFF_EDGE + CLIFF_DROP) {
      const t = (x - CLIFF_EDGE) / CLIFF_DROP
      return CLIFF_TOP + 5 * S + (H - CLIFF_TOP) * t ** 0.55 + grain
    }
    return H * 2
  })
  return [...ridges, cliff]
}

// Fog bands. `depth` is the number of layers they sit in front of.
const BANDS = [
  { depth: 1, y: 0.6, thickness: 0.075, speed: 7, stretch: 2.4, alpha: 0.78, row: 20 },
  { depth: 2, y: 0.705, thickness: 0.06, speed: 11, stretch: 2.1, alpha: 0.72, row: 55 },
  { depth: 3, y: 0.805, thickness: 0.05, speed: 17, stretch: 1.8, alpha: 0.66, row: 90 },
  { depth: 4, y: 0.905, thickness: 0.05, speed: 25, stretch: 1.6, alpha: 0.6, row: 120 },
  { depth: 5, y: 1.0, thickness: 0.06, speed: 36, stretch: 1.4, alpha: 0.42, row: 140 },
]

const FIGURE_X = CLIFF_EDGE - 0.035 * W

// The wanderer, in figure space (feet at the origin, y up is negative), at time t.
function figureShapes(t, groundY) {
  const p = (x, y) => [FIGURE_X + x * S, groundY + y * S]
  const phase = (t / SECONDS) * TAU

  // Cape: outer edge streams from the right shoulder, the hem ripples back to the knees.
  const outer = []
  const hem = []
  const steps = 16
  for (let i = 0; i <= steps; i++) {
    const s = i / steps
    const flutter = Math.sin(phase * 9 - s * 4.6) * 5.2 * s ** 1.3 + Math.sin(phase * 14 - s * 7.4 + 1.3) * 1.8 * s ** 1.6
    outer.push(p(8 + s * 32 + s * s * 5, -74 + s * 44 + flutter))
    const ripple = Math.sin(phase * 11 - s * 6.2 + 0.6) * 3 * s
    hem.push(p(8 + s * 37, -16 - s * 14 + ripple + (i === steps ? flutter : 0)))
  }
  const cape = [p(-9, -73), ...outer, ...hem.reverse(), p(-9, -16)]

  const body = [p(-5, -77), p(5, -77), p(11, -69), p(12, -42), p(10, -15), p(-10, -15), p(-12, -42), p(-11, -69)]
  const legs = [p(-7.5, -16), p(-2, -16), p(-2.4, 0), p(-7.8, 0), p(-7.5, -16)]
  const legsR = [p(2, -16), p(7.5, -16), p(7.8, 0), p(2.4, 0)]
  const arm = [p(-10, -66), p(-6, -65), p(-15.2, -43), p(-18.6, -44.5)]
  const blade = [p(-17.8, -40), p(-15.6, -40), p(-16.1, 1), p(-17.3, 1)]
  const guard = [p(-23, -39.5), p(-10.4, -39.5), p(-10.4, -37.3), p(-23, -37.3)]
  const grip = [p(-17.5, -46.5), p(-15.9, -46.5), p(-15.9, -39.5), p(-17.5, -39.5)]
  const hood = [p(-6.6, -80), p(-1, -93.5), p(6.4, -86), p(6.8, -78)]

  return {
    polygons: [cape, body, legs, legsR, arm, blade, guard, grip, hood],
    circles: [
      [...p(-0.2, -84.5), 6.6 * S],
      [...p(-16.7, -48), 2.3 * S],
    ],
  }
}

function birdsAt(t) {
  const flock = [
    { offset: 0.0, y: 0.25, scale: 1.0, flap: 38, phase: 0 },
    { offset: 0.025, y: 0.22, scale: 0.85, flap: 41, phase: 1.7 },
    { offset: 0.042, y: 0.27, scale: 0.75, flap: 36, phase: 3.1 },
  ]
  return flock.map(({ offset, y, scale, flap, phase }) => {
    const u = (t / SECONDS + offset) % 1
    const x = -80 * S + u * (W + 160 * S)
    const cy = y * H + Math.sin(u * TAU * 2 + phase) * 6 * S
    const beat = Math.sin((t / SECONDS) * TAU * flap + phase)
    const span = 8.5 * S * scale
    const lift = beat * 4.2 * S * scale
    return {
      x,
      y: cy,
      segments: [
        [x - span, cy - lift, x - span * 0.35, cy - lift * 0.25 - 1.2 * S * scale],
        [x - span * 0.35, cy - lift * 0.25 - 1.2 * S * scale, x, cy + 0.8 * S * scale],
        [x, cy + 0.8 * S * scale, x + span * 0.35, cy - lift * 0.25 - 1.2 * S * scale],
        [x + span * 0.35, cy - lift * 0.25 - 1.2 * S * scale, x + span, cy - lift],
      ],
      width: 1.5 * S * scale,
    }
  })
}

// ---------------------------------------------------------------- renderer

function createRenderer(theme) {
  const palette = PALETTES[theme]
  const layers = buildRidges()
  const textures = BANDS.map((_, i) => fogTexture(1000 + i * 31))
  const N = W * H

  const disc = { x: 0.665 * W, y: 0.36 * H, r: 0.072 * H }

  // Static parts: sky, and each layer's colour (base colour hazed toward its foot).
  const layerColor = (k, x, y) => {
    const base = palette.layers[k]
    const depthIntoLayer = (y - layers[k][x]) / ((0.18 + k * 0.03) * H)
    const haze = smooth(0, 1, depthIntoLayer) * [0.5, 0.46, 0.42, 0.36, 0.12][k]
    return [mix(base[0], palette.haze[0], haze), mix(base[1], palette.haze[1], haze), mix(base[2], palette.haze[2], haze)]
  }

  const sky = new Float32Array(N * 3)
  for (let y = 0; y < H; y++) {
    const g = smooth(0, 0.75 * H, y)
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 3
      const d = Math.hypot(x - disc.x, y - disc.y)
      const glow = Math.exp(-((d / (disc.r * 3.2)) ** 2)) * 0.55
      const core = clamp01(disc.r + 0.5 - d)
      for (let c = 0; c < 3; c++) {
        let v = mix(palette.skyTop[c], palette.skyBottom[c], g)
        v = mix(v, palette.halo[c], glow)
        sky[i + c] = mix(v, palette.disc[c], core)
      }
    }
  }

  // Per pixel: frontmost fully covering layer (0 = sky, k+1 = layer k) and its colour.
  const front = new Uint8Array(N)
  const base = new Float32Array(N * 3)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x
      let f = 0
      for (let k = layers.length - 1; k >= 0; k--) {
        if (y - 0.5 >= layers[k][x]) {
          f = k + 1
          break
        }
      }
      front[i] = f
      const color = f === 0 ? [sky[i * 3], sky[i * 3 + 1], sky[i * 3 + 2]] : layerColor(f - 1, x, y)
      base[i * 3] = color[0]
      base[i * 3 + 1] = color[1]
      base[i * 3 + 2] = color[2]
    }
  }

  const random = rng(7)
  const stars = Array.from({ length: palette.stars }, () => {
    const x = random() * W
    const y = random() * 0.5 * H
    return {
      x,
      y,
      size: 0.55 + random() ** 3 * 1.1,
      bright: 0.25 + random() ** 2 * 0.75,
      cycles: 1 + Math.floor(random() * 4),
      phase: random() * TAU,
    }
  })

  const dither = Float32Array.from({ length: N }, rng(99)).map((v) => v - 0.5)
  const frame = new Float32Array(N * 3)
  const out = Buffer.alloc(N * 3)
  const groundY = layers[4][Math.round(FIGURE_X)]

  function add(i, color, alpha) {
    const j = i * 3
    frame[j] = mix(frame[j], color[0], alpha)
    frame[j + 1] = mix(frame[j + 1], color[1], alpha)
    frame[j + 2] = mix(frame[j + 2], color[2], alpha)
  }

  function fogAlpha(b, x, y, t) {
    const band = BANDS[b]
    const cy = band.y * H
    const th = band.thickness * H
    const profile = Math.exp(-(((y - cy) / th) ** 2))
    if (profile < 0.01) return 0
    const v = (y - cy) / (2.2 * S) + band.row
    const speed = band.speed * S
    const span = band.stretch * S
    // Two copies, one loop apart, crossfaded: the drift loops seamlessly at t = SECONDS.
    const w = t / SECONDS
    const a = sampleFog(textures[b], (x - speed * t) / span, v) - 0.5
    const c = sampleFog(textures[b], (x - speed * (t - SECONDS)) / span, v) - 0.5
    const n = 0.5 + ((1 - w) * a + w * c) / Math.hypot(1 - w, w)
    return band.alpha * profile * smooth(0.36, 0.74, n)
  }

  return function render(t) {
    frame.set(base)

    if (palette.stars) {
      for (const star of stars) {
        const twinkle = 0.55 + 0.45 * Math.sin((t / SECONDS) * TAU * star.cycles + star.phase)
        const r = Math.ceil(star.size * 2)
        for (let dy = -r; dy <= r; dy++) {
          for (let dx = -r; dx <= r; dx++) {
            const x = Math.round(star.x) + dx
            const y = Math.round(star.y) + dy
            if (x < 0 || x >= W || y < 0 || y >= H || front[y * W + x] !== 0) continue
            const d = Math.hypot(x - star.x, y - star.y)
            const a = Math.exp(-((d / star.size) ** 2)) * star.bright * twinkle * 0.9
            add(y * W + x, [236, 236, 240], a)
          }
        }
      }

      // One shooting star per loop.
      const start = 9.2
      const life = 0.9
      if (t >= start && t <= start + life) {
        const u = (t - start) / life
        const hx = mix(0.78 * W, 0.93 * W, u)
        const hy = mix(0.08 * H, 0.19 * H, u)
        const tail = 110 * S
        const tx = hx - tail * 0.8
        const ty = hy - tail * 0.6
        const strength = Math.sin(u * Math.PI)
        for (let y = Math.floor(Math.min(ty, hy) - 3); y <= Math.ceil(Math.max(ty, hy) + 3); y++) {
          for (let x = Math.floor(Math.min(tx, hx) - 3); x <= Math.ceil(Math.max(tx, hx) + 3); x++) {
            if (x < 0 || x >= W || y < 0 || y >= H || front[y * W + x] !== 0) continue
            const along = clamp01(((x - tx) * (hx - tx) + (y - ty) * (hy - ty)) / (tail * tail))
            const d = segmentDistance(x, y, tx, ty, hx, hy)
            add(y * W + x, [240, 240, 244], clamp01(1.2 * S - d) * along ** 2 * strength * 0.85)
          }
        }
      }
    }

    // Fog bands interleaved with the partial edges of the layers in front of each pixel.
    const minRow = Math.floor(Math.min(...BANDS.map((b) => (b.y - b.thickness * 2.2) * H)))
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x
        const f = front[i]
        for (let d = f; d <= layers.length; d++) {
          if (d >= 1 && y >= minRow) {
            const a = fogAlpha(d - 1, x, y, t)
            if (a > 0) add(i, palette.fog, a)
          }
          if (d < layers.length) {
            const cover = clamp01(y + 0.5 - layers[d][x])
            if (cover > 0) add(i, layerColor(d, x, y), cover)
          }
        }
      }
    }

    // The wanderer.
    const { polygons, circles } = figureShapes(t, groundY)
    const bounds = [FIGURE_X - 28 * S, groundY - 98 * S, FIGURE_X + 64 * S, groundY + 4 * S].map(Math.round)
    for (let y = bounds[1]; y <= bounds[3]; y++) {
      for (let x = bounds[0]; x <= bounds[2]; x++) {
        let hits = 0
        for (let sy = 0; sy < 4; sy++) {
          for (let sx = 0; sx < 4; sx++) {
            const px = x + (sx + 0.5) / 4 - 0.5
            const py = y + (sy + 0.5) / 4 - 0.5
            if (
              circles.some(([cx, cy, r]) => (px - cx) ** 2 + (py - cy) ** 2 <= r * r) ||
              polygons.some((poly) => insidePolygon(poly, px, py))
            )
              hits++
          }
        }
        if (hits) add(y * W + x, palette.figure, hits / 16)
      }
    }

    if (palette.birds) {
      for (const bird of birdsAt(t)) {
        const reach = 12 * S
        for (let y = Math.floor(bird.y - reach); y <= Math.ceil(bird.y + reach); y++) {
          for (let x = Math.floor(bird.x - reach); x <= Math.ceil(bird.x + reach); x++) {
            if (x < 0 || x >= W || y < 0 || y >= H) continue
            const d = Math.min(...bird.segments.map((s) => segmentDistance(x, y, ...s)))
            const a = clamp01(bird.width / 2 + 0.5 - d)
            if (a > 0) add(y * W + x, palette.birds, a)
          }
        }
      }
    }

    for (let i = 0; i < N; i++) {
      const j = i * 3
      out[j] = Math.max(0, Math.min(255, Math.round(frame[j] + dither[i])))
      out[j + 1] = Math.max(0, Math.min(255, Math.round(frame[j + 1] + dither[i])))
      out[j + 2] = Math.max(0, Math.min(255, Math.round(frame[j + 2] + dither[i])))
    }
    return out
  }
}

// ---------------------------------------------------------------- output

function ffmpeg(outputArgs) {
  const input = ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24']
  const proc = spawn('ffmpeg', [...input, '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', ...outputArgs], {
    stdio: ['pipe', 'inherit', 'inherit'],
  })
  const done = once(proc, 'close').then(([code]) => {
    if (code !== 0) throw new Error(`ffmpeg exited with code ${code}`)
  })
  return { stdin: proc.stdin, done }
}

async function write(stream, buffer) {
  if (!stream.write(buffer)) await once(stream, 'drain')
}

const COLOR = ['-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709']

mkdirSync(outDir, { recursive: true })

for (const theme of Object.keys(PALETTES)) {
  const render = createRenderer(theme)

  if (args.still) {
    const still = ffmpeg(['-frames:v', '1', join(outDir, `wanderer-${theme}-${args.still}s.png`)])
    await write(still.stdin, render(Number(args.still)))
    still.stdin.end()
    await still.done
    continue
  }

  const poster = ffmpeg(['-frames:v', '1', '-q:v', '3', join(outDir, `wanderer-${theme}.jpg`)])
  await write(poster.stdin, render(0))
  poster.stdin.end()
  await poster.done

  const video = ffmpeg([
    '-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p',
    '-c:v', 'libx264', '-preset', 'veryslow', '-crf', '24', '-tune', 'animation',
    ...COLOR, '-movflags', '+faststart', '-an',
    join(outDir, `wanderer-${theme}.mp4`),
  ])
  for (let f = 0; f < FRAMES; f++) {
    await write(video.stdin, Buffer.from(render(f / FPS)))
    if (f % FPS === 0) process.stdout.write(`\r${theme} ${Math.round((f / FRAMES) * 100)}%`)
  }
  video.stdin.end()
  await video.done
  process.stdout.write(`\r${theme} done\n`)
}
