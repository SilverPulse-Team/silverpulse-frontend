import { ClipboardList, History, Upload } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { EarthMessagesPanel } from '../components/dashboard/EarthMessagesPanel'
import { LinkModeBadge, LinkStatus } from '../components/dashboard/LinkStatus'
import { NoticesPanel } from '../components/dashboard/NoticesPanel'
import { PageHeader } from '../components/layout/PageHeader'
import {
  EmptyState,
  ErrorState,
  LoadingSkeleton,
  MetricCard,
  MissionPhaseBadge,
  TimeStamp,
} from '../components/ui'
import { getDataProvider, type ShipInbox } from '../services'
import type { Astronaut, Overview, OverviewCard, SimulatorStatus } from '../types'

interface DashboardData {
  astronaut: Astronaut
  overview: Overview
}

type DashboardState =
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: DashboardData }

type RemoteState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: T }

const actionLinkClassName =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-control border border-line bg-card px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-nasa-blue hover:text-nasa-blue'

const trendLabels: Record<string, string> = {
  stable: 'Tendencia textual: estable.',
  below_personal_baseline: 'Bajo la referencia personal.',
  insufficient_data: 'Evidencia insuficiente para describir una tendencia.',
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'Ocurrió un error inesperado al consultar los datos locales de la nave.'
}

function getLastObservation(cards: OverviewCard[]) {
  const timestamps = cards
    .map((card) => card.observed_at_utc)
    .filter((timestamp): timestamp is string => timestamp !== null)
    .map((timestamp) => new Date(timestamp))
    .filter((date) => !Number.isNaN(date.getTime()))

  if (timestamps.length === 0) return null
  return new Date(Math.max(...timestamps.map((date) => date.getTime()))).toISOString()
}

function getMetricHelper(card: OverviewCard) {
  const trend = trendLabels[card.trend] ?? `Tendencia descriptiva: ${card.trend}.`

  if (card.metric_code === 'sleep_duration' && typeof card.value === 'number' && card.unit === 'min') {
    const hours = Math.floor(card.value / 60)
    const minutes = card.value % 60
    return `${hours} h ${minutes} min · ${trend}`
  }

  return trend
}

function DashboardMetricCard({ card, phase }: { card: OverviewCard; phase: Overview['mission_phase'] }) {
  const helperText = getMetricHelper(card)

  if (
    card.value === null ||
    card.unit === null ||
    card.observed_at_utc === null ||
    card.source_kind === null
  ) {
    return <MetricCard label={card.label} value={null} quality={card.quality} helperText={helperText} />
  }

  return (
    <MetricCard
      label={card.label}
      value={card.value}
      unit={card.unit}
      source={card.source_kind}
      quality={card.quality}
      phase={phase}
      observedAt={card.observed_at_utc}
      helperText={helperText}
    />
  )
}

export function AstronautOverviewPage() {
  const [state, setState] = useState<DashboardState>({ status: 'loading' })
  const [requestVersion, setRequestVersion] = useState(0)
  const [linkState, setLinkState] = useState<RemoteState<SimulatorStatus>>({ status: 'loading' })
  const [linkRequestVersion, setLinkRequestVersion] = useState(0)
  const [inboxState, setInboxState] = useState<RemoteState<ShipInbox>>({ status: 'loading' })
  const [inboxRequestVersion, setInboxRequestVersion] = useState(0)

  const loadDashboard = useCallback(() => {
    setState({ status: 'loading' })
    setRequestVersion((current) => current + 1)
  }, [])

  const loadLinkStatus = useCallback(() => {
    setLinkState({ status: 'loading' })
    setLinkRequestVersion((current) => current + 1)
  }, [])

  const loadInbox = useCallback(() => {
    setInboxState({ status: 'loading' })
    setInboxRequestVersion((current) => current + 1)
  }, [])

  useEffect(() => {
    let isCurrent = true
    const provider = getDataProvider()

    async function load() {
      try {
        const astronauts = await provider.getShipAstronauts()
        if (!isCurrent) return

        const astronaut = astronauts[0]
        if (!astronaut) {
          setState({ status: 'empty' })
          return
        }

        const overview = await provider.getShipOverview(astronaut.id)
        if (isCurrent) setState({ status: 'ready', data: { astronaut, overview } })
      } catch (error) {
        if (isCurrent) setState({ status: 'error', message: getErrorMessage(error) })
      }
    }

    void load()
    return () => {
      isCurrent = false
    }
  }, [requestVersion])

  useEffect(() => {
    let isCurrent = true

    getDataProvider()
      .getSimulatorStatus()
      .then((status) => {
        if (isCurrent) setLinkState({ status: 'ready', data: status })
      })
      .catch((error: unknown) => {
        if (isCurrent) setLinkState({ status: 'error', message: getErrorMessage(error) })
      })

    return () => {
      isCurrent = false
    }
  }, [linkRequestVersion])

  useEffect(() => {
    let isCurrent = true

    getDataProvider()
      .getShipInbox()
      .then((inbox) => {
        if (isCurrent) setInboxState({ status: 'ready', data: inbox })
      })
      .catch((error: unknown) => {
        if (isCurrent) setInboxState({ status: 'error', message: getErrorMessage(error) })
      })

    return () => {
      isCurrent = false
    }
  }, [inboxRequestVersion])

  if (state.status === 'loading') {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Entorno nave"
          title="Panel del astronauta"
          description="Consultando el perfil y las observaciones registradas localmente."
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <LoadingSkeleton rows={4} label="Cargando indicador de frecuencia cardíaca" />
          <LoadingSkeleton rows={4} label="Cargando indicador de sueño" />
          <LoadingSkeleton rows={4} label="Cargando indicador de fuerza" />
        </div>
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Entorno nave"
          title="Panel del astronauta"
          description="No se muestran mediciones hasta confirmar una respuesta válida del proveedor de datos."
        />
        <ErrorState message={state.message} onRetry={loadDashboard} />
      </div>
    )
  }

  if (state.status === 'empty') {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Entorno nave" title="Panel del astronauta" />
        <EmptyState
          title="Sin astronautas disponibles"
          description="El proveedor no devolvió perfiles. No se generaron tarjetas ni mediciones de demostración."
        />
      </div>
    )
  }

  const { astronaut, overview } = state.data
  const lastObservation = getLastObservation(overview.cards)
  const showDemoBadge = overview.demo_data || astronaut.is_fictional

  return (
    <div className="space-y-6">
      <section
        aria-label="Encabezado operativo del astronauta"
        className="rounded-card border border-line bg-card p-5 shadow-card lg:p-6"
      >
        <PageHeader
          eyebrow="Entorno nave"
          title="Panel del astronauta"
          description={`Monitoreo biomédico y funcional personal a bordo · ${astronaut.display_name} · ${astronaut.id}`}
          badge={
            <>
              {showDemoBadge && (
                <span className="rounded-full border border-notice/30 bg-notice/10 px-3 py-1 text-xs font-semibold text-ink">
                  DATOS SINTÉTICOS · DEMO
                </span>
              )}
              {linkState.status === 'ready' && <LinkModeBadge mode={linkState.data.mode} />}
            </>
          }
          actions={
            <>
              <Link className={actionLinkClassName} to="/astronaut/import">
                <Upload aria-hidden="true" className="size-4" />
                Importar datos
              </Link>
              <Link className={actionLinkClassName} to="/astronaut/trends">
                <History aria-hidden="true" className="size-4" />
                Ver tendencias
              </Link>
              <Link className={actionLinkClassName} to="/astronaut/return">
                <ClipboardList aria-hidden="true" className="size-4" />
                Explorar retorno
              </Link>
            </>
          }
        />

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Misión ficticia</p>
            <p className="mt-2 font-mono text-base font-semibold text-ink">{astronaut.mission_id}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Fase actual</p>
            <div className="mt-2"><MissionPhaseBadge phase={overview.mission_phase} /></div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Último dato en UTC</p>
            <TimeStamp value={lastObservation} label="Última observación" className="mt-2 block font-mono" />
          </div>
        </div>

        <LinkStatus
          embedded
          status={linkState.status === 'ready' ? linkState.data : undefined}
          loading={linkState.status === 'loading'}
          error={linkState.status === 'error' ? linkState.message : undefined}
          lastEarthSyncAt={overview.last_earth_sync_at_utc}
          onRetry={loadLinkStatus}
        />
      </section>

      <section aria-labelledby="dashboard-metrics-title">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-nasa-blue">Indicadores</p>
            <h2 id="dashboard-metrics-title" className="mt-1 text-xl font-semibold text-ink">
              Observaciones más recientes
            </h2>
          </div>
          <TimeStamp value={overview.as_of_utc} label="Resumen actualizado" />
        </div>

        {overview.cards.length > 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {overview.cards.map((card) => (
              <DashboardMetricCard key={card.metric_code} card={card} phase={overview.mission_phase} />
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState
              title="Sin indicadores disponibles"
              description="El resumen no contiene observaciones. No se muestran valores de reemplazo."
            />
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(20rem,1fr)]" aria-label="Avisos y mensajes">
        <NoticesPanel notices={overview.notices} />
        <EarthMessagesPanel
          inbox={inboxState.status === 'ready' ? inboxState.data : undefined}
          loading={inboxState.status === 'loading'}
          error={inboxState.status === 'error' ? inboxState.message : undefined}
          onRetry={loadInbox}
        />
      </section>
    </div>
  )
}
