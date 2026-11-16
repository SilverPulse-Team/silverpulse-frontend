import { ArrowUp, ChartNoAxesCombined } from 'lucide-react'
import type { SimulatorMetrics } from '../../types'

const metricFields: Array<{ key: keyof Omit<SimulatorMetrics, 'scenario_id' | 'has_run'>; label: string }> = [
  { key: 'delivered_count', label: 'Entregas medidas' },
  { key: 'duplicates_suppressed', label: 'Duplicados suprimidos' },
  { key: 'messages_lost_after_restart', label: 'Mensajes perdidos tras reinicio' },
  { key: 'priority_delivery_delay_simulated_s', label: 'Demora de prioridad simulada (s)' },
  { key: 'bytes_transferred', label: 'Bytes transferidos' },
  { key: 'queued_count', label: 'Mensajes en cola al medir' },
]

function displayMetric(value: number | null) {
  return value === null ? 'Sin resultado' : value.toLocaleString('es-CR')
}

export function SimulationMetrics({ metrics }: { metrics: SimulatorMetrics }) {
  return (
    <section aria-labelledby="simulation-metrics-title" className="flex h-full min-w-0 flex-col rounded-card border border-line bg-card p-5 shadow-card lg:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-nasa-blue">Métricas observadas</p>
          <h2 id="simulation-metrics-title" className="mt-1 text-lg font-semibold text-ink">Resultados de simulación</h2>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${metrics.has_run ? 'border-coverage/30 bg-coverage/10 text-coverage' : 'border-line bg-canvas text-muted'}`}>
          {metrics.has_run ? 'Ejecución reportada' : 'Pendiente'}
        </span>
      </div>
      {metrics.has_run ? (
        <>
          <p className="mt-2 text-sm text-muted">Escenario: <code className="font-mono text-ink">{metrics.scenario_id}</code></p>
          <dl className="mt-4 grid flex-1 content-start gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {metricFields.map(({ key, label }) => (
              <div key={key} className="rounded-control border border-line bg-canvas p-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
                <dd className="mt-2 break-words text-sm font-semibold text-ink">
                  {displayMetric(metrics[key])}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-auto pt-4 text-xs leading-5 text-muted">
            Los valores proceden de <code className="font-mono">/simulator/metrics</code>. No se estiman porcentajes ni se atribuyen resultados a una ejecución no reportada.
          </p>
        </>
      ) : (
        <div className="mt-4 flex flex-1 flex-col items-center justify-center rounded-card border border-dashed border-line bg-canvas p-5 text-center sm:p-6">
          <span className="grid size-12 place-items-center rounded-full bg-nasa-blue/10 text-nasa-blue">
            <ChartNoAxesCombined aria-hidden="true" className="size-6" />
          </span>
          <h3 className="mt-4 text-base font-semibold text-ink">Aún no hay resultados</h3>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
            Ejecuta un paso de simulación para que las métricas confirmadas aparezcan aquí.
          </p>
          <a
            href="#simulator-controls-title"
            className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-control bg-nasa-blue px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-deep-space focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nasa-blue"
          >
            Ir a los controles
            <ArrowUp aria-hidden="true" className="size-4" />
          </a>
        </div>
      )}
    </section>
  )
}
