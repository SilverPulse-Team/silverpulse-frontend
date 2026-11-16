import { Eye, FlaskConical } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ObservationFilters } from '../../services'
import { getDataProvider } from '../../services'
import type { ListObservations, MetricDefinition, MissionPhase, Observation } from '../../types'
import {
  DataSourceBadge,
  ErrorState,
  FilterBar,
  LoadingSkeleton,
  MissionPhaseBadge,
  QualityBadge,
  ResponsiveDataTable,
  SecondaryButton,
  TimeStamp,
  type DataTableColumn,
} from '../ui'
import { ObservationDetails } from './ObservationDetails'

interface HistoryTableProps {
  astronautId: string
  metrics: MetricDefinition[]
}

type HistoryState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: ListObservations }

const sourceOptions = [
  { value: 'synthetic', label: 'Sintético' },
  { value: 'wearable', label: 'Wearable' },
  { value: 'clinical_assessment', label: 'Evaluación clínica' },
  { value: 'public_dataset', label: 'Dataset público' },
  { value: 'manual', label: 'Registro manual' },
  { value: 'mission_context', label: 'Contexto de misión' },
]

const phaseOptions: Array<{ value: MissionPhase; label: string }> = [
  { value: 'preflight', label: 'Pre-vuelo' },
  { value: 'inflight', label: 'Durante vuelo' },
  { value: 'postflight', label: 'Post-vuelo' },
]

const fieldClassName =
  'sp-field mt-1.5 w-full rounded-control border border-line bg-card px-3 text-sm text-ink transition-colors hover:border-slate-400 focus:border-nasa-blue'

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'No fue posible consultar el historial de observaciones.'
}

function sourceSummary(observation: Observation) {
  return [observation.source_id, observation.device_model].filter(Boolean).join(' · ')
}

export function HistoryTable({ astronautId, metrics }: HistoryTableProps) {
  const [astronautFilter, setAstronautFilter] = useState(astronautId)
  const [metricFilter, setMetricFilter] = useState('all')
  const [phaseFilter, setPhaseFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [limit, setLimit] = useState(10)
  const [offset, setOffset] = useState(0)
  const [requestVersion, setRequestVersion] = useState(0)
  const [state, setState] = useState<HistoryState>({ status: 'loading' })
  const [selectedObservation, setSelectedObservation] = useState<Observation | null>(null)

  const filters = useMemo<ObservationFilters>(() => ({
    astronaut_id: astronautFilter === 'all' ? undefined : astronautFilter,
    metric_code: metricFilter === 'all' ? undefined : metricFilter,
    phase: phaseFilter === 'all' ? undefined : phaseFilter,
    source_kind: sourceFilter === 'all' ? undefined : sourceFilter,
    limit,
    offset,
  }), [astronautFilter, limit, metricFilter, offset, phaseFilter, sourceFilter])

  const retry = useCallback(() => {
    setState({ status: 'loading' })
    setRequestVersion((current) => current + 1)
  }, [])

  const resetFilters = useCallback(() => {
    setState({ status: 'loading' })
    setAstronautFilter(astronautId)
    setMetricFilter('all')
    setPhaseFilter('all')
    setSourceFilter('all')
    setOffset(0)
  }, [astronautId])

  const closeDetails = useCallback(() => setSelectedObservation(null), [])

  useEffect(() => {
    let current = true

    getDataProvider()
      .getShipObservations(filters)
      .then((data) => {
        if (current) setState({ status: 'ready', data })
      })
      .catch((error: unknown) => {
        if (current) setState({ status: 'error', message: getErrorMessage(error) })
      })

    return () => {
      current = false
    }
  }, [filters, requestVersion])

  const updateFilter = (setter: (value: string) => void, value: string) => {
    setState({ status: 'loading' })
    setOffset(0)
    setter(value)
  }

  const metricLabels = useMemo(
    () => new Map(metrics.map((metric) => [metric.code, metric.label])),
    [metrics],
  )

  const columns = useMemo<DataTableColumn<Observation>[]>(() => [
    {
      key: 'observed_at',
      header: 'Fecha UTC',
      render: (row) => <TimeStamp value={row.observed_at_utc} label="Observada" />,
    },
    { key: 'metric', header: 'Métrica', render: (row) => metricLabels.get(row.metric_code) ?? row.metric_code },
    { key: 'value', header: 'Valor', render: (row) => <span className="font-semibold">{row.value}</span> },
    { key: 'unit', header: 'Unidad', render: (row) => row.unit },
    {
      key: 'source',
      header: 'Fuente',
      render: (row) => (
        <div className="space-y-2">
          <DataSourceBadge source={row.source_kind} />
          {row.is_synthetic && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-notice">
              <FlaskConical aria-hidden="true" className="size-3.5" /> Sintético · DEMO
            </span>
          )}
        </div>
      ),
    },
    { key: 'activity', header: 'Actividad', render: (row) => row.activity_context ?? 'No informada' },
    { key: 'phase', header: 'Fase', render: (row) => <MissionPhaseBadge phase={row.phase} /> },
    { key: 'quality', header: 'Calidad', render: (row) => <QualityBadge quality={row.quality} /> },
    { key: 'origin', header: 'Síntesis de origen', render: (row) => sourceSummary(row) },
    {
      key: 'detail',
      header: 'Detalle',
      render: (row) => (
        <button
          type="button"
          onClick={() => setSelectedObservation(row)}
          className="inline-flex min-h-11 items-center gap-2 rounded-control px-3 text-sm font-semibold text-nasa-blue hover:bg-data/10"
          aria-label={`Abrir detalle de ${row.id}`}
        >
          <Eye aria-hidden="true" className="size-4" /> Abrir
        </button>
      ),
    },
  ], [metricLabels])

  const data = state.status === 'ready' ? state.data : null
  const firstVisible = data && data.total > 0 ? data.offset + 1 : 0
  const lastVisible = data ? Math.min(data.offset + data.items.length, data.total) : 0
  const hasPrevious = Boolean(data && data.offset > 0)
  const hasNext = Boolean(data && data.offset + data.limit < data.total)

  return (
    <section aria-labelledby="observation-history-title" className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-nasa-blue">Trazabilidad local</p>
        <h2 id="observation-history-title" className="mt-1 text-xl font-semibold text-ink">Historial de observaciones</h2>
        <p className="mt-1 text-sm leading-6 text-muted">Registros normalizados recibidos por la API; no representan archivos fuente ni señales crudas.</p>
      </div>

      <FilterBar label="Filtros del historial" onClear={resetFilters}>
        <label className="text-sm font-medium text-ink">
          Astronauta
          <select className={fieldClassName} value={astronautFilter} onChange={(event) => updateFilter(setAstronautFilter, event.target.value)}>
            <option value="all">Todos</option>
            <option value={astronautId}>{astronautId}</option>
          </select>
        </label>
        <label className="text-sm font-medium text-ink">
          Métrica
          <select className={fieldClassName} value={metricFilter} onChange={(event) => updateFilter(setMetricFilter, event.target.value)}>
            <option value="all">Todas</option>
            {metrics.map((metric) => <option key={metric.code} value={metric.code}>{metric.label}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-ink">
          Fase
          <select className={fieldClassName} value={phaseFilter} onChange={(event) => updateFilter(setPhaseFilter, event.target.value)}>
            <option value="all">Todas</option>
            {phaseOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-ink">
          Fuente
          <select className={fieldClassName} value={sourceFilter} onChange={(event) => updateFilter(setSourceFilter, event.target.value)}>
            <option value="all">Todas</option>
            {sourceOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      </FilterBar>

      {state.status === 'loading' && <LoadingSkeleton rows={5} label="Cargando historial de observaciones" />}
      {state.status === 'error' && <ErrorState message={state.message} onRetry={retry} />}
      {data && (
        <>
          <ResponsiveDataTable
            caption="Historial paginado de observaciones"
            columns={columns}
            rows={data.items}
            getRowKey={(row) => row.id}
            emptyTitle="Sin resultados"
            emptyDescription="No existen observaciones para los filtros seleccionados."
          />

          <div className="flex flex-col gap-3 rounded-card border border-line bg-card p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted" aria-live="polite">
              Mostrando {firstVisible}–{lastVisible} de {data.total} · límite {data.limit} · desplazamiento {data.offset}
            </p>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
              <label className="col-span-2 flex items-center justify-between text-sm font-medium text-ink sm:col-span-1 sm:justify-start">
                Por página
                <select
                  className="sp-field ml-2 w-20 rounded-control border border-line bg-card px-3 text-sm transition-colors hover:border-slate-400 focus:border-nasa-blue"
                  value={limit}
                  onChange={(event) => {
                    setState({ status: 'loading' })
                    setLimit(Number(event.target.value))
                    setOffset(0)
                  }}
                >
                  <option value={1}>1</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                </select>
              </label>
              <SecondaryButton
                type="button"
                className="w-full sm:w-auto"
                disabled={!hasPrevious}
                onClick={() => {
                  setState({ status: 'loading' })
                  setOffset(Math.max(0, data.offset - data.limit))
                }}
              >
                Anterior
              </SecondaryButton>
              <SecondaryButton
                type="button"
                className="w-full sm:w-auto"
                disabled={!hasNext}
                onClick={() => {
                  setState({ status: 'loading' })
                  setOffset(data.offset + data.limit)
                }}
              >
                Siguiente
              </SecondaryButton>
            </div>
          </div>
        </>
      )}

      <ObservationDetails observation={selectedObservation} onClose={closeDetails} />
    </section>
  )
}
