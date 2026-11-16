import { MessageSquareText } from 'lucide-react'
import type { ShipInboxMessage } from '../../services'
import type { Report } from '../../types'
import { EmptyState, ErrorState, LoadingSkeleton, ReportTimeline, TimeStamp } from '../ui'
import { buildCommunicationTimeline } from './reportPresentation'

interface CommunicationTimelineProps {
  report: Report
  returnedMessages: ShipInboxMessage[]
  inboxLoading: boolean
  inboxError?: string
  onRetryInbox: () => void
}

export function CommunicationTimeline({
  report,
  returnedMessages,
  inboxLoading,
  inboxError,
  onRetryInbox,
}: CommunicationTimelineProps) {
  const latestMessage = returnedMessages[0]

  return (
    <section aria-labelledby="communication-timeline-title" className="rounded-card border border-line bg-card p-5 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-nasa-blue">Trazabilidad</p>
      <h2 id="communication-timeline-title" className="mt-1 text-lg font-semibold text-ink">Historial de sincronización</h2>
      <p className="mt-1 text-sm leading-6 text-muted">
        La prioridad {report.communication.priority} indica orden logístico de transporte, no prioridad de emergencia.
      </p>
      <div className="mt-5">
        <ReportTimeline events={buildCommunicationTimeline(report, latestMessage)} />
      </div>

      <dl className="mt-5 grid gap-3 border-t border-line pt-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted">ID del mensaje</dt>
          <dd className="mt-1 break-all font-mono text-ink">{report.communication.message_id || 'Sin datos'}</dd>
        </div>
        <div>
          <dt className="text-muted">Estado logístico del informe</dt>
          <dd className="mt-1 text-ink">{report.communication.status}</dd>
        </div>
        <div><TimeStamp value={report.communication.last_attempt_at_utc} label="Último intento de envío" /></div>
        <div><TimeStamp value={report.communication.delivered_at_utc} label="Entrega confirmada a Tierra" /></div>
      </dl>

      <div className="mt-5 border-t border-line pt-4">
        <h3 className="font-semibold text-ink">Revisión recibida desde Tierra</h3>
        {inboxLoading ? (
          <div className="mt-3"><LoadingSkeleton rows={2} label="Consultando respuestas recibidas en nave" /></div>
        ) : inboxError ? (
          <div className="mt-3">
            <ErrorState
              title="No se pudo confirmar la respuesta"
              message={`${inboxError} No se muestra una nota de Tierra sin una respuesta válida de /ship/inbox.`}
              onRetry={onRetryInbox}
            />
          </div>
        ) : returnedMessages.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              title="Sin respuesta recibida en nave"
              description="Una revisión en Tierra o un informe entregado no significan que el comentario haya regresado. La nota aparecerá aquí solo al confirmarse en /ship/inbox."
              icon={MessageSquareText}
            />
          </div>
        ) : (
          <ul className="mt-3 space-y-3">
            {returnedMessages.map((message) => (
              <li key={message.message_id} className="rounded-control border border-line bg-canvas p-4">
                <p className="whitespace-pre-wrap text-sm leading-6 text-ink">{message.note}</p>
                <div className="mt-3 flex flex-wrap justify-between gap-2 border-t border-line pt-3 text-xs text-muted">
                  <span>{message.message_id} · Informe {message.report_id}</span>
                  <TimeStamp value={message.received_at_utc} label="Recibido en nave" className="text-xs" />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
