import { useEffect, useRef, useState } from 'react'

const VERTEX = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`

// Ordered (Bayer 8x8) dithering of the source, quantised to eight greys on a 1px grid,
// so the grain stays fine and the scene reads through it.
const FRAGMENT = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform sampler2D u_source;
uniform vec2 u_resolution;
uniform vec2 u_sourceSize;
uniform float u_cell;
uniform float u_gamma;

float bayer2(vec2 a) {
  a = floor(a);
  return fract(a.x / 2.0 + a.y * a.y * 0.75);
}
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

void main() {
  vec2 frag = vec2(gl_FragCoord.x, u_resolution.y - gl_FragCoord.y);
  vec2 block = floor(frag / u_cell);

  // object-fit: cover
  float scale = max(u_resolution.x / u_sourceSize.x, u_resolution.y / u_sourceSize.y);
  vec2 offset = (u_resolution - u_sourceSize * scale) * 0.5;
  vec2 uv = ((block + 0.5) * u_cell - offset) / (u_sourceSize * scale);

  vec3 color = texture2D(u_source, clamp(uv, 0.0, 1.0)).rgb;
  float luma = pow(dot(color, vec3(0.299, 0.587, 0.114)), u_gamma);

  float threshold = bayer8(block) - 0.5;
  float tone = clamp(floor(luma * 7.0 + threshold + 0.5) / 7.0, 0.0, 1.0);

  gl_FragColor = vec4(mix(vec3(0.035, 0.035, 0.04), vec3(0.98, 0.98, 0.97), tone), 1.0);
}
`

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('createShader failed')
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? 'shader compile failed')
  return shader
}

function createProgram(gl: WebGLRenderingContext) {
  const program = gl.createProgram()
  if (!program) throw new Error('createProgram failed')
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX))
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT))
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? 'program link failed')
  return program
}

// The night scene lives in the bottom eighth of the range: lift it so the ridges and the fog survive quantisation.
const GAMMA = { light: 1, dark: 0.6 }

type Source = HTMLVideoElement | HTMLImageElement

function sourceSize(source: Source): [number, number] {
  return source instanceof HTMLVideoElement ? [source.videoWidth, source.videoHeight] : [source.naturalWidth, source.naturalHeight]
}

function sourceReady(source: Source) {
  return source instanceof HTMLVideoElement ? source.readyState >= source.HAVE_CURRENT_DATA : source.complete && source.naturalWidth > 0
}

/**
 * The banner scene, dithered live on the GPU. Plays the video, or draws the poster once when motion is reduced.
 * Without WebGL it falls back to the plain poster.
 */
export function DitherBanner({ theme, still }: { theme: 'light' | 'dark'; still: boolean }) {
  const video = `/banner/wanderer-${theme}.mp4`
  const poster = `/banner/wanderer-${theme}.jpg`
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const posterRef = useRef<HTMLImageElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [fallback, setFallback] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const source = still ? posterRef.current : videoRef.current
    if (!canvas || !source) return
    const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false })
    if (!gl) {
      setFallback(true)
      return
    }

    let program: WebGLProgram
    try {
      program = createProgram(gl)
    } catch (error) {
      console.error(error)
      setFallback(true)
      return
    }
    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const position = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

    const uniform = (name: string) => gl.getUniformLocation(program, name)
    const u = {
      resolution: uniform('u_resolution'),
      sourceSize: uniform('u_sourceSize'),
      cell: uniform('u_cell'),
      gamma: uniform('u_gamma'),
    }

    let ratio = 1
    let frame = 0
    let visible = false
    let uploaded = false

    function draw() {
      if (!sourceReady(source!)) return
      gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGB, gl!.RGB, gl!.UNSIGNED_BYTE, source!)
      uploaded = true
      gl!.uniform2f(u.resolution, canvas!.width, canvas!.height)
      gl!.uniform2f(u.sourceSize, ...sourceSize(source!))
      gl!.uniform1f(u.cell, Math.max(1, Math.round(ratio)))
      gl!.uniform1f(u.gamma, GAMMA[theme])
      gl!.drawArrays(gl!.TRIANGLES, 0, 3)
    }

    function tick() {
      draw()
      frame = visible && (!still || !uploaded) ? requestAnimationFrame(tick) : 0
    }

    function wake() {
      if (visible && !frame) frame = requestAnimationFrame(tick)
    }

    function resize() {
      const rect = canvas!.getBoundingClientRect()
      ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas!.width = Math.round(rect.width * ratio)
      canvas!.height = Math.round(rect.height * ratio)
      gl!.viewport(0, 0, canvas!.width, canvas!.height)
      draw()
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)

    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (source instanceof HTMLVideoElement) {
        // A refused play() leaves the poster underneath, the intended fallback.
        if (visible) void source.play().catch(() => {})
        else source.pause()
      }
      wake()
    })
    visibility.observe(canvas)

    const onLoad = () => wake()
    source.addEventListener(still ? 'load' : 'loadeddata', onLoad)

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      visibility.disconnect()
      source.removeEventListener(still ? 'load' : 'loadeddata', onLoad)
      gl.deleteTexture(texture)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
    }
  }, [theme, still])

  const media = 'absolute inset-0 h-full w-full object-cover object-center'

  if (fallback) return <img src={poster} alt="" className={media} />

  return (
    <>
      {/* Shown until the first dithered frame lands, and the shader's source when motion is reduced. */}
      <img key={poster} ref={posterRef} src={poster} alt="" aria-hidden className={media} />
      {still ? null : (
        <video
          key={video}
          ref={videoRef}
          src={video}
          muted
          loop
          playsInline
          disablePictureInPicture
          disableRemotePlayback
          aria-hidden
          className="pointer-events-none absolute size-px opacity-0"
        />
      )}
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />
    </>
  )
}
