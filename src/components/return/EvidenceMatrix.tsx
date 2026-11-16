import { CircleCheck, CircleDashed, CircleEllipsis } from 'lucide-react'
import type { EvidenceCoverage, ReadinessDomain } from '../../types'
import { domainLabels, getEvidenceLabel, getTrendLabel } from './readinessLabels'

interface EvidenceMatrixProps {
  domains: ReadinessDomain[]
}

const coverageConfig = {
  available: {
    label: 'Disponible',
    icon: CircleCheck,
    className: 'border-coverage/30 bg-coverage/10 text-coverage',
  },
  partial: {
    label: 'Parcial',
    icon: CircleEllipsis,
    className: 'border-notice/30 bg-notice/10 text-notice',
  },
  insufficient: {
    label: 'Insuficiente',
    icon: CircleDashed,
    className: 'border-line bg-canvas text-muted',
  },
} satisfies Record<
  EvidenceCoverage,
  { label: string; icon: typeof CircleCheck; className: string }
>

export function EvidenceMatrix({ domains }: EvidenceMatrixProps) {
  return (
    <section id="matriz-evidencia" aria-labelledby="evidence-matrix-title">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-nasa-blue">
            Cobertura documental
          </p>
          <h2 id="evidence-matrix-title" className="mt-1 text-xl font-semibold text-ink">
            Matriz de evidencia por dominio
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-muted">
          Los estados describen evidencia disponible; no representan aptitud, riesgo ni autorización clínica.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {domains.map((domain) => {
          const config = coverageConfig[domain.coverage]
          const Icon = config.icon

          return (
            <article key={domain.code} className="flex min-w-0 flex-col rounded-card border border-line bg-card p-5 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h3 className="font-semibold text-ink">{domainLabels[domain.code]}</h3>
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${config.className}`}>
                  <Icon aria-hidden="true" className="size-3.5" />
                  {config.label}
                </span>
              </div>

              <p className="mt-3 text-sm font-medium text-ink">{getTrendLabel(domain.trend)}</p>

              <div className="mt-5 border-t border-line pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Evidencia presente</p>
                {domain.evidence.length > 0 ? (
                  <ul className="mt-2 space-y-2 text-sm text-ink">
                    {domain.evidence.map((item) => (
                      <li key={item} className="flex gap-2">
                        <CircleCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-coverage" />
                        <span>{getEvidenceLabel(item)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-muted">Sin datos</p>
                )}
              </div>

              <div className="mt-4 border-t border-line pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Evidencia faltante</p>
                {domain.missing.length > 0 ? (
                  <ul className="mt-2 space-y-2 text-sm text-muted">
                    {domain.missing.map((item) => (
                      <li key={item} className="flex gap-2">
                        <CircleDashed aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                        <span>{getEvidenceLabel(item)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-muted">Sin faltantes declarados</p>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
