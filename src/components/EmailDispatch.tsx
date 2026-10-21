import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import { SOCIAL } from '../constants/social.ts'
import { useLanguage } from '../i18n/LanguageContext.tsx'
import {
  CELL_COUNT,
  EMAIL_ADDRESS,
  ENTER_MS,
  EXIT_MS,
  STAMP_COLS,
  armDispatch,
  cellOrder,
} from './emailSequence.ts'
import { isPaletteShortcut } from './paletteShortcut.ts'

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

type Api = { sendEmail: () => void }

const EmailDispatchContext = createContext<Api | null>(null)

export function useSendEmail(): () => void {
  const api = useContext(EmailDispatchContext)
  if (!api) throw new Error('useSendEmail must be used inside EmailDispatch')
  return api.sendEmail
}

function openMail() {
  window.location.href = SOCIAL.email
}

export function EmailDispatch({ children }: { children: ReactNode }) {
  const { t } = useLanguage()
  const titleId = useId()
  const statusId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const [run, setRun] = useState(0)
  const [typed, setTyped] = useState(0)
  const [lit, setLit] = useState(0)
  const [exiting, setExiting] = useState(false)
  const order = useMemo(() => cellOrder(), [])
  const stepOf = useMemo(() => {
    const steps = new Array<number>(CELL_COUNT)
    order.forEach((cell, step) => {
      steps[cell] = step
    })
    return steps
  }, [order])

  const cancel = useCallback(() => {
    setRun(0)
    setExiting(false)
  }, [])

  const sendEmail = useCallback(() => {
    if (window.matchMedia(REDUCED_MOTION).matches) {
      openMail()
      return
    }
    setTyped(0)
    setLit(0)
    setExiting(false)
    setRun((value) => value + 1)
  }, [])

  useEffect(() => {
    if (run === 0) return
    const previousOverflow = document.body.style.overflow
    const returnTo = document.activeElement instanceof HTMLElement ? document.activeElement : null
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()
    const cancelTimers = armDispatch(EMAIL_ADDRESS, (event) => {
      if (event.kind === 'typed') setTyped(event.count)
      else if (event.kind === 'lit') setLit(event.count)
      else if (event.kind === 'exit') setExiting(true)
      else {
        openMail()
        setRun(0)
      }
    })
    return () => {
      document.body.style.overflow = previousOverflow
      cancelTimers()
      if (returnTo?.isConnected) returnTo.focus()
    }
  }, [run])

  useEffect(() => {
    if (run === 0) return
    function onKey(event: KeyboardEvent) {
      if (isPaletteShortcut(event)) {
        event.preventDefault()
        event.stopImmediatePropagation()
        return
      }
      if (event.key === 'Escape') {
        event.preventDefault()
        cancel()
      }
      if (event.key === 'Tab') event.preventDefault()
    }
    // Capture runs before the palette shortcut, which listens on the same window.
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [cancel, run])

  const api = useMemo(() => ({ sendEmail }), [sendEmail])

  return (
    <EmailDispatchContext.Provider value={api}>
      {children}
      {run === 0 ? null : (
        <div className="fixed inset-0 z-[90] flex items-start justify-center px-4 pt-[22vh]" onMouseDown={cancel}>
          <div
            aria-hidden
            style={{ animationDuration: `${exiting ? EXIT_MS : ENTER_MS}ms` }}
            className={`pointer-events-none absolute inset-0 bg-black/50 backdrop-blur-[2px] ${exiting ? 'dispatch-scrim-out' : 'dispatch-scrim'}`}
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={statusId}
            tabIndex={-1}
            style={{ animationDuration: `${exiting ? EXIT_MS : ENTER_MS}ms` }}
            className={`relative w-full max-w-[400px] rounded-xl border border-black/10 bg-white px-5 py-4 shadow-[0_24px_80px_rgba(0,0,0,0.28)] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:border-white/10 dark:bg-zinc-950 ${exiting ? 'dispatch-out' : 'dispatch-in'}`}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <p id={titleId} className="font-doto text-[13px] leading-none font-bold tracking-[0.22em] text-zinc-400 uppercase">
              {t.dispatch.kicker}
            </p>
            <a
              href={SOCIAL.email}
              onClick={cancel}
              className="mt-3 flex h-6 items-center font-mono text-[15px] tracking-tight text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-50"
            >
              {EMAIL_ADDRESS.slice(0, typed)}
              <span aria-hidden className="dispatch-caret ml-px inline-block h-4 w-px bg-current" />
            </a>
            <div aria-hidden className="rule-dots rule-dots-x mt-3" />
            <div
              aria-hidden
              className="mt-4 grid w-fit gap-[3px]"
              style={{ gridTemplateColumns: `repeat(${STAMP_COLS}, minmax(0, 1fr))` }}
            >
              {stepOf.map((step, cell) => (
                <span
                  key={cell}
                  className={`size-2.5 rounded-[1px] bg-zinc-900 dark:bg-zinc-100 ${step < lit ? 'opacity-100' : 'opacity-20'}`}
                />
              ))}
            </div>
            <p id={statusId} className="mt-4 text-[12px] text-zinc-400">
              {t.dispatch.status}
            </p>
          </div>
        </div>
      )}
    </EmailDispatchContext.Provider>
  )
}
