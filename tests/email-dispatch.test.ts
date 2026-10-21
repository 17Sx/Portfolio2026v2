import { describe, expect, it } from 'vitest'
import { SOCIAL } from '../src/constants/social.ts'
import {
  CELL_COUNT,
  CELL_MS,
  CHAR_MS,
  EMAIL_ADDRESS,
  ENTER_MS,
  EXIT_MS,
  HOLD_MS,
  cellOrder,
  dispatchTimeline,
  emailAddress,
  isPlainClick,
} from '../src/components/emailSequence.ts'

const plain = { button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false }

describe('email dispatch', () => {
  it('reads the address from the mailto link', () => {
    expect(EMAIL_ADDRESS).toBe('noa.obringer@gmail.com')
    expect(SOCIAL.email).toBe(`mailto:${EMAIL_ADDRESS}`)
    expect(() => emailAddress('https://17sx.me')).toThrow(/mailto/)
  })

  it('keeps modified clicks on the real link', () => {
    expect(isPlainClick(plain)).toBe(true)
    expect(isPlainClick({ ...plain, metaKey: true })).toBe(false)
    expect(isPlainClick({ ...plain, ctrlKey: true })).toBe(false)
    expect(isPlainClick({ ...plain, shiftKey: true })).toBe(false)
    expect(isPlainClick({ ...plain, button: 1 })).toBe(false)
  })

  it('lights the stamp in dither order', () => {
    const order = cellOrder()
    expect(new Set(order)).toEqual(new Set(Array.from({ length: CELL_COUNT }, (_, index) => index)))
    expect(order).not.toEqual(Array.from({ length: CELL_COUNT }, (_, index) => index))
    const adjacent = order.slice(1).filter((cell, index) => Math.abs(cell - order[index]) === 1)
    expect(adjacent.length).toBeLessThan(CELL_COUNT / 2)
  })

  it('types, then fills, then leaves before opening the mail app', () => {
    const timeline = dispatchTimeline(EMAIL_ADDRESS)
    const typed = timeline.filter((event) => event.kind === 'typed')
    const lit = timeline.filter((event) => event.kind === 'lit')
    const exit = timeline.find((event) => event.kind === 'exit')
    const send = timeline.at(-1)

    expect(typed.map((event) => event.count)).toEqual(Array.from({ length: EMAIL_ADDRESS.length }, (_, index) => index + 1))
    expect(typed[0]?.at).toBe(ENTER_MS + CHAR_MS)
    expect(lit).toHaveLength(CELL_COUNT)
    expect(lit[0] && typed.at(-1) ? lit[0].at : 0).toBeGreaterThan(typed.at(-1)?.at ?? 0)
    expect(exit && send && send.kind === 'send' ? send.at - exit.at : 0).toBe(EXIT_MS)
    expect(send).toEqual({
      at: ENTER_MS + EMAIL_ADDRESS.length * CHAR_MS + CELL_COUNT * CELL_MS + HOLD_MS + EXIT_MS,
      kind: 'send',
    })
  })
})
