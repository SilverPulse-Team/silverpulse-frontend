import { Filter, RotateCcw } from 'lucide-react'
import type { ReactNode } from 'react'

interface FilterBarProps {
  children: ReactNode
  onClear?: () => void
  label?: string
  toolbar?: ReactNode
  gridClassName?: string
}

export function FilterBar({
  children,
  onClear,
  label = 'Filtros',
  toolbar,
  gridClassName = 'sm:grid-cols-2 lg:grid-cols-4',
}: FilterBarProps) {
  return (
    <section aria-label={label} className="rounded-card border border-line bg-card p-4 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Filter aria-hidden="true" className="size-4 text-data" />
          {label}
        </p>
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex min-h-11 items-center gap-2 rounded-control px-3 text-sm font-medium text-muted hover:bg-canvas hover:text-ink"
          >
            <RotateCcw aria-hidden="true" className="size-4" />
            Limpiar
          </button>
        )}
      </div>
      {toolbar && <div className="mt-3 border-t border-line pt-3">{toolbar}</div>}
      <div className={`mt-3 grid gap-3 ${gridClassName}`}>{children}</div>
    </section>
  )
}
