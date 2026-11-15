import { FileSearch, FileText, ShieldAlert } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { EvidenceMatrix } from '../components/return/EvidenceMatrix'
import { CountermeasurePanel } from '../components/return/CountermeasurePanel'
import { MissingEvidenceList } from '../components/return/MissingEvidenceList'
import { ReadinessComparison } from '../components/return/ReadinessComparison'
import { PageHeader } from '../components/layout/PageHeader'
import {
  AlertNotice,
  EmptyState,
  ErrorState,
  LoadingSkeleton,
  SecondaryButton,
  TimeStamp,
} from '../components/ui'
import { getDataProvider } from '../services'
import type { Astronaut, Baseline, CountermeasureLogInput, CountermeasurePlan, Observation, Readiness, SimulatorStatus } from '../types'

interface ReturnReadinessData {
  astronaut: Astronaut
  readiness: Readiness
  baselines: Baseline[]
  observations: Observation[]
  simulatorStatus: SimulatorStatus
  baselineUnavailable: boolean
  countermeasures: CountermeasurePlan[]
  countermeasuresUnavailable: boolean
}

type PageState =
  | { status: 'loading' }
  | { status: 'empty'; reason: 'astronaut' | 'domains' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: ReturnReadinessData }

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'Ocurrió un error inesperado al consultar el resumen de evidencia local.'
}

export function ReturnReadinessPage() {
  const [state, setState] = useState<PageState>({ status: 'loading' })
  const [requestVersion, setRequestVersion] = useState(0)

  const retry = useCallback(() => {
    setState({ status: 'loading' })
    setRequestVersion((current) => current + 1)
  }, [])

  useEffect(() => {
    let isCurrent = true

    async function load() {
      try {
        const provider = getDataProvider()
        const astronauts = await provider.getShipAstronauts()
        const astronaut = astronauts[0]

        if (!isCurrent) return
        if (!astronaut) {
          setState({ status: 'empty', reason: 'astronaut' })
          return
        }

        const [readiness, observations, simulatorStatus, baselineResult, countermeasureResult] = await Promise.all([
          provider.getReturnReadiness(astronaut.id),
          provider.getShipObservations({ astronaut_id: astronaut.id }),
          provider.getSimulatorStatus(),
          provider.getShipBaselines(astronaut.id)
            .then((baselines) => ({ baselines, unavailable: false }))
            .catch(() => ({ baselines: [] as Baseline[], unavailable: true })),
          provider.getCountermeasures(astronaut.id)
            .then((countermeasures) => ({ countermeasures, unavailable: false }))
            .catch(() => ({ countermeasures: [] as CountermeasurePlan[], unavailable: true })),
        ])
        if (!isCurrent) return

        if (readiness.domains.length === 0) {
          setState({ status: 'empty', reason: 'domains' })
          return
        }

        setState({
          status: 'ready',
          data: {
            astronaut,
            readiness,
            baselines: baselineResult.baselines,
            observations: observations.items,
            simulatorStatus,
            baselineUnavailable: baselineResult.unavailable,
            countermeasures: countermeasureResult.countermeasures,
            countermeasuresUnavailable: countermeasureResult.unavailable,
          },
        })
      } catch (error) {
        if (isCurrent) setState({ status: 'error', message: getErrorMessage(error) })
      }
    }

    void load()
    return () => {
      isCurrent = false
    }
  }, [requestVersion])

  if (state.status === 'loading') {
    return (
      <div className="space-y-6" aria-live="polite">
        <LoadingSkeleton rows={2} label="Cargando preparación de retorno" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <LoadingSkeleton key={index} rows={4} label={`Cargando dominio ${index + 1}`} />
          ))}
        </div>
      </div>
    )
  }

  if (state.status === 'error') {
    return <ErrorState title="No fue posible cargar la preparación de retorno" message={state.message} onRetry={retry} />
  }

  if (state.status === 'empty') {
    return (
      <EmptyState
        icon={FileSearch}
        title={state.reason === 'astronaut' ? 'No hay astronauta disponible' : 'Sin evidencia para resumir'}
        description={state.reason === 'astronaut'
          ? 'No existe un perfil local desde el cual consultar la preparación de retorno.'
          : 'La respuesta no contiene dominios. No se calcula una aptitud para reemplazar la evidencia ausente.'}
        action={<SecondaryButton type="button" onClick={retry}>Volver a consultar</SecondaryButton>}
      />
    )
  }

  const {
    astronaut,
    readiness,
    baselines,
    observations,
    simulatorStatus,
    baselineUnavailable,
    countermeasures,
    countermeasuresUnavailable,
  } = state.data
  const isLimited = readiness.medical_clearance === null || !readiness.clinically_validated

  const logCountermeasure = async (input: CountermeasureLogInput) => {
    await getDataProvider().logCountermeasure(astronaut.id, input)
    setState((current) => {
      if (current.status !== 'ready') return current
      return {
        ...current,
        data: {
          ...current.data,
          countermeasures: current.data.countermeasures.map((plan) =>
            plan.id === input.plan_id ? { ...plan, logs_completed: plan.logs_completed + 1 } : plan,
          ),
        },
      }
    })
  }

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Preparación funcional para retorno"
        title="Preparación de retorno"
        description={`${astronaut.display_name} · ${readiness.astronaut_id} · ${astronaut.mission_id}`}
        badge={
          <span className="rounded-full border border-data/30 bg-data/10 px-3 py-1 text-xs font-semibold text-nasa-blue">
            DATOS SINTÉTICOS · DEMO
          </span>
        }
        actions={
          <>
            <a href="#pruebas-faltantes" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-control border border-line bg-card px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-nasa-blue hover:text-nasa-blue">
              <FileSearch aria-hidden="true" className="size-4" />
              Consultar evidencia faltante
            </a>
            <SecondaryButton type="button" disabled title="Disponible cuando se implemente la generación de resumen">
              <FileText aria-hidden="true" className="size-4" />
              Generar resumen
            </SecondaryButton>
          </>
        }
      />

      <section className="rounded-card border border-data/25 bg-card p-5 shadow-card" aria-labelledby="evidence-summary-title">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-nasa-blue">Resumen de evidencia</p>
            <h2 id="evidence-summary-title" className="mt-1 text-lg font-semibold text-ink">No es autorización médica</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{readiness.summary}</p>
          </div>
          <TimeStamp value={readiness.generated_at_utc} label="Generado" className="shrink-0" />
        </div>
      </section>

      {isLimited && (
        <AlertNotice title="Límites de interpretación" tone="notice">
          <p>
            La autorización médica no está disponible y este resumen no ha sido validado clínicamente.
            Requiere revisión de profesionales responsables; no autoriza retorno ni aterrizaje.
          </p>
        </AlertNotice>
      )}

      <EvidenceMatrix domains={readiness.domains} />

      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(20rem,0.8fr)]">
        <ReadinessComparison
          comparisonPhase={readiness.comparison_phase}
          domains={readiness.domains}
          baselines={baselines}
          observations={observations}
          baselineUnavailable={baselineUnavailable}
        />
        <MissingEvidenceList domains={readiness.domains} />
      </div>

      <section aria-labelledby="interpretation-boundaries-title" className="grid gap-4 md:grid-cols-3">
        <h2 id="interpretation-boundaries-title" className="sr-only">Diferencias de interpretación</h2>
        <div className="rounded-card border border-line bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Evidencia</p>
          <p className="mt-2 font-semibold text-ink">Faltantes documentales</p>
          <p className="mt-1 text-sm leading-6 text-muted">Indican datos o pruebas no incluidos en la respuesta.</p>
        </div>
        <div className="rounded-card border border-line bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Comunicaciones</p>
          <p className="mt-2 font-semibold text-ink">Enlace: {simulatorStatus.mode === 'offline' ? 'sin conexión' : simulatorStatus.mode}</p>
          <p className="mt-1 text-sm leading-6 text-muted">El estado del enlace no es un estado médico ni altera la cobertura.</p>
        </div>
        <div className="rounded-card border border-line bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Decisión humana</p>
          <p className="mt-2 font-semibold text-ink">Revisión profesional requerida</p>
          <p className="mt-1 text-sm leading-6 text-muted">SilverPulse no sustituye la valoración de responsables humanos.</p>
        </div>
      </section>

      <CountermeasurePanel
        plans={countermeasures}
        optionalUnavailable={countermeasuresUnavailable}
        onLog={logCountermeasure}
      />

      <footer className="flex gap-3 rounded-card border border-line bg-card p-4 text-sm leading-6 text-muted">
        <ShieldAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-notice" />
        <p>
          Este módulo documenta cobertura y faltantes recibidos desde el contrato v0.2.0. No calcula porcentajes de aptitud,
          riesgo de lesión ni recomendaciones clínicas nuevas.
        </p>
      </footer>
    </div>
  )
}
