import type { EvaluationResult } from '../../services'

export type EvaluationDisplayResult = EvaluationResult & {
  fixture_id?: string
}

function displayValue(value: unknown) {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  if (value === null) return 'null'
  return JSON.stringify(value) ?? String(value)
}

function ResultField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-1 break-words text-sm text-ink">{value}</dd>
    </div>
  )
}

export function EvaluationResults({ results }: { results: EvaluationDisplayResult[] }) {
  return (
    <div className="space-y-4">
      {results.map((result) => (
        <article
          key={result.run_id}
          className="rounded-card border border-line bg-card p-5 shadow-card"
        >
          <h3 className="text-lg font-semibold text-ink">Corrida {result.run_id}</h3>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ResultField label="N (muestra)" value={String(result.sample_n)} />
            <ResultField
              label="fixture_id"
              value={result.fixture_id ?? 'No informado por GET /evaluation/results'}
            />
            <ResultField
              label="Fuente / dataset"
              value="No informado por el contrato v0.2.0"
            />
            <ResultField
              label="Versión del método"
              value="No informada por el contrato v0.2.0"
            />
            <ResultField
              label="Algoritmo"
              value="No informado por el contrato v0.2.0"
            />
            <ResultField
              label="Fecha de ejecución"
              value="No informada por el contrato v0.2.0"
            />
            <ResultField
              label="Limitaciones de la corrida"
              value="No informadas por el contrato v0.2.0"
            />
          </dl>
          <div className="mt-5 border-t border-line pt-4">
            <h4 className="font-semibold text-ink">Métricas medidas por el backend</h4>
            {Object.keys(result.metrics).length > 0 ? (
              <dl className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(result.metrics).map(([name, value]) => (
                  <ResultField key={name} label={name} value={displayValue(value)} />
                ))}
              </dl>
            ) : (
              <p className="mt-2 text-sm text-muted">
                La API no devolvió métricas para esta corrida.
              </p>
            )}
          </div>
        </article>
      ))}
    </div>
  )
}
