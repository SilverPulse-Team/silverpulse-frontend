import { BarChart3 } from 'lucide-react'
import { useId, type ReactNode } from 'react'
import { EmptyState } from './EmptyState'

interface ChartPanelProps {
  title: string
  description?: string
  children?: ReactNode
  empty?: boolean
  emptyMessage?: string
  footer?: ReactNode
}

export function ChartPanel({
  title,
  description,
  children,
  empty = false,
  emptyMessage = 'No hay suficientes observaciones para construir una gráfica.',
  footer,
}: ChartPanelProps) {
  const titleId = useId()

  return (
    <section className="rounded-card border border-line bg-card p-5 shadow-card" aria-labelledby={titleId}>
      <div>
        <h3 id={titleId} className="text-base font-semibold text-ink">
          {title}
        </h3>
        {description && <p className="mt-1 text-sm leading-6 text-muted">{description}</p>}
      </div>
      <div className="mt-5 min-h-52">
        {empty ? (
          <EmptyState title="Datos insuficientes" description={emptyMessage} icon={BarChart3} />
        ) : (
          children
        )}
      </div>
      {footer && <div className="mt-4 border-t border-line pt-4">{footer}</div>}
    </section>
  )
}
