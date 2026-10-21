import { SOCIAL } from '../constants/social.ts'

export const ENTER_MS = 220
export const CHAR_MS = 26
export const CELL_MS = 36
export const HOLD_MS = 140
export const EXIT_MS = 160

export const STAMP_COLS = 8
export const STAMP_ROWS = 3
export const CELL_COUNT = STAMP_COLS * STAMP_ROWS

const MAILTO = 'mailto:'

export function emailAddress(mailto: string): string {
  if (!mailto.startsWith(MAILTO) || mailto.length === MAILTO.length) {
    throw new Error('email dispatch expects a mailto address')
  }
  return mailto.slice(MAILTO.length)
}

export const EMAIL_ADDRESS = emailAddress(SOCIAL.email)

type PointerButtons = {
  button: number
  metaKey: boolean
  ctrlKey: boolean
  shiftKey: boolean
  altKey: boolean
}

export function isPlainClick(event: PointerButtons): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey
}

// Same ordered dither as the banner, so the stamp lights in that order rather than left to right.
function bayerThreshold(index: number): number {
  const x = index % STAMP_COLS
  const y = Math.floor(index / STAMP_COLS)
  let value = 0
  for (let bit = 0, xc = x, yc = x ^ y; bit < 3; bit += 1, xc >>= 1, yc >>= 1) {
    value = (value << 2) | ((yc & 1) << 1) | (xc & 1)
  }
  return value
}

export function cellOrder(): number[] {
  return Array.from({ length: CELL_COUNT }, (_, index) => index).sort(
    (a, b) => bayerThreshold(a) - bayerThreshold(b) || a - b,
  )
}

export type DispatchEvent =
  | { at: number; kind: 'typed'; count: number }
  | { at: number; kind: 'lit'; count: number }
  | { at: number; kind: 'exit' }
  | { at: number; kind: 'send' }

export function dispatchTimeline(address: string): DispatchEvent[] {
  const events: DispatchEvent[] = []
  let at = ENTER_MS
  for (let count = 1; count <= address.length; count += 1) {
    at += CHAR_MS
    events.push({ at, kind: 'typed', count })
  }
  for (let count = 1; count <= CELL_COUNT; count += 1) {
    at += CELL_MS
    events.push({ at, kind: 'lit', count })
  }
  at += HOLD_MS
  events.push({ at, kind: 'exit' })
  at += EXIT_MS
  events.push({ at, kind: 'send' })
  return events
}
