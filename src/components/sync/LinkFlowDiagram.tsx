import { ArrowDown, ArrowRight, Database, Inbox, RadioTower, Send } from 'lucide-react'
import type { ShipInbox } from '../../services'
import type { SimulatorStatus } from '../../types'
import { LinkModeBadge } from '../dashboard/LinkStatus'
import { TimeStamp } from '../ui'

const nodes = [
  { title: 'NAVE', detail: 'spacecraft.db', icon: Database },
  { title: 'Cola de salida', detail: 'Outbox', icon: Send },
  { title: 'Enlace simulado', detail: 'Transporte diferido', icon: RadioTower },
  { title: 'Cola de recepción', detail: 'Recepción confirmada', icon: Inbox },
  { title: 'TIERRA', detail: 'earth.db', icon: Database },
]

export function LinkFlowDiagram({
  status,
  inbox,
}: {
  status: SimulatorStatus
  inbox: ShipInbox
}) {
  return (
    <section aria-labelledby="link-flow-title" className="rounded-card border border-line bg-card p-5 shadow-card lg:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-nasa-blue">Flujo de comunicación</p>
          <h2 id="link-flow-title" className="mt-1 text-lg font-semibold text-ink">Nave ↔ Tierra</h2>
        </div>
        <LinkModeBadge mode={status.mode} />
      </div>

      <p className="mt-2 text-sm leading-6 text-muted">
        Simulación local de enlace diferido — no es una red espacial real. El diagrama es conceptual; no representa paquetes adicionales.
      </p>

      <ol aria-label="Ruta lógica de mensajes" className="mt-5 flex flex-col items-stretch gap-2 lg:flex-row lg:items-center lg:gap-1">
        {nodes.map(({ title, detail, icon: Icon }, index) => (
          <li key={title} className="flex min-w-0 flex-col items-center gap-2 lg:flex-1 lg:flex-row">
            <div className="flex min-h-[92px] w-full flex-col items-center justify-center rounded-control border border-line bg-canvas p-3 text-center lg:min-w-0">
              <Icon aria-hidden="true" className="size-5 text-nasa-blue" />
              <span className="mt-2 text-sm font-semibold text-ink">{title}</span>
              <span className="text-xs text-muted">{detail}</span>
            </div>
            {index < nodes.length - 1 && (
              <>
                <ArrowDown aria-hidden="true" className="size-5 shrink-0 text-muted lg:hidden" />
                <ArrowRight aria-hidden="true" className="hidden size-5 shrink-0 text-muted lg:block" />
              </>
            )}
          </li>
        ))}
      </ol>

      <div className="mt-5 grid gap-3 border-t border-line pt-4 sm:grid-cols-2 xl:grid-cols-3">
        <p className="rounded-control bg-canvas p-3 text-sm text-ink">
          Nave → Tierra: <strong>{status.queued_ship_to_earth}</strong> en cola
        </p>
        <p className="rounded-control bg-canvas p-3 text-sm text-ink">
          Tierra → Nave: <strong>{status.queued_earth_to_ship}</strong> en cola
        </p>
        <p className="rounded-control bg-canvas p-3 text-sm text-ink">
          En tránsito: <strong>{status.in_flight}</strong>
        </p>
        <p className="rounded-control bg-canvas p-3 text-sm text-ink">
          Latencia simulada unidireccional: <strong>{status.one_way_latency_simulated_s} s</strong>
        </p>
        <p className="rounded-control bg-canvas p-3 text-sm text-ink">
          Aceleración del tiempo: <strong>×{status.time_acceleration}</strong>
        </p>
        <div className="rounded-control bg-canvas p-3 text-sm text-ink">
          <TimeStamp value={status.last_delivered_at_utc} label="Última entrega confirmada" />
        </div>
      </div>

      <p className="mt-3 rounded-control border border-line bg-canvas p-3 text-sm text-ink">
        Retorno lógico observado en <code className="font-mono">/ship/inbox</code>: <strong>{inbox.items.length}</strong> respuesta(s) recibida(s) en nave.
      </p>
    </section>
  )
}
