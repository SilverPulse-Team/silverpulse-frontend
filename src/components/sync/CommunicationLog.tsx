import type { ShipInboxMessage } from '../../services'
import type { Report } from '../../types'
import { EmptyState, ResponsiveDataTable, TimeStamp } from '../ui'

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
  const columns = [
    { key: 'message', header: 'Mensaje / informe', render: (row: CommunicationRow) => <><span className="font-mono">{row.messageId || '—'}</span><span className="block text-xs text-muted">{row.reportId}</span></> },
    { key: 'direction', header: 'Dirección', render: (row: CommunicationRow) => row.direction },
    { key: 'priority', header: 'Prioridad logística', render: (row: CommunicationRow) => row.priority },
    { key: 'status', header: 'Estado', render: (row: CommunicationRow) => row.status },
    { key: 'retries', header: 'Reintentos', render: (row: CommunicationRow) => row.retryCount },
    { key: 'ack', header: 'ACK / recepción', render: (row: CommunicationRow) => row.acknowledgment },
    { key: 'timestamp', header: 'Marca de tiempo', render: (row: CommunicationRow) => <TimeStamp value={row.timestamp} label="Confirmación" /> },
  ]

  return (
    <section aria-labelledby="communication-log-title" className="rounded-card border border-line bg-card p-5 shadow-card lg:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-nasa-blue">Trazabilidad</p>
      <h2 id="communication-log-title" className="mt-1 text-lg font-semibold text-ink">Informes y respuestas observables</h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        Se muestran informes y respuestas de los endpoints disponibles; routine/priority son logísticas, no de emergencia. El contrato no ofrece un listado independiente de paquetes ni contador de reintentos.
      </p>
      {rows.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="Sin mensajes observables" description="No hay informes ni respuestas confirmadas en los endpoints consultados." />
        </div>
      ) : (
        <div className="mt-4">
          <ResponsiveDataTable
            caption="Estados logísticos de informes y respuestas confirmados"
            columns={columns}
            rows={rows}
            getRowKey={(row) => row.id}
          />
        </div>
      )}
    </section>
  )
}
