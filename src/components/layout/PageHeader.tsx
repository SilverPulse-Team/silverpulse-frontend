import type { ReactNode } from 'react'

interface PageHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  badge?: ReactNode
  actions?: ReactNode
}

export function PageHeader({ eyebrow, title, description, badge, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-5 border-b border-line pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-nasa-blue">{eyebrow}</p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{title}</h1>
          {badge}
        </div>
        {description && <p className="mt-2 max-w-3xl text-sm leading-6 text-muted sm:text-base">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-3">{actions}</div>}
    </header>
  )
}
