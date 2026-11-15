import { Inbox } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description: string
  icon?: LucideIcon
  action?: ReactNode
}

export function EmptyState({ title, description, icon: Icon = Inbox, action }: EmptyStateProps) {
  return (
    <section className="rounded-card border border-dashed border-line bg-card px-6 py-10 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-canvas text-muted">
        <Icon aria-hidden="true" className="size-6" />
      </span>
      <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">{description}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </section>
  )
}
