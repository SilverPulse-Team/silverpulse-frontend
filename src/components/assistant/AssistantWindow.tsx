import { Bot, LoaderCircle, MessageCircle, X } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'
import { AssistantMessage } from './AssistantMessage'
import type { AssistantMessageData } from './types'

interface Props {
  open: boolean
  variant: 'ship' | 'earth'
  messages: AssistantMessageData[]
  controls?: ReactNode
  busy?: boolean
  onClose: () => void
}

export function AssistantWindow({ open, variant, messages, controls, busy, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const historyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose, open])

  useEffect(() => {
    if (!open) return
    const history = historyRef.current
    if (!history) return
    if (typeof history.scrollTo === 'function') history.scrollTo({ top: history.scrollHeight, behavior: 'smooth' })
    else history.scrollTop = history.scrollHeight
  }, [messages, open])

  if (!open) return null
  const ship = variant === 'ship'
  const Icon = ship ? Bot : MessageCircle
  return (
    <section
      role="dialog"
      aria-modal="false"
      aria-label={ship ? 'Asistente de a bordo' : 'Asistente de revisión'}
      className="fixed inset-x-3 z-50 flex h-[min(42rem,calc(100dvh-6.5rem))] flex-col overflow-hidden rounded-card border border-line bg-card shadow-[0_24px_70px_rgb(8_24_46/30%)] sm:inset-x-auto sm:right-6 sm:w-[min(26rem,calc(100vw-3rem))]"
      style={{ bottom: 'calc(5.5rem + env(safe-area-inset-bottom))' }}
    >
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-line bg-deep-space px-4 py-3 text-white">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-nasa-blue"><Icon aria-hidden="true" className="size-5" /></span>
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold">{ship ? 'Asistente de a bordo' : 'Asistente de revisión'}</h2>
            <p className="text-xs text-slate-300">{ship ? 'Nave' : 'Tierra'} · DEMO · No clínico</p>
          </div>
        </div>
        <button ref={closeRef} type="button" onClick={onClose} className="grid size-11 shrink-0 place-items-center rounded-control text-slate-200 hover:bg-white/10 hover:text-white" aria-label="Cerrar asistente">
          <X aria-hidden="true" className="size-5" />
        </button>
      </header>

      <div ref={historyRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain bg-canvas p-4" aria-live="polite">
        {messages.map((message) => <AssistantMessage key={message.id} message={message} />)}
        {busy && (
          <div role="status" className="flex items-center gap-2 text-sm text-muted">
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> Consultando el backend…
          </div>
        )}
      </div>
      {controls && <footer className="shrink-0 border-t border-line bg-card p-3">{controls}</footer>}
    </section>
  )
}
