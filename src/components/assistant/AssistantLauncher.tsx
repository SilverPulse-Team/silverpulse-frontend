import { Bot, MessageCircle } from 'lucide-react'
import { forwardRef } from 'react'

interface Props {
  variant: 'ship' | 'earth'
  hasPendingActivity?: boolean
  elevated?: boolean
  onOpen: () => void
}

export const AssistantLauncher = forwardRef<HTMLButtonElement, Props>(
  ({ variant, hasPendingActivity = false, elevated = false, onOpen }, ref) => {
    const label = variant === 'ship' ? 'Abrir asistente de a bordo' : 'Abrir asistente de revisión'
    const Icon = variant === 'ship' ? Bot : MessageCircle
    return (
      <button
        ref={ref}
        type="button"
        onClick={onOpen}
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded="false"
        className="assistant-launcher fixed right-5 z-40 grid size-14 place-items-center rounded-full border border-white/25 bg-nasa-blue text-white shadow-[0_10px_30px_rgb(8_24_46/28%)] transition-transform hover:scale-105 hover:bg-deep-space sm:right-6 sm:size-[3.75rem]"
        style={{ bottom: `calc(${elevated ? '6rem' : '1.25rem'} + env(safe-area-inset-bottom))` }}
      >
        <Icon aria-hidden="true" className="size-6" />
        {hasPendingActivity && <span className="absolute right-0 top-0 size-3 rounded-full border-2 border-white bg-notice" aria-label="Hay una sesión pendiente" />}
      </button>
    )
  },
)

AssistantLauncher.displayName = 'AssistantLauncher'
