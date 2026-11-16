import { ArrowRight, CheckCircle2, Clock3, RadioTower } from 'lucide-react'
import { Link } from 'react-router'
import type { ShipInboxMessage } from '../../services'
import type { Report } from '../../types'
import { EmptyState, TimeStamp } from '../ui'

interface CommunicationRow {
  id: string
  messageId: string
  reportId: string
  direction: string
  priority: string
  status: string
  retryCount: string
  acknowledgment: string
  timestamp: string | null
}

function statusLabel(status: Report['communication']['status']) {
  if (status === 'queued') return 'En cola'
  if (status === 'transmitting') return 'En tránsito'
  if (status === 'delivered') return 'Entregado a Tierra'
  return 'Reintento pendiente'
}

export function CommunicationLog({
  shipReports,
  earthReports,
  inboxMessages,
}: {
  shipReports: Report[]
  earthReports: Report[]
  inboxMessages: ShipInboxMessage[]
}) {
  const earthReportIds = new Set(
    earthReports
      .filter((report) => report.communication.status === 'delivered' && report.communication.delivered_at_utc !== null)
      .map((report) => report.report_id),
  )
  const outboundRows: CommunicationRow[] = shipReports.map((report) => {
    const hasConfirmedDelivery =
      (report.communication.status === 'delivered' && report.communication.delivered_at_utc !== null) ||
      earthReportIds.has(report.report_id)

    return {
      id: `outbound-${report.communication.message_id}`,
      messageId: report.communication.message_id,
      reportId: report.report_id,
      direction: 'Nave → Tierra',
      priority: report.communication.priority,
      status: statusLabel(report.communication.status),
      retryCount: '— (no incluido en el contrato)',
      acknowledgment: hasConfirmedDelivery ? 'Recepción confirmada' : 'Sin ACK confirmado',
      timestamp: report.communication.delivered_at_utc,
    }
  })
  const returnRows: CommunicationRow[] = inboxMessages.map((message) => ({
    id: `return-${message.message_id}`,
    messageId: message.message_id,
    reportId: message.report_id,
    direction: 'Tierra → Nave',
    priority: '—',
    status: 'Respuesta recibida en nave',
    retryCount: '— (no incluido en el contrato)',
    acknowledgment: 'Recepción confirmada por /ship/inbox',
    timestamp: message.received_at_utc,
  }))
  const rows = [...outboundRows, ...returnRows]
  return (
    <section aria-labelledby="communication-log-title" className="min-w-0 overflow-hidden rounded-card border border-line bg-card p-4 shadow-card sm:p-5 lg:p-6">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-nasa-blue/10 text-nasa-blue"><RadioTower aria-hidden="true" className="size-5" /></span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-nasa-blue">Trazabilidad</p>
          <h2 id="communication-log-title" className="mt-1 text-lg font-semibold text-ink">Ruta de informes y respuestas</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">
            Estados confirmados por Nave, Tierra y el inbox. La prioridad es logística, no clínica.
          </p>
        </div>
      </div>
      {rows.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title="Todavía no hay comunicaciones"
            description="El enlace está disponible, pero el recorrido comienza cuando generas un informe ORBIT VERIFY desde Nave. Después podrás ponerlo en cola, entregarlo a Tierra y observar la respuesta."
            action={(
              <div className="flex flex-wrap justify-center gap-2">
                <Link to="/astronaut#ship-reports" className="inline-flex min-h-11 items-center rounded-control bg-nasa-blue px-4 text-sm font-semibold text-white">
                  Ir a informes de nave
                </Link>
                <Link to="/astronaut/import" className="inline-flex min-h-11 items-center rounded-control border border-line px-4 text-sm font-semibold text-ink">
                  Importar observaciones
                </Link>
              </div>
            )}
          />
        </div>
      ) : (
        <div className="mt-5 grid min-w-0 gap-3 xl:grid-cols-2" aria-label="Estados logísticos de informes y respuestas confirmados">
          {rows.map((row) => (
            <article key={row.id} className="min-w-0 overflow-hidden rounded-card border border-line bg-canvas p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-all font-mono text-sm font-semibold text-ink">{row.messageId || '—'}</p>
                  <p className="mt-1 break-all text-xs text-muted">Informe {row.reportId}</p>
                </div>
                <span className="rounded-full border border-nasa-blue/25 bg-nasa-blue/5 px-3 py-1 text-xs font-semibold text-nasa-blue">{row.status}</span>
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-control border border-line bg-card px-3 py-2 text-sm font-medium text-ink">
                <span>{row.direction.split(' → ')[0]}</span><ArrowRight aria-hidden="true" className="size-4 text-nasa-blue" /><span>{row.direction.split(' → ')[1]}</span>
              </div>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Prioridad</dt><dd className="mt-1 text-sm text-ink">{row.priority}</dd></div>
                <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Recepción</dt><dd className="mt-1 flex items-start gap-2 text-sm text-ink"><CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-data" />{row.acknowledgment}</dd></div>
                <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Reintentos</dt><dd className="mt-1 text-sm text-ink">{row.retryCount}</dd></div>
                <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Confirmación</dt><dd className="mt-1 flex items-start gap-2 text-sm text-ink"><Clock3 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted" /><TimeStamp value={row.timestamp} label="UTC" /></dd></div>
              </dl>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
