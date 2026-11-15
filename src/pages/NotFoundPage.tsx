import { SearchX } from 'lucide-react'
import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <section className="grid h-full place-items-center rounded-card border border-line bg-card p-6 text-center shadow-card">
      <div className="max-w-md">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-canvas text-muted">
          <SearchX aria-hidden="true" className="size-7" />
        </span>
        <p className="mt-5 text-sm font-semibold uppercase tracking-[0.14em] text-nasa-blue">Error 404</p>
        <h1 className="mt-2 text-2xl font-semibold text-ink">Vista no encontrada</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          La ruta solicitada no forma parte de las vistas aprobadas de SilverPulse.
        </p>
        <Link
          to="/astronaut"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-control bg-nasa-blue px-4 py-2 text-sm font-semibold text-white hover:bg-deep-space"
        >
          Volver al resumen
        </Link>
      </div>
    </section>
  )
}
