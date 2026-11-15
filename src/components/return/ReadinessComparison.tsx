import { CalendarRange, CircleDashed, Database } from 'lucide-react'
import type { Baseline, Observation, ReadinessDomain } from '../../types'
import { getEvidenceLabel } from './readinessLabels'

interface ReadinessComparisonProps {
  comparisonPhase: string
  domains: ReadinessDomain[]
  baselines: Baseline[]
  observations: Observation[]
  baselineUnavailable?: boolean
}

const phaseLabels: Record<string, string> = {
  preflight: 'Pre-vuelo',
  inflight: 'Durante el vuelo',
  postflight: 'Post-vuelo',
}

function phasePair(comparisonPhase: string) {
  const [from, to] = comparisonPhase.split('_vs_')
  return {
    from: phaseLabels[from] ? from : 'preflight',
    to: phaseLabels[to] ? to : 'inflight',
  }
}

function formatValue(value: number | string, unit: string) {
  return `${value} ${unit}`
}

export function ReadinessComparison({
  comparisonPhase,
  domains,
  baselines,
  observations,
  baselineUnavailable = false,
}: ReadinessComparisonProps) {
  const phases = phasePair(comparisonPhase)
  const metricCodes = Array.from(new Set(domains.flatMap((domain) => domain.evidence)))

  return (
    <section aria-labelledby="readiness-comparison-title" className="rounded-card border border-line bg-card p-5 shadow-card lg:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-nasa-blue">Comparación documental</p>
          <h2 id="readiness-comparison-title" className="mt-1 text-xl font-semibold text-ink">
            {phaseLabels[phases.from]} vs. {phaseLabels[phases.to]}
          </h2>
        </div>
        <p className="text-sm text-muted">Solo mediciones y referencias disponibles en las consultas.</p>
      </div>

      {baselineUnavailable && (
        <p role="status" className="mt-4 rounded-control border border-notice/30 bg-notice/10 p-3 text-sm text-ink">
          La consulta de referencias no está disponible. Los valores ausentes permanecen como «Sin baseline».
        </p>
      )}

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[42rem] border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-muted">
              <th className="border-b border-line px-3 py-3 font-semibold">Medición</th>
              <th className="border-b border-line px-3 py-3 font-semibold">{phaseLabels[phases.from]}</th>
              <th className="border-b border-line px-3 py-3 font-semibold">{phaseLabels[phases.to]}</th>
              <th className="border-b border-line px-3 py-3 font-semibold">Lectura permitida</th>
            </tr>
          </thead>
          <tbody>
            {metricCodes.map((metricCode) => {
              const baseline = baselines.find((item) => item.metric_code === metricCode && item.phase === phases.from)
              const matching = observations.filter((item) => item.metric_code === metricCode && item.phase === phases.to)

              return (
                <tr key={metricCode} className="align-top">
                  <th className="border-b border-line px-3 py-4 font-semibold text-ink">{getEvidenceLabel(metricCode)}</th>
                  <td className="border-b border-line px-3 py-4 text-ink">
                    {baseline && baseline.median !== null ? (
                      <div className="space-y-1">
                        <p className="font-semibold">Mediana {formatValue(baseline.median, baseline.unit)}</p>
                        <p className="text-xs text-muted">N = {baseline.n} · {baseline.activity_context ?? 'Contexto no informado'}</p>
                        <p className="text-xs text-muted">{baseline.period_start_utc.slice(0, 10)} — {baseline.period_end_utc.slice(0, 10)}</p>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-2 text-muted"><CircleDashed aria-hidden="true" className="size-4" /> Sin baseline</span>
                    )}
                  </td>
                  <td className="border-b border-line px-3 py-4 text-ink">
                    {matching.length > 0 ? (
                      <ul className="space-y-2">
                        {matching.map((observation) => (
                          <li key={observation.id}>
                            <span className="font-semibold">{formatValue(observation.value, observation.unit)}</span>
                            <span className="block text-xs text-muted">{observation.observed_at_utc} · {observation.quality}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="inline-flex items-center gap-2 text-muted"><CircleDashed aria-hidden="true" className="size-4" /> Sin observaciones consultadas</span>
                    )}
                  </td>
                  <td className="border-b border-line px-3 py-4 text-muted">
                    {baseline && matching.length > 0
                      ? 'Datos visibles; la UI no infiere persistencia ni equivalencia de contextos.'
                      : 'Brecha explícita; no se crea un valor de reemplazo.'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {metricCodes.length === 0 && (
        <div className="mt-5 flex items-start gap-3 rounded-control border border-dashed border-line p-4 text-sm text-muted">
          <Database aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          No hay mediciones declaradas para construir la comparación.
        </div>
      )}

      <div className="mt-4 flex items-start gap-3 text-sm leading-6 text-muted">
        <CalendarRange aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-data" />
        Una referencia agregada y una observación no constituyen por sí solas una evaluación funcional ni clínica.
      </div>
    </section>
  )
}
