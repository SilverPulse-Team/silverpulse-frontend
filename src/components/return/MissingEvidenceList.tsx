import { ClipboardList, ExternalLink } from 'lucide-react'
import { Link } from 'react-router'
import type { ReadinessDomain } from '../../types'
import { domainLabels, getEvidenceLabel } from './readinessLabels'

interface MissingEvidenceListProps {
  domains: ReadinessDomain[]
}

export function MissingEvidenceList({ domains }: MissingEvidenceListProps) {
  const missing = domains.flatMap((domain) =>
    domain.missing.map((code) => ({ code, domain: domain.code })),
  )

  return (
    <section id="pruebas-faltantes" aria-labelledby="missing-evidence-title" className="rounded-card border border-line bg-card p-5 shadow-card lg:p-6">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-notice/10 text-notice">
          <ClipboardList aria-hidden="true" className="size-5" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-nasa-blue">Respuesta API</p>
          <h2 id="missing-evidence-title" className="mt-1 text-xl font-semibold text-ink">Pruebas pendientes</h2>
          <p className="mt-1 text-sm leading-6 text-muted">Lista documental sin prioridad clínica agregada por el frontend.</p>
        </div>
      </div>

      {missing.length > 0 ? (
        <ol className="mt-5 divide-y divide-line border-y border-line">
          {missing.map((item, index) => (
            <li key={`${item.domain}-${item.code}`} className="flex gap-3 py-4">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-canvas text-xs font-semibold text-muted">{index + 1}</span>
              <div>
                <p className="font-semibold text-ink">{getEvidenceLabel(item.code)}</p>
                <p className="mt-1 text-sm text-muted">Dominio: {domainLabels[item.domain]} · No disponible en el resumen recibido.</p>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-5 rounded-control border border-dashed border-line p-4 text-sm text-muted">Sin faltantes declarados por la respuesta.</p>
      )}

      <Link to="/astronaut/import" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-control px-3 text-sm font-semibold text-nasa-blue hover:bg-data/10">
        Consultar historial de registros <ExternalLink aria-hidden="true" className="size-4" />
      </Link>
    </section>
  )
}
