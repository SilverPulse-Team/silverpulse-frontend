import { useCallback, useEffect, useRef, useState } from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import { CommunicationLog } from '../components/sync/CommunicationLog'
import { DemoSequencePanel } from '../components/sync/DemoSequencePanel'
import { LinkFlowDiagram } from '../components/sync/LinkFlowDiagram'
import { SimulationMetrics } from '../components/sync/SimulationMetrics'
import { SimulatorControls, type SimulatorOperation } from '../components/sync/SimulatorControls'
import type { ConfirmedDemoStage } from '../components/sync/demoSequence'
import { isReconnectedMode } from '../components/sync/demoSequence'
import { ErrorState, LoadingSkeleton } from '../components/ui'
import { getDataProvider, type ShipInboxMessage } from '../services'
import type {
  ListReports,
  SimulatorConfigInput,
  SimulatorMetrics,
  SimulatorStatus,
} from '../types'
import { createSubmissionLock } from '../utils/submissionLock'
import type { ShellEnvironment } from '../components/layout/navigation'

type RemoteState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: T }

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado en Mission Control.'
}

function addConfirmedStage(current: ConfirmedDemoStage[], stage: ConfirmedDemoStage) {
  return current.includes(stage) ? current : [...current, stage]
}

export function MissionControlPage({ environment = 'mission-control' }: { environment?: ShellEnvironment }) {
  const provider = getDataProvider()
  const [statusState, setStatusState] = useState<RemoteState<SimulatorStatus>>({ status: 'loading' })
  const [metricsState, setMetricsState] = useState<RemoteState<SimulatorMetrics>>({ status: 'loading' })
  const [shipReportsState, setShipReportsState] = useState<RemoteState<ListReports>>({ status: 'loading' })
  const [earthReportsState, setEarthReportsState] = useState<RemoteState<ListReports>>({ status: 'loading' })
  const [inboxState, setInboxState] = useState<RemoteState<ShipInboxMessage[]>>({ status: 'loading' })
  const [requestVersion, setRequestVersion] = useState(0)
  const [operation, setOperation] = useState<SimulatorOperation>(null)
  const [operationError, setOperationError] = useState<string>()
  const [operationNotice, setOperationNotice] = useState<string>()
  const [confirmedStages, setConfirmedStages] = useState<ConfirmedDemoStage[]>([])
  const submissionLockRef = useRef(createSubmissionLock())

  const refreshData = useCallback(() => {
    setStatusState({ status: 'loading' })
    setMetricsState({ status: 'loading' })
    setShipReportsState({ status: 'loading' })
    setEarthReportsState({ status: 'loading' })
    setInboxState({ status: 'loading' })
    setRequestVersion((version) => version + 1)
  }, [])

  useEffect(() => {
    let isCurrent = true
    const activeProvider = getDataProvider()

    activeProvider.getSimulatorStatus()
      .then((data) => {
        if (!isCurrent) return
        setStatusState({ status: 'ready', data })
        if (data.mode === 'offline') {
          setConfirmedStages((stages) => addConfirmedStage(stages, 'offline'))
          if (data.queued_ship_to_earth > 0) {
            setConfirmedStages((stages) => addConfirmedStage(stages, 'queue-held'))
          }
        } else if (isReconnectedMode(data.mode)) {
          setConfirmedStages((stages) => addConfirmedStage(stages, 'reconnect'))
        }
      })
      .catch((error: unknown) => {
        if (isCurrent) setStatusState({ status: 'error', message: getErrorMessage(error) })
      })

    activeProvider.getSimulatorMetrics()
      .then((data) => {
        if (isCurrent) setMetricsState({ status: 'ready', data })
      })
      .catch((error: unknown) => {
        if (isCurrent) setMetricsState({ status: 'error', message: getErrorMessage(error) })
      })

    activeProvider.getShipReports()
      .then((data) => {
        if (isCurrent) setShipReportsState({ status: 'ready', data })
      })
      .catch((error: unknown) => {
        if (isCurrent) setShipReportsState({ status: 'error', message: getErrorMessage(error) })
      })

    activeProvider.getEarthReports()
      .then((data) => {
        if (isCurrent) setEarthReportsState({ status: 'ready', data })
      })
      .catch((error: unknown) => {
        if (isCurrent) setEarthReportsState({ status: 'error', message: getErrorMessage(error) })
      })

    activeProvider.getShipInbox()
      .then((data) => {
        if (isCurrent) setInboxState({ status: 'ready', data: data.items })
      })
      .catch((error: unknown) => {
        if (isCurrent) setInboxState({ status: 'error', message: getErrorMessage(error) })
      })

    return () => {
      isCurrent = false
    }
  }, [requestVersion])

  const configureLink = async (input: SimulatorConfigInput) => {
    setOperationError(undefined)
    setOperationNotice(undefined)
    const result = await submissionLockRef.current.run(async () => {
      setOperation('configure')
      try {
        const status = await provider.configureSimulator(input)
        if (status.mode !== input.mode) {
          throw new Error('La API no confirmó el modo solicitado; no se actualizó el panel.')
        }
        setStatusState({ status: 'ready', data: status })
        if (status.mode === 'offline') {
          setConfirmedStages((stages) => addConfirmedStage(stages, 'offline'))
          if (status.queued_ship_to_earth > 0) {
            setConfirmedStages((stages) => addConfirmedStage(stages, 'queue-held'))
          }
        } else if (isReconnectedMode(status.mode)) {
          setConfirmedStages((stages) => addConfirmedStage(stages, 'reconnect'))
        }
        setOperationNotice('Configuración confirmada por el proveedor. Esto no confirma una entrega ni un ACK.')
        refreshData()
      } catch (error) {
        setOperationError(getErrorMessage(error))
      } finally {
        setOperation(null)
      }
    })
    if (!result.started) return
  }

  const advanceClock = async (simulatedSeconds: number) => {
    setOperationError(undefined)
    setOperationNotice(undefined)
    await submissionLockRef.current.run(async () => {
      setOperation('step')
      try {
        await provider.stepSimulator({ simulated_seconds: simulatedSeconds })
        setOperationNotice('El proveedor aceptó el paso solicitado. Consultando estado y métricas; no se presume entrega.')
        refreshData()
      } catch (error) {
        setOperationError(getErrorMessage(error))
      } finally {
        setOperation(null)
      }
    })
  }

  const topBadge =
    statusState.status === 'ready'
      ? <span className="rounded-full border border-notice/40 bg-notice/10 px-3 py-1 text-xs font-semibold text-ink">{statusState.data.mode.toUpperCase()}</span>
      : provider.metadata.mode === 'mock'
        ? <span className="rounded-full border border-notice/40 bg-notice/10 px-3 py-1 text-xs font-semibold text-ink">MODO MOCK</span>
        : undefined

  const communicationIsLoading =
    shipReportsState.status === 'loading' ||
    earthReportsState.status === 'loading' ||
    inboxState.status === 'loading'
  const communicationError = [
    shipReportsState.status === 'error' ? shipReportsState.message : undefined,
    earthReportsState.status === 'error' ? earthReportsState.message : undefined,
    inboxState.status === 'error' ? inboxState.message : undefined,
  ].filter(Boolean).join(' ')
  const sequenceReady =
    statusState.status === 'ready' &&
    metricsState.status === 'ready' &&
    shipReportsState.status === 'ready' &&
    earthReportsState.status === 'ready' &&
    inboxState.status === 'ready'

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHeader
        eyebrow="Simulador local · SilverPulse Sync"
        title={environment === 'ship' ? 'Comunicaciones' : 'Mission Control'}
        description="Controla el enlace DEMO y sigue informes de nave, entregas a Tierra y respuestas recibidas."
        badge={topBadge}
      />

      <p className="rounded-control border border-notice/40 bg-notice/5 p-3 text-sm leading-6 text-ink">
        {provider.metadata.mode === 'mock'
          ? 'Modo mock: las lecturas son fixtures sintéticos; configurar enlace es local y no persistente. El avance y la entrega no se simulan sin un backend.'
          : 'Modo HTTP: cada estado y resultado se obtiene del backend. La interfaz no representa infraestructura NASA ni conecta bases de datos directamente.'}
      </p>

      <section aria-label="Diagrama lógico de enlace">
        {statusState.status === 'loading' ? (
          <LoadingSkeleton rows={5} label="Consultando estado actual del simulador" />
        ) : statusState.status === 'error' ? (
          <ErrorState title="No se pudo consultar el enlace" message={`${statusState.message} No se infiere offline, entrega ni ACK sin respuesta válida.`} onRetry={refreshData} />
        ) : inboxState.status === 'loading' ? (
          <LoadingSkeleton rows={5} label="Consultando respuestas recibidas en nave" />
        ) : inboxState.status === 'error' ? (
          <ErrorState title="No se pudo consultar el retorno lógico" message={inboxState.message} onRetry={refreshData} />
        ) : (
          <LinkFlowDiagram status={statusState.data} inbox={{ items: inboxState.data }} />
        )}
      </section>

      <div className="grid items-stretch gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
        {statusState.status === 'ready' ? (
          <SimulatorControls
            key={`${statusState.data.mode}-${statusState.data.one_way_latency_simulated_s}-${statusState.data.time_acceleration}`}
            status={statusState.data}
            isSubmitting={operation}
            error={operationError}
            notice={operationNotice}
            onConfigure={(input) => { void configureLink(input) }}
            onStep={(seconds) => { void advanceClock(seconds) }}
          />
        ) : statusState.status === 'loading' ? (
          <LoadingSkeleton rows={6} label="Cargando controles del simulador" />
        ) : (
          <ErrorState title="Controles no disponibles" message={statusState.message} onRetry={refreshData} />
        )}

        {metricsState.status === 'ready' ? (
          <SimulationMetrics metrics={metricsState.data} />
        ) : metricsState.status === 'loading' ? (
          <LoadingSkeleton rows={5} label="Consultando métricas de simulación" />
        ) : (
          <ErrorState title="No se pudieron consultar las métricas" message={metricsState.message} onRetry={refreshData} />
        )}
      </div>

      {communicationIsLoading ? (
        <LoadingSkeleton rows={5} label="Consultando informes y respuestas logísticas" />
      ) : communicationError ? (
        <ErrorState title="Trazabilidad parcial no disponible" message={`${communicationError} No se inventan paquetes ni acuses de recibo.`} onRetry={refreshData} />
      ) : (
        <CommunicationLog
          shipReports={shipReportsState.status === 'ready' ? shipReportsState.data.items : []}
          earthReports={earthReportsState.status === 'ready' ? earthReportsState.data.items : []}
          inboxMessages={inboxState.status === 'ready' ? inboxState.data : []}
        />
      )}

      {sequenceReady ? (
        <DemoSequencePanel
          status={statusState.data}
          metrics={metricsState.data}
          shipReports={shipReportsState.data.items}
          earthReports={earthReportsState.data.items}
          inboxMessages={inboxState.data}
          confirmedStages={confirmedStages}
        />
      ) : communicationIsLoading || statusState.status === 'loading' || metricsState.status === 'loading' ? (
        <LoadingSkeleton rows={5} label="Verificando hitos de la secuencia demostrativa" />
      ) : (
        <ErrorState
          title="No se puede confirmar toda la secuencia"
          message="Una o más consultas fallaron. Los hitos desconocidos permanecen sin completar."
          onRetry={refreshData}
        />
      )}
    </div>
  )
}
