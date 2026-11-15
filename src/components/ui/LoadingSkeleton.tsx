interface LoadingSkeletonProps {
  rows?: number
  label?: string
}

export function LoadingSkeleton({ rows = 3, label = 'Cargando contenido' }: LoadingSkeletonProps) {
  return (
    <section aria-label={label} aria-busy="true" className="rounded-card border border-line bg-card p-5">
      <span className="sr-only">{label}</span>
      <div className="h-4 w-2/5 animate-pulse rounded bg-slate-200" />
      <div className="mt-5 space-y-3">
        {Array.from({ length: rows }, (_, index) => (
          <div
            key={index}
            className={`h-10 animate-pulse rounded-control bg-slate-100 ${index === rows - 1 ? 'w-4/5' : 'w-full'}`}
          />
        ))}
      </div>
    </section>
  )
}
