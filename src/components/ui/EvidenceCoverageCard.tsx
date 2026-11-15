import { CircleCheck, CircleDashed, CircleEllipsis } from 'lucide-react'
import type { EvidenceCoverage } from './types'

interface EvidenceCoverageCardProps {
  domain: string
  status: EvidenceCoverage
  available: string[]
  missing?: string[]
}

const coverageConfig = {
  available: { label: 'Disponible', icon: CircleCheck, className: 'text-coverage bg-coverage/10 border-coverage/30' },
  partial: { label: 'Parcial', icon: CircleEllipsis, className: 'text-notice bg-notice/10 border-notice/30' },
  insufficient: { label: 'Insuficiente', icon: CircleDashed, className: 'text-muted bg-canvas border-line' },
} satisfies Record<EvidenceCoverage, { label: string; icon: typeof CircleCheck; className: string }>

export function EvidenceCoverageCard({ domain, status, available, missing = [] }: EvidenceCoverageCardProps) {
  const config = coverageConfig[status]
  const Icon = config.icon

  return (
    <article className="rounded-card border border-line bg-card p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-ink">{domain}</h3>
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${config.className}`}>
          <Icon aria-hidden="true" className="size-3.5" />
          {config.label}
        </span>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Evidencia disponible</p>
        {available.length > 0 ? (
          <ul className="mt-2 space-y-1 text-sm text-ink">
            {available.map((item) => <li key={item}>• {item}</li>)}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted">Sin datos</p>
        )}
      </div>

      {missing.length > 0 && (
        <div className="mt-4 border-t border-line pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Evidencia faltante</p>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            {missing.map((item) => <li key={item}>• {item}</li>)}
          </ul>
        </div>
      )}
    </article>
  )
}
