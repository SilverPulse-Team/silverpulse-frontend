import type { SimulatorMetrics } from '../../types'

const metricFields: Array<{ key: keyof Omit<SimulatorMetrics, 'scenario_id' | 'has_run'>; label: string }> = [
  { key: 'delivered_count', label: 'Entregas medidas' },
  { key: 'duplicates_suppressed', label: 'Duplicados suprimidos' },
  { key: 'messages_lost_after_restart', label: 'Mensajes perdidos tras reinicio' },
  { key: 'priority_delivery_delay_simulated_s', label: 'Demora de prioridad simulada (s)' },
  { key: 'bytes_transferred', label: 'Bytes transferidos' },
  { key: 'queued_count', label: 'Mensajes en cola al medir' },
]

function displayMetric(value: number | null, hasRun: boolean) {
  if (!hasRun) return 'No ejecutada / Sin resultados'
  return value === null ? 'Sin resultado' : value.toLocaleString('es-CR')
}

export function SimulationMetrics({ metrics }: { metrics: SimulatorMetrics }) {
  return (
    <section aria-labelledby="simulation-metrics-title" className="rounded-card border border-line bg-card p-5 shadow-card lg:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-nasa-blue">Métricas observadas</p>
          <h2 id="simulation-metrics-title" className="mt-1 text-lg font-semibold text-ink">Resultados de simulación</h2>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${metrics.has_run ? 'border-coverage/30 bg-coverage/10 text-coverage' : 'border-line bg-canvas text-muted'}`}>
          {metrics.has_run ? 'Ejecución reportada' : 'No ejecutada / Sin resultados'}
        </span>
      </div>
      <p className="mt-2 text-sm text-muted">Escenario: <code className="font-mono text-ink">{metrics.scenario_id}</code></p>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {metricFields.map(({ key, label }) => (
          <div key={key} className="rounded-control border border-line bg-canvas p-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
            <dd className="mt-2 break-words text-sm font-semibold text-ink">
              {displayMetric(metrics[key], metrics.has_run)}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-xs leading-5 text-muted">
        Los valores proceden de <code className="font-mono">/simulator/metrics</code>. No se estiman porcentajes ni se atribuyen resultados a una ejecución no reportada.
      </p>
    </section>
  )
}
