import { Bot, UserRound } from 'lucide-react'
import type { AssistantMessageData } from './types'

export function AssistantMessage({ message }: { message: AssistantMessageData }) {
  if (message.role === 'system') {
    return (
      <div role="status" className="rounded-control border border-data/25 bg-data/10 px-3 py-2 text-xs leading-5 text-muted">
        {message.content}
      </div>
    )
  }

  const user = message.role === 'user'
  const Icon = user ? UserRound : Bot
  return (
    <div className={`flex items-end gap-2 ${user ? 'justify-end' : 'justify-start'}`}>
      {!user && (
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-deep-space text-white">
          <Icon aria-hidden="true" className="size-4" />
        </span>
      )}
      <div className={`max-w-[84%] rounded-2xl px-3.5 py-2.5 text-sm leading-5 ${
        user ? 'rounded-br-sm bg-nasa-blue text-white' : 'rounded-bl-sm border border-line bg-card text-ink'
      }`}>
        {message.label && <p className={`mb-1 text-[11px] font-semibold uppercase tracking-wide ${user ? 'text-white/75' : 'text-muted'}`}>{message.label}</p>}
        {message.content}
      </div>
    </div>
  )
}
