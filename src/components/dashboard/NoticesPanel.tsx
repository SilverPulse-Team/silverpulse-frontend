import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import type { Notice } from '../../types'
import { AlertNotice, EmptyState } from '../ui'

const statusLabels: Record<Notice['status'], string> = {
  informational: 'Información descriptiva',
  repeat_measurement: 'Repetición sugerida',
  review_suggested: 'Revisión sugerida',
  insufficient_data: 'Información insuficiente',
}

const reasonDescriptions: Record<string, string> = {
  SLEEP_TREND:
    'La duración del sueño presenta un cambio descriptivo respecto a la referencia personal. Requiere contexto y revisión humana.',
  MISSING_STRENGTH_TEST:
    'No hay una prueba de fuerza comparable disponible. La ausencia de datos impide evaluar ese dominio.',
}

function describeReason(reasonCode: string) {
  return reasonDescriptions[reasonCode] ?? `Razón informada por el análisis: ${reasonCode}. Sin interpretación adicional disponible.`
}

export function NoticesPanel({ notices }: { notices: Notice[] }) {
  return (
    <section aria-labelledby="analysis-notices-title">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-nasa-blue">Análisis descriptivo</p>
        <h2 id="analysis-notices-title" className="mt-1 text-xl font-semibold text-ink">Avisos</h2>
      </div>

      {notices.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title="Sin avisos de análisis"
            description="El resumen recibido no incluye avisos. Esto no equivale a una valoración clínica."
          />
        </div>
      ) : (
        <div className="mt-4 grid gap-4">
          {notices.map((notice, noticeIndex) => (
            <AlertNotice
              key={`${notice.status}-${notice.reason_codes.join('-')}-${noticeIndex}`}
              title={statusLabels[notice.status]}
              tone={notice.status === 'review_suggested' ? 'notice' : 'info'}
            >
              <ul className="space-y-3">
                {notice.reason_codes.map((reasonCode) => (
                  <li key={reasonCode}>
                    <span className="font-semibold text-ink">{reasonCode}</span>
                    <span className="mt-0.5 block">{describeReason(reasonCode)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 border-t border-current/15 pt-3 font-medium text-ink">
                {notice.clinically_validated
                  ? 'El proveedor informa validación clínica para este aviso.'
                  : 'No validado clínicamente. No constituye diagnóstico y requiere interpretación humana.'}
              </p>
              <Link
                to="/astronaut/trends"
                className="mt-3 inline-flex min-h-11 items-center gap-2 font-semibold text-nasa-blue hover:text-deep-space"
              >
                Abrir tendencias relacionadas
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </AlertNotice>
          ))}
        </div>
      )}
    </section>
  )
}
