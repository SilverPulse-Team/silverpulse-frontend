import { Orbit, Rocket } from 'lucide-react'

interface ConstructionStateProps {
  viewName: string
  description: string
}

export function ConstructionState({ viewName, description }: ConstructionStateProps) {
  return (
    <section
      aria-labelledby="construction-title"
      className="construction-space h-full overflow-hidden rounded-card border border-midnight-surface bg-deep-space shadow-card"
    >
      <div className="relative z-10 flex h-full min-h-0 flex-col items-center justify-center px-6 py-6 text-center">
        <div className="construction-stage" aria-hidden="true">
          <div className="construction-orbit">
            <span className="construction-orbit-dot" />
          </div>
          <div className="construction-icon">
            <Rocket className="size-12" strokeWidth={1.7} />
          </div>
          <Orbit className="construction-satellite size-7" strokeWidth={1.6} />
        </div>

        <div className="mt-5 max-w-xl">
          <span className="inline-flex rounded-full border border-data/50 bg-data/15 px-3 py-1 text-xs font-semibold tracking-[0.12em] text-slate-100">
            PRÓXIMAMENTE
          </span>
          <h2 id="construction-title" className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Módulo en construcción
          </h2>
          <p className="mt-4 text-sm font-semibold text-data">Vista: {viewName}</p>
          <p className="mt-2 text-sm leading-6 text-slate-300 sm:text-base">
            {description}
          </p>
        </div>
      </div>
    </section>
  )
}
