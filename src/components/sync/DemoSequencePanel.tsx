import { Link } from 'react-router'
import type { ShipInboxMessage } from '../../services'
import type { Report, SimulatorMetrics, SimulatorStatus } from '../../types'
import { EmptyState, ReportTimeline } from '../ui'
import type { ConfirmedDemoStage } from './demoSequence'
import { buildDemoSequenceEvents } from './demoSequence'

function WorkflowLink({ to, children }: { to: string; children: string }) {
  return (
    <Link
      to={to}
      className="inline-flex min-h-11 items-center rounded-control border border-line bg-card px-4 py-2 text-sm font-semibold text-ink hover:border-nasa-blue hover:text-nasa-blue"
    >
      {children}
    </Link>
  )
}

export function DemoSequencePanel({
  status,
  metrics,
  shipReports,
  earthReports,
  inboxMessages,
  confirmedStages,
}: {
  status: SimulatorStatus
  metrics: SimulatorMetrics
  shipReports: Report[]
  earthReports: Report[]
  inboxMessages: ShipInboxMessage[]
  confirmedStages: ConfirmedDemoStage[]
}) {
  const events = buildDemoSequenceEvents({
    status,
    metrics,
    shipReports,
    earthReports,
    inboxMessages,
    confirmedStages,
  })
  const reviewableReport = earthReports.find((report) => report.communication.status === 'delivered')

  return (
    <section aria-labelledby="demo-sequence-title" className="rounded-card border border-line bg-card p-5 shadow-card lg:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-nasa-blue">Recorrido guiado</p>
      <h2 id="demo-sequence-title" className="mt-1 text-lg font-semibold text-ink">Secuencia offline → reconnect → ACK</h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        Cada hito se completa solo con datos observables de la API. Cambiar una configuración no simula la recepción ni la revisión.
      </p>

      {shipReports.length === 0 && earthReports.length === 0 && inboxMessages.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title="Aún no hay informes para seguir"
            description="Genera un informe desde nave y vuelve a consultar las vistas de cada entorno para observar el recorrido."
          />
        </div>
      ) : (
        <div className="mt-5">
          <ReportTimeline events={events} label="Pasos observados de la demostración" />
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-3 border-t border-line pt-4">
        <WorkflowLink to="/astronaut#ship-reports">Informes de nave</WorkflowLink>
        <WorkflowLink to="/medical">Bandeja de Tierra</WorkflowLink>
        {reviewableReport ? (
          <WorkflowLink to={`/medical/reports/${encodeURIComponent(reviewableReport.report_id)}`}>
            Revisar informe recibido
          </WorkflowLink>
        ) : (
          <span className="inline-flex min-h-11 items-center rounded-control border border-line bg-canvas px-4 py-2 text-sm text-muted">
            Revisión: espera un informe confirmado en Tierra
          </span>
        )}
      </div>

      <p className="mt-3 text-xs leading-5 text-muted">
        No hay endpoint de reinicio en el contrato v0.2.0; la guía no ofrece un botón para restaurar el escenario.
      </p>
    </section>
  )
}
