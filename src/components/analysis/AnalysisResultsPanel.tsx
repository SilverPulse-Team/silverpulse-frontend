import { AlertNotice } from '../ui'
import type { AnalysisSession } from '../../types'

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

export function AnalysisResultsPanel({ session }: { session: AnalysisSession }) {
  if (!session.orchestrator.executed) return null
  const coverage = session.orchestrator.coverage
  const observed = strings(coverage.observed_features)
  const missing = strings(coverage.missing_features)
  const explanation = typeof session.orchestrator.results.explanation === 'string'
    ? session.orchestrator.results.explanation
    : null

  return (
    <section aria-labelledby="results-title" className="rounded-card border border-line bg-card p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="results-title" className="text-lg font-semibold text-ink">Resultado de Zoeh</h2>
          <p className="mt-1 text-sm text-muted">Modo: {session.orchestrator.execution_mode}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${session.status === 'partial' ? 'bg-notice/15 text-amber-800' : 'bg-success/15 text-emerald-800'}`}>
          {session.status === 'partial' ? 'Resultado parcial' : 'Completado'}
        </span>
      </div>
      {session.orchestrator.fallback_reason && (
        <div className="mt-4"><AlertNotice title="Modelo de lenguaje no ejecutado" tone="notice">
          Se usó un resumen determinista. Motivo: {session.orchestrator.fallback_reason}.
        </AlertNotice></div>
      )}
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-control bg-canvas p-4">
          <h3 className="text-sm font-semibold text-ink">Variables observadas</h3>
          <p className="mt-2 text-sm leading-6 text-muted">{observed.length ? observed.join(', ') : 'Ninguna'}</p>
        </div>
        <div className="rounded-control bg-canvas p-4">
          <h3 className="text-sm font-semibold text-ink">No evaluables por ausencia</h3>
          <p className="mt-2 text-sm leading-6 text-muted">{missing.length ? missing.join(', ') : 'Ninguna'}</p>
        </div>
      </div>
      {explanation && <p className="mt-5 text-sm leading-7 text-ink">{explanation}</p>}
      {session.post_analysis_questions.length > 0 && (
        <div className="mt-6 border-t border-line pt-5">
          <h3 className="text-base font-semibold text-ink">Preguntas posteriores del orquestador</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted">
            {session.post_analysis_questions.map((question) => <li key={question}>{question}</li>)}
          </ul>
        </div>
      )}
    </section>
  )
}
