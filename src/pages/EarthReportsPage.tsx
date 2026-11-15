import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { PageHeader } from '../components/layout/PageHeader'
import { EmptyState, ErrorState, FilterBar, LoadingSkeleton, ResponsiveDataTable, TimeStamp } from '../components/ui'
import { LinkModeBadge } from '../components/dashboard/LinkStatus'
import { getDataProvider } from '../services'
import type { ListReports, Report, ReviewStatus, SimulatorStatus } from '../types'
import { filterEarthReports, initialEarthReportFilters } from './earthReportFilters'

type RemoteState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: T }

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'No se pudieron consultar los informes recibidos en Tierra.'
}

function isEarthReceived(report: Report) {
  return report.communication.status === 'delivered' && report.communication.delivered_at_utc !== null
}

const reviewStatusLabels: Record<ReviewStatus, string> = {
  pending: 'Pendiente',
  reviewed: 'Revisado',
  not_received_on_ship: 'Retorno no recibido en nave',
}

const phaseLabels: Record<string, string> = {
  preflight: 'Pre-vuelo',
  inflight: 'Durante vuelo',
  postflight: 'Post-vuelo',
}

const sourceLabels: Record<string, string> = {
  wearable: 'Wearable',
  public_dataset: 'Dataset público',
  synthetic: 'Sintético',
  clinical: 'Clínico',
}

const fieldClassName =
  'sp-field mt-1.5 w-full rounded-control border border-line bg-card px-3 text-sm text-ink transition-colors hover:border-slate-400 focus:border-nasa-blue'

export function EarthReportsPage() {
  const [reportsState, setReportsState] = useState<RemoteState<ListReports>>({ status: 'loading' })
  const [linkState, setLinkState] = useState<RemoteState<SimulatorStatus>>({ status: 'loading' })
  const [filters, setFilters] = useState(initialEarthReportFilters)
  const [requestVersion, setRequestVersion] = useState(0)

  const retry = useCallback(() => {
    setReportsState({ status: 'loading' })
    setLinkState({ status: 'loading' })
    setRequestVersion((version) => version + 1)
  }, [])

  useEffect(() => {
    let isCurrent = true
    const provider = getDataProvider()

    provider.getEarthReports()
      .then((data) => {
        if (isCurrent) setReportsState({ status: 'ready', data })
      })
      .catch((error: unknown) => {
        if (isCurrent) setReportsState({ status: 'error', message: getErrorMessage(error) })
      })

    provider.getSimulatorStatus()
      .then((data) => {
        if (isCurrent) setLinkState({ status: 'ready', data })
      })
      .catch((error: unknown) => {
        if (isCurrent) setLinkState({ status: 'error', message: getErrorMessage(error) })
      })

    return () => {
      isCurrent = false
    }
  }, [requestVersion])

  const receivedReports = useMemo(
    () => reportsState.status === 'ready' ? reportsState.data.items.filter(isEarthReceived) : [],
    [reportsState],
  )
  const filteredReports = useMemo(
    () => filterEarthReports(receivedReports, filters),
    [filters, receivedReports],
  )

  if (reportsState.status === 'loading') {
    return (
      <div className="space-y-5">
        <PageHeader eyebrow="Entorno Tierra · DEMO" title="Bandeja médica" description="Consultando informes recibidos y guardados en Tierra." />
        <LoadingSkeleton rows={6} label="Cargando informes recibidos en Tierra" />
      </div>
    )
  }

  if (reportsState.status === 'error') {
    return (
      <div className="space-y-5">
        <PageHeader eyebrow="Entorno Tierra · DEMO" title="Bandeja médica" />
        <ErrorState message={reportsState.message} onRetry={retry} />
      </div>
    )
  }

  const unconfirmedCount = reportsState.data.items.length - receivedReports.length
  const pendingReviews = receivedReports.filter((report) => report.review_status === 'pending').length
  const phases = [...new Set(receivedReports.map((report) => report.phase))].sort()
  const astronauts = [...new Set(receivedReports.map((report) => report.astronaut_id))].sort()
  const reviewStatuses = [...new Set(receivedReports.map((report) => report.review_status))]
  const columns = [
    { key: 'id', header: 'Informe', render: (report: Report) => <><span className="font-mono font-semibold">{report.report_id}</span><span className="block text-xs text-muted">{report.astronaut_id}</span></> },
    { key: 'phase', header: 'Fase', render: (report: Report) => phaseLabels[report.phase] ?? report.phase },
    { key: 'created', header: 'Fechas UTC', render: (report: Report) => <div className="space-y-1"><TimeStamp value={report.created_at_utc} label="Creado en nave" /><TimeStamp value={report.communication.delivered_at_utc} label="Recibido en Tierra" /></div> },
    {
      key: 'source',
      header: 'Origen de observaciones',
      render: (report: Report) => [...new Set(report.observations.map((observation) => observation.source_kind))]
        .map((source) => sourceLabels[source] ?? source)
        .join(', ') || 'Sin datos',
    },
    { key: 'priority', header: 'Prioridad logística', render: (report: Report) => report.communication.priority },
    { key: 'review', header: 'Revisión', render: (report: Report) => report.review_status === 'reviewed' ? 'Revisado' : 'Pendiente' },
    { key: 'open', header: 'Acción', render: (report: Report) => <Link className="inline-flex min-h-11 items-center font-semibold text-nasa-blue hover:text-deep-space" to={`/medical/reports/${encodeURIComponent(report.report_id)}`}>Abrir informe</Link> },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHeader
        eyebrow="Entorno Tierra · Médico de vuelo demo"
        title="Bandeja médica"
        description="Solo informes devueltos por /earth/reports; las colas locales de nave no aparecen aquí."
        badge={
          <>
            <span className="rounded-full border border-notice/40 bg-notice/10 px-3 py-1 text-xs font-semibold text-ink">DATOS SINTÉTICOS · DEMO</span>
            {linkState.status === 'ready' && <LinkModeBadge mode={linkState.data.mode} />}
          </>
        }
      />

      <p className="rounded-control border border-line bg-card p-3 text-sm text-muted">
        El estado del simulador es logístico y no sustituye la confirmación del informe en Tierra. routine/priority no son niveles de emergencia.
      </p>

      {linkState.status === 'error' && (
        <ErrorState title="Estado del simulador no disponible" message={linkState.message} onRetry={retry} />
      )}

      <section aria-label="Resumen de informes recibidos" className="grid gap-3 sm:grid-cols-2">
        <article className="rounded-card border border-line bg-card p-4 shadow-card">
          <p className="text-sm text-muted">Informes recibidos</p>
          <p className="mt-1 text-2xl font-semibold text-ink">{receivedReports.length}</p>
        </article>
        <article className="rounded-card border border-line bg-card p-4 shadow-card">
          <p className="text-sm text-muted">Pendientes de revisión</p>
          <p className="mt-1 text-2xl font-semibold text-ink">{pendingReviews}</p>
        </article>
      </section>

      {unconfirmedCount > 0 && (
        <p role="alert" className="rounded-control border border-notice/40 bg-notice/5 p-3 text-sm text-ink">
          {unconfirmedCount} informe(s) del endpoint no tenían estado delivered y delivered_at_utc; se ocultaron hasta contar con confirmación.
        </p>
      )}

      <FilterBar
        label="Filtros de informes recibidos"
        onClear={() => setFilters(initialEarthReportFilters)}
        gridClassName="sm:grid-cols-2 lg:grid-cols-4"
      >
        <label className="text-sm font-medium text-ink">
          Fase
          <select
            className={fieldClassName}
            value={filters.phase}
            onChange={(event) => setFilters((current) => ({ ...current, phase: event.target.value }))}
          >
            <option value="all">Todas las fases</option>
            {phases.map((phase) => <option key={phase} value={phase}>{phaseLabels[phase] ?? phase}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-ink">
          Fecha de recepción (UTC)
          <input
            className={fieldClassName}
            type="date"
            value={filters.receivedDate}
            onChange={(event) => setFilters((current) => ({ ...current, receivedDate: event.target.value }))}
          />
        </label>
        <label className="text-sm font-medium text-ink">
          Astronauta
          <select
            className={fieldClassName}
            value={filters.astronautId}
            onChange={(event) => setFilters((current) => ({ ...current, astronautId: event.target.value }))}
          >
            <option value="all">Todos</option>
            {astronauts.map((astronautId) => <option key={astronautId} value={astronautId}>{astronautId}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-ink">
          Estado de revisión
          <select
            className={fieldClassName}
            value={filters.reviewStatus}
            onChange={(event) => {
              const status = reviewStatuses.find((candidate) => candidate === event.target.value)
              setFilters((current) => ({ ...current, reviewStatus: status ?? 'all' }))
            }}
          >
            <option value="all">Todos</option>
            {reviewStatuses.map((status) => (
              <option key={status} value={status}>{reviewStatusLabels[status]}</option>
            ))}
          </select>
        </label>
      </FilterBar>

      {receivedReports.length === 0 ? (
        <EmptyState
          title="Aún no hay informes recibidos desde la nave"
          description="Los informes se mostrarán después de su recepción y confirmación. Un informe en cola no aparece en Tierra."
        />
      ) : filteredReports.length === 0 ? (
        <EmptyState
          title="No hay informes que coincidan con los filtros"
          description="Cambia o limpia los filtros para volver a consultar los informes recibidos."
        />
      ) : (
        <ResponsiveDataTable
          caption="Informes confirmados en Tierra"
          columns={columns}
          rows={filteredReports}
          getRowKey={(report) => report.report_id}
          emptyTitle="Aún no hay informes recibidos"
          emptyDescription="Un informe en cola en nave no se muestra en esta bandeja."
        />
      )}
    </div>
  )
}
