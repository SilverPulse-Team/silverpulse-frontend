import { TriangleAlert } from 'lucide-react'
import { SecondaryButton } from './Buttons'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
}

export function ErrorState({ title = 'No fue posible mostrar la información', message, onRetry }: ErrorStateProps) {
  return (
    <section role="alert" className="rounded-card border border-nasa-red/25 bg-card p-6">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-nasa-red/10 text-nasa-red">
          <TriangleAlert aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-0">
          <h3 className="font-semibold text-ink">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-muted">{message}</p>
          {onRetry && (
            <SecondaryButton type="button" onClick={onRetry} className="mt-4">
              Reintentar
            </SecondaryButton>
          )}
        </div>
      </div>
    </section>
  )
}
