import { MessageSquareText } from 'lucide-react'
import { Link } from 'react-router'
import type { ShipInbox } from '../../services'
import { EmptyState, ErrorState, LoadingSkeleton, SyncStatusBadge, TimeStamp } from '../ui'

interface EarthMessagesPanelProps {
  inbox?: ShipInbox
  loading?: boolean
  error?: string
  onRetry?: () => void
}

export function EarthMessagesPanel({ inbox, loading, error, onRetry }: EarthMessagesPanelProps) {
  if (loading) return <LoadingSkeleton rows={4} label="Consultando mensajes recibidos desde Tierra" />

  if (error) {
    return (
      <ErrorState
        title="No fue posible consultar la bandeja"
        message={`${error} No se muestran comentarios hasta confirmar una respuesta válida de /ship/inbox.`}
        onRetry={onRetry}
      />
    )
  }

  if (!inbox) return null

  return (
    <section aria-labelledby="earth-messages-title" className="rounded-card border border-line bg-card p-5 shadow-card">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-nasa-blue">Bandeja de nave</p>
        <h2 id="earth-messages-title" className="mt-1 text-lg font-semibold text-ink">Mensajes recibidos desde Tierra</h2>
      </div>

      {inbox.items.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title="Sin mensajes recibidos"
            description="No hay respuestas confirmadas en /ship/inbox. Una revisión en Tierra no se presenta aquí hasta su recepción en nave."
            icon={MessageSquareText}
          />
        </div>
      ) : (
        <ul className="mt-4 space-y-4">
          {inbox.items.map((message) => (
            <li key={message.message_id} className="rounded-control border border-line bg-canvas p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <SyncStatusBadge status="response_received_ship" />
                <span className="text-xs font-medium text-muted">{message.message_id}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-ink">{message.note}</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
                <TimeStamp value={message.received_at_utc} label="Recibido en nave" />
                <Link
                  to={`/astronaut/reports/${message.report_id}`}
                  className="inline-flex min-h-11 items-center text-sm font-semibold text-nasa-blue hover:text-deep-space"
                >
                  Abrir informe {message.report_id}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
