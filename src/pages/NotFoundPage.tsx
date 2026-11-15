import { Rocket } from 'lucide-react'
import { Link } from 'react-router'

export function NotFoundPage({ homePath }: { homePath: string }) {
  return (
    <section className="construction-space relative grid h-full place-items-center overflow-hidden rounded-card border border-midnight-surface p-6 text-center shadow-card">
      <div className="relative z-10 max-w-lg">
        <div className="not-found-orbit" aria-hidden="true">
          <div className="not-found-flight">
            <Rocket className="not-found-rocket size-8" strokeWidth={1.7} />
          </div>
          <div className="not-found-ring" />
          <div className="not-found-planet">
            <span>404</span>
          </div>
        </div>

        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-data">
          Coordenadas no encontradas
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Fuera de órbita</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-300 sm:text-base">
          La ruta solicitada se encuentra fuera del mapa de navegación aprobado de SilverPulse.
        </p>
        <Link
          to={homePath}
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-control bg-card px-5 py-2 text-sm font-semibold text-deep-space transition-colors hover:bg-data hover:text-white"
        >
          Regresar a una ruta segura
        </Link>
      </div>
    </section>
  )
}
