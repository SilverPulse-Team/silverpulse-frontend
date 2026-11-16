import { CheckCircle2, FlaskConical, ShieldCheck, Satellite } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import { EvaluationResults, type EvaluationDisplayResult } from '../components/evidence/EvaluationResults'
import { SourcesList } from '../components/evidence/SourcesList'
import { EmptyState, ErrorState, LoadingSkeleton, PrimaryButton, SecondaryButton } from '../components/ui'
import { ApiClientError, getDataProvider, type EvaluationResult, type EvaluationRunResult, type ResearchSource } from '../services'
import type { SimulatorMetrics } from '../types'

type EvidenceTab = 'sources' | 'methodology' | 'evaluation' | 'limitations'
type LoadState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: unknown }
  | { status: 'unavailable'; error?: unknown }
  | { status: 'ready'; data: T }
type RequestState<T> = { request: number; state: LoadState<T> }

function currentState<T>(requestState: RequestState<T>, request: number): LoadState<T> {
  return requestState.request === request ? requestState.state : { status: 'loading' }
}

const tabs: { id: EvidenceTab; label: string }[] = [
  { id: 'sources', label: 'Fuentes' },
  { id: 'methodology', label: 'Metodología' },
  { id: 'evaluation', label: 'Evaluación' },
  { id: 'limitations', label: 'Alcance del demo' },
]

const methodPanels = [
  {
    title: 'A · Umbral fijo',
    description:
      'Método de referencia basado en un umbral fijo. El umbral concreto y sus resultados solo se muestran si los informa el backend.',
  },
  {
    title: 'B · Contexto y referencia',
    description:
      'Considera contexto y referencia. No se completan valores ausentes ni se infiere una comparación que la API no haya devuelto.',
  },
  {
    title: 'C · Calidad, contexto, persistencia y abstención',
    description:
      'Considera la calidad de datos, contexto, persistencia y abstención. Es una descripción del método, no una afirmación de eficacia clínica.',
  },
]

const evaluationFixtures = [
  { id: 'analysis_abc', label: 'Comparar análisis A/B/C', description: 'Compara estrategias de análisis y abstención sobre el fixture reproducible incluido.' },
  { id: 'link_drop', label: 'Probar enlace intermitente', description: 'Ejecuta el escenario reproducible de transporte con interrupciones.' },
]

function isEndpointUnavailable(error: unknown) {
  return error instanceof ApiClientError && (error.status === 404 || error.status === 501)
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

function showMetricValue(value: string | number | boolean | null) {
  return value === null ? 'No reportado' : String(value)
}

function MethodologyPanel() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-xl font-semibold text-ink">Metodología de evaluación</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
          Estos paneles describen las estrategias que se pueden contrastar. No son resultados ni
          validaciones de SilverPulse. Las mediciones se muestran únicamente cuando las devuelve
          la API.
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {methodPanels.map((panel) => (
            <article key={panel.title} className="rounded-card border border-line bg-card p-5 shadow-card">
              <h3 className="font-semibold text-ink">{panel.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{panel.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-ink">Política de transporte</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            ['FIFO', 'Entrega en orden de llegada. Su rendimiento no se presupone.'],
            ['Prioridad', 'Entrega priorizada. Cualquier diferencia debe estar medida por el backend.'],
          ].map(([title, description]) => (
            <article key={title} className="rounded-card border border-line bg-card p-5 shadow-card">
              <h3 className="font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
            </article>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted">
          La API v0.2.0 no define resultados separados de FIFO y prioridad en su esquema estático;
          solo se atribuye esa comparación si aparece explícitamente en las métricas devueltas.
        </p>
      </section>
    </div>
  )
}

function LimitationsPanel() {
  return (
    <section className="space-y-5">
      <div className="rounded-card border border-nasa-blue/25 bg-gradient-to-br from-nasa-blue/10 to-card p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-nasa-blue text-white"><ShieldCheck aria-hidden="true" className="size-5" /></span>
          <div>
            <h2 className="text-xl font-semibold text-ink">¿Para qué sirve esta sección?</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
              Define qué puedes demostrar con seguridad durante la presentación y qué afirmaciones debes evitar. Protege la credibilidad del demo; no es una pantalla clínica.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-card border border-data/30 bg-card p-5 shadow-card">
          <CheckCircle2 aria-hidden="true" className="size-6 text-data" />
          <h3 className="mt-3 font-semibold text-ink">Sí demuestra</h3>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-muted">
            <li>• Flujos reproducibles con datos sintéticos.</li>
            <li>• Trazabilidad y abstención cuando faltan datos.</li>
            <li>• Comunicación diferida mediante un simulador local.</li>
          </ul>
        </article>
        <article className="rounded-card border border-notice/35 bg-card p-5 shadow-card">
          <FlaskConical aria-hidden="true" className="size-6 text-notice" />
          <h3 className="mt-3 font-semibold text-ink">No demuestra</h3>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-muted">
            <li>• Diagnóstico, tratamiento o validación clínica.</li>
            <li>• Resultados de pacientes o misiones reales.</li>
            <li>• Aprobación, afiliación o infraestructura de NASA.</li>
          </ul>
        </article>
        <article className="rounded-card border border-line bg-card p-5 shadow-card">
          <Satellite aria-hidden="true" className="size-6 text-nasa-blue" />
          <h3 className="mt-3 font-semibold text-ink">Cómo presentarlo</h3>
          <p className="mt-3 text-sm leading-6 text-muted">
            Di «prototipo demostrativo con datos sintéticos». Explica que las fuentes dan contexto y que las métricas de evaluación provienen del backend; no conviertas una corrida en evidencia clínica.
          </p>
        </article>
      </div>
    </section>
  )
}

function SourcesPanel({
  state,
  onRetry,
}: {
  state: LoadState<ResearchSource[]>
  onRetry: () => void
}) {
  if (state.status === 'loading') {
    return <LoadingSkeleton rows={4} label="Cargando fuentes públicas" />
  }
  if (state.status === 'error') {
    return (
      <ErrorState
        title="No fue posible consultar las fuentes"
        message={errorMessage(state.error, 'Ocurrió un error inesperado al consultar el catálogo.')}
        onRetry={onRetry}
      />
    )
  }
  if (state.status === 'unavailable') {
    return (
      <EmptyState
        title="Catálogo de fuentes no disponible"
        description="El endpoint de fuentes no está disponible en este backend. No se muestran enlaces de respaldo inventados."
        action={<SecondaryButton type="button" onClick={onRetry}>Reintentar</SecondaryButton>}
      />
    )
  }
  if (state.data.length === 0) {
    return (
      <EmptyState
        title="No hay fuentes en el catálogo"
        description="El backend no devolvió fuentes públicas. No se agregan atribuciones ni enlaces fuera del catálogo."
      />
    )
  }

  return <SourcesList sources={state.data} />
}

function SimulatorMetricsPanel({ state, onRetry }: { state: LoadState<SimulatorMetrics>; onRetry: () => void }) {
  if (state.status === 'loading') {
    return <LoadingSkeleton rows={2} label="Cargando métricas del simulador" />
  }
  if (state.status === 'error') {
    return (
      <ErrorState
        title="No fue posible consultar las métricas del simulador"
        message={errorMessage(state.error, 'Ocurrió un error inesperado al consultar las métricas.')}
        onRetry={onRetry}
      />
    )
  }
  if (state.status === 'unavailable') {
    return (
      <EmptyState
        title="Métricas no disponibles"
        description="El endpoint de métricas del simulador no está disponible. No se estiman valores."
        action={<SecondaryButton type="button" onClick={onRetry}>Reintentar</SecondaryButton>}
      />
    )
  }
  if (!state.data.has_run) {
    return (
      <EmptyState
        title="No ejecutada / Sin resultados"
        description="El backend indica que todavía no hay una corrida del simulador. No se muestran métricas estimadas."
      />
    )
  }

  const fields: { key: keyof SimulatorMetrics; label: string }[] = [
    { key: 'scenario_id', label: 'Escenario' },
    { key: 'delivered_count', label: 'Mensajes entregados' },
    { key: 'duplicates_suppressed', label: 'Duplicados suprimidos' },
    { key: 'messages_lost_after_restart', label: 'Mensajes perdidos tras reinicio' },
    { key: 'priority_delivery_delay_simulated_s', label: 'Demora de prioridad simulada (s)' },
    { key: 'bytes_transferred', label: 'Bytes transferidos' },
    { key: 'queued_count', label: 'Mensajes en cola' },
  ]

  return (
    <dl className="grid gap-4 rounded-card border border-line bg-card p-5 shadow-card sm:grid-cols-2 lg:grid-cols-3">
      {fields.map(({ key, label }) => (
        <div key={key}>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted">{label}</dt>
          <dd className="mt-1 break-words text-sm text-ink">{showMetricValue(state.data[key])}</dd>
        </div>
      ))}
    </dl>
  )
}

export function EvidencePage() {
  const provider = getDataProvider()
  const [activeTab, setActiveTab] = useState<EvidenceTab>('sources')
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const [sourcesRefresh, setSourcesRefresh] = useState(0)
  const [evaluationRefresh, setEvaluationRefresh] = useState(0)
  const [metricsRefresh, setMetricsRefresh] = useState(0)
  const [sourcesRequestState, setSourcesRequestState] = useState<RequestState<ResearchSource[]>>({
    request: 0,
    state: { status: 'loading' },
  })
  const [evaluationRequestState, setEvaluationRequestState] = useState<RequestState<EvaluationResult[]>>({
    request: 0,
    state: { status: 'loading' },
  })
  const [metricsRequestState, setMetricsRequestState] = useState<RequestState<SimulatorMetrics>>({
    request: 0,
    state: { status: 'loading' },
  })
  const sourcesState = currentState(sourcesRequestState, sourcesRefresh)
  const evaluationState = currentState(evaluationRequestState, evaluationRefresh)
  const simulatorMetricsState = currentState(metricsRequestState, metricsRefresh)
  const [fixtureId, setFixtureId] = useState('')
  const [latestRun, setLatestRun] = useState<EvaluationRunResult>()
  const [runError, setRunError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    provider.getResearchSources().then(
      (data) => {
        if (active) setSourcesRequestState({
          request: sourcesRefresh,
          state: { status: 'ready', data },
        })
      },
      (error: unknown) => {
        if (!active) return
        setSourcesRequestState({
          request: sourcesRefresh,
          state: isEndpointUnavailable(error) ? { status: 'unavailable', error } : { status: 'error', error },
        })
      },
    )
    return () => {
      active = false
    }
  }, [provider, sourcesRefresh])

  useEffect(() => {
    let active = true
    provider.getEvaluationResults().then(
      (data) => {
        if (active) setEvaluationRequestState({
          request: evaluationRefresh,
          state: { status: 'ready', data },
        })
      },
      (error: unknown) => {
        if (!active) return
        setEvaluationRequestState({
          request: evaluationRefresh,
          state: isEndpointUnavailable(error) ? { status: 'unavailable', error } : { status: 'error', error },
        })
      },
    )
    return () => {
      active = false
    }
  }, [provider, evaluationRefresh])

  useEffect(() => {
    let active = true
    provider.getSimulatorMetrics().then(
      (data) => {
        if (active) setMetricsRequestState({
          request: metricsRefresh,
          state: { status: 'ready', data },
        })
      },
      (error: unknown) => {
        if (!active) return
        setMetricsRequestState({
          request: metricsRefresh,
          state: isEndpointUnavailable(error) ? { status: 'unavailable', error } : { status: 'error', error },
        })
      },
    )
    return () => {
      active = false
    }
  }, [provider, metricsRefresh])

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | undefined
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = tabs.length - 1
    if (nextIndex === undefined) return

    event.preventDefault()
    setActiveTab(tabs[nextIndex].id)
    tabRefs.current[nextIndex]?.focus()
  }

  const handleRunEvaluation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const requestedFixtureId = fixtureId.trim()
    if (!requestedFixtureId || provider.metadata.mode !== 'http' || isSubmitting) return

    setIsSubmitting(true)
    setRunError(undefined)
    try {
      const result = await provider.runEvaluation({ fixture_id: requestedFixtureId })
      setLatestRun(result)
      setEvaluationRefresh((value) => value + 1)
      setMetricsRefresh((value) => value + 1)
    } catch (error) {
      if (isEndpointUnavailable(error)) {
        setEvaluationRefresh((value) => value + 1)
        setRunError('La API P1 de ejecución de evaluaciones no está disponible en este backend.')
      } else {
        setRunError(errorMessage(error, 'No fue posible iniciar la evaluación.'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const results: EvaluationDisplayResult[] = evaluationState.status === 'ready'
    ? evaluationState.data.map((result) => (
        latestRun?.run_id === result.run_id ? { ...result, fixture_id: latestRun.fixture_id } : result
      ))
    : []
  if (latestRun && !results.some((result) => result.run_id === latestRun.run_id)) {
    results.unshift(latestRun)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Fuentes públicas · Evaluación reproducible"
        title="Evidencia científica"
        description="Fuentes atribuibles, metodología y resultados devueltos por la API, con sus límites explícitos."
      />

      <aside className="rounded-card border border-nasa-blue/20 bg-nasa-blue/5 p-4 text-sm leading-6 text-ink" role="note">
        Las fuentes contextualizan investigación; no validan SilverPulse. No se presentan datos sintéticos
        como evidencia clínica ni como resultados reales de NASA.
      </aside>

      <div role="tablist" aria-label="Secciones de evidencia científica" className="flex flex-wrap gap-2 border-b border-line">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(element) => { tabRefs.current[index] = element }}
            id={`evidence-tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`evidence-panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={(event) => handleTabKeyDown(event, index)}
            className={`min-h-11 border-b-2 px-4 text-sm font-medium ${
              activeTab === tab.id
                ? 'border-nasa-blue text-nasa-blue'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <section
        id={`evidence-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`evidence-tab-${activeTab}`}
        tabIndex={0}
        className="min-w-0 outline-none focus-visible:ring-2 focus-visible:ring-nasa-blue"
      >
        {activeTab === 'sources' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-ink">Fuentes públicas</h2>
              <p className="mt-1 text-sm leading-6 text-muted">
                Título, atribución disponible en el catálogo y relevancia declarada por el backend.
                El contrato v0.2.0 no incluye un campo de autor independiente.
              </p>
            </div>
            <SourcesPanel state={sourcesState} onRetry={() => setSourcesRefresh((value) => value + 1)} />
          </div>
        )}

        {activeTab === 'methodology' && <MethodologyPanel />}

        {activeTab === 'evaluation' && (
          <div className="space-y-8">
            <MethodologyPanel />
            <section className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-ink">Corridas reproducibles</h2>
                  <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">
                    Se envía únicamente fixture_id a POST /evaluation/run. Los valores y N provienen de
                    la API; el frontend no estima mejoras.
                  </p>
                </div>
                <SecondaryButton
                  type="button"
                  onClick={() => {
                    setEvaluationRefresh((value) => value + 1)
                    setMetricsRefresh((value) => value + 1)
                  }}
                >
                  Actualizar resultados
                </SecondaryButton>
              </div>

              {provider.metadata.mode === 'http' ? (
                <form onSubmit={handleRunEvaluation} className="space-y-4 rounded-card border border-line bg-card p-4 sm:p-5">
                  <fieldset>
                    <legend className="text-sm font-semibold text-ink">Elige un escenario reproducible</legend>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      {evaluationFixtures.map((fixture) => (
                        <button
                          key={fixture.id}
                          type="button"
                          aria-pressed={fixtureId === fixture.id}
                          onClick={() => setFixtureId(fixture.id)}
                          className={`min-h-24 rounded-card border p-4 text-left transition-colors ${fixtureId === fixture.id ? 'border-nasa-blue bg-nasa-blue/5 ring-2 ring-nasa-blue/20' : 'border-line hover:border-nasa-blue/50'}`}
                        >
                          <span className="block text-sm font-semibold text-ink">{fixture.label}</span>
                          <span className="mt-1 block text-xs leading-5 text-muted">{fixture.description}</span>
                          <span className="mt-2 block font-mono text-[11px] text-nasa-blue">{fixture.id}</span>
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                    <p className="text-xs text-muted">La corrida se guarda en <code>evaluation.db</code> y luego aparece en resultados.</p>
                    <PrimaryButton type="submit" disabled={isSubmitting || !fixtureId}>
                      {isSubmitting ? 'Ejecutando…' : 'Ejecutar escenario'}
                    </PrimaryButton>
                  </div>
                </form>
              ) : (
                <EmptyState
                  title="Ejecución disponible solo con backend"
                  description="El modo mock no simula ni persiste corridas. Configura el provider HTTP para ejecutar una evaluación real del backend."
                />
              )}

              {runError && (
                <ErrorState
                  title="No se pudo ejecutar la evaluación"
                  message={runError}
                />
              )}

              {evaluationState.status === 'loading' && <LoadingSkeleton rows={3} label="Cargando resultados de evaluación" />}
              {evaluationState.status === 'error' && (
                <ErrorState
                  title="No fue posible consultar las evaluaciones"
                  message={errorMessage(evaluationState.error, 'Ocurrió un error inesperado al consultar los resultados.')}
                  onRetry={() => setEvaluationRefresh((value) => value + 1)}
                />
              )}
              {evaluationState.status === 'unavailable' && (
                <EmptyState
                  title="No ejecutada / Sin resultados"
                  description="La API de evaluación no está disponible en este backend. No se muestran porcentajes ni mejoras estimadas."
                />
              )}
              {evaluationState.status === 'ready' && results.length === 0 && (
                <EmptyState
                  title="Aún no hay corridas"
                  description="Selecciona uno de los dos escenarios de arriba y ejecútalo. Los resultados y el tamaño de muestra vendrán del backend."
                />
              )}
              {results.length > 0 && <EvaluationResults results={results} />}
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-ink">Métricas del simulador</h2>
                <p className="mt-1 text-sm leading-6 text-muted">
                  Valores de GET /simulator/metrics. Una corrida individual no constituye por sí sola
                  una comparación FIFO contra prioridad.
                </p>
              </div>
              <SimulatorMetricsPanel
                state={simulatorMetricsState}
                onRetry={() => setMetricsRefresh((value) => value + 1)}
              />
            </section>
          </div>
        )}

        {activeTab === 'limitations' && <LimitationsPanel />}
      </section>
    </div>
  )
}
