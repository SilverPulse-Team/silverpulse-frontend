import type { QuickReply } from './types'

interface Props {
  replies: QuickReply[]
  onSelect: (reply: QuickReply) => void
  disabled?: boolean
  label?: string
}

export function AssistantQuickReplies({ replies, onSelect, disabled, label = 'Opciones disponibles' }: Props) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
      {replies.map((reply) => (
        <button
          key={reply.id}
          type="button"
          disabled={disabled || reply.disabled}
          onClick={() => onSelect(reply)}
          className="inline-flex min-h-11 max-w-full items-center justify-center whitespace-nowrap rounded-full border border-nasa-blue/30 bg-card px-3.5 py-2 text-sm font-semibold text-nasa-blue transition-colors hover:bg-nasa-blue hover:text-white disabled:cursor-not-allowed disabled:border-line disabled:bg-slate-100 disabled:text-muted"
        >
          {reply.label}
        </button>
      ))}
    </div>
  )
}
