import { CalendarRange, CircleDot, Database, Info, Ruler, UsersRound } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { LongitudinalTrendChart } from '../components/charts/LongitudinalTrendChart'
import { filterTrendPoints } from '../components/charts/trendFilters'
import { PageHeader } from '../components/layout/PageHeader'
import { HistoryTable } from '../components/observations/HistoryTable'
import {
  AlertNotice,
  ChartPanel,
  EmptyState,
  ErrorState,
  FilterBar,
  LoadingSkeleton,
  MissionPhaseBadge,
} from '../components/ui'
import { getDataProvider } from '../services'
import type { Astronaut, MetricDefinition, MissionPhase, TrendPoint, TrendSeries } from '../types'

interface TrendsContext {
  astronaut: Astronaut
  metrics: MetricDefinition[]
}

type LoadState<T> =
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: T }

type PhaseFilter = MissionPhase | 'all'

const fieldClassName =
  'mt-1.5 min-h-11 w-full rounded-control border border-line bg-card px-3 text-sm text-ink focus:border-nasa-blue'

const phaseOptions: Array<{ value: PhaseFilter; label: string }> = [
  { value: 'preflight', label: 'Pre-vuelo' },
  { value: 'inflight', label: 'Durante vuelo' },
  { value: 'postflight', label: 'Post-vuelo' },
  { value: 'all', label: 'Comparar fases' },
]

const phaseLabels: Record<string, string> = {
  preflight: 'Pre-vuelo',
  inflight: 'Durante vuelo',
  postflight: 'Post-vuelo',
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'No fue posible consultar la serie longitudinal.'
}

function unique(values: string[]) {
  return [...new Set(values)]
}

function dateInputValue(timestamp: string) {
  const date = new Date(timestamp)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
}

function availableDateRange(points: TrendPoint[]) {
  const dates = points
    .map((point) => dateInputValue(point.observed_at_utc))
    .filter((date) => date.length > 0)
    .sort()

  return dates.length > 0 ? { min: dates[0], max: dates[dates.length - 1] } : null
}

function monthYear(timestamp: string) {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return 'un periodo no informado'
  return new Intl.DateTimeFormat('es-CR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date)
}

export function TrendsPage() {
  const [contextState, setContextState] = useState<LoadState<TrendsContext>>({ status: 'loading' })
  const [contextVersion, setContextVersion] = useState(0)
  const [metricCode, setMetricCode] = useState('heart_rate')
  const [seriesState, setSeriesState] = useState<LoadState<TrendSeries>>({ status: 'loading' })
  const [seriesVersion, setSeriesVersion] = useState(0)
  const [phase, setPhase] = useState<PhaseFilter>('inflight')
  const [source, setSource] = useState('all')
  const [quality, setQuality] = useState('all')
  const [context, setContext] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const retryContext = useCallback(() => {
    setContextState({ status: 'loading' })
    setSeriesState({ status: 'loading' })
    setContextVersion((current) => current + 1)
  }, [])

  const retrySeries = useCallback(() => {
    setSeriesState({ status: 'loading' })
    setSeriesVersion((current) => current + 1)
  }, [])

  const resetFilters = useCallback(() => {
    setPhase('inflight')
    setSource('all')
    setQuality('all')
    setContext('all')
    setDateFrom('')
    setDateTo('')
  }, [])

  useEffect(() => {
    let current = true
    const provider = getDataProvider()

    Promise.all([provider.getShipAstronauts(), provider.getMetricCatalog()])
      .then(([astronauts, metrics]) => {
        if (!current) return
        const astronaut = astronauts[0]
        if (!astronaut || metrics.length === 0) {
          setContextState({ status: 'empty' })
          return
        }

        setContextState({ status: 'ready', data: { astronaut, metrics } })
        setMetricCode((currentMetric) =>
          metrics.some((metric) => metric.code === currentMetric) ? currentMetric : metrics[0].code,
        )
      })
      .catch((error: unknown) => {
        if (current) setContextState({ status: 'error', message: errorMessage(error) })
      })

    return () => {
      current = false
    }
  }, [contextVersion])

  const astronautId = contextState.status === 'ready' ? contextState.data.astronaut.id : null

  useEffect(() => {
    if (!astronautId) return
    let current = true

    getDataProvider()
      .getShipTrends(astronautId, metricCode)
      .then((series) => {
        if (current) setSeriesState(series.points.length === 0 && !series.baseline ? { status: 'empty' } : { status: 'ready', data: series })
      })
      .catch((error: unknown) => {
        if (current) setSeriesState({ status: 'error', message: errorMessage(error) })
      })

    return () => {
      current = false
    }
  }, [astronautId, metricCode, seriesVersion])

  const series = seriesState.status === 'ready' ? seriesState.data : null
  const sources = useMemo(() => unique(series?.points.map((point) => point.source_kind) ?? []), [series])
  const qualities = useMemo(() => unique(series?.points.map((point) => point.quality) ?? []), [series])
  const contexts = series?.baseline?.activity_context ? [series.baseline.activity_context] : []
  const dateRange = useMemo(() => availableDateRange(series?.points ?? []), [series])

  const filteredPoints = useMemo(() => {
    if (!series) return []

    return filterTrendPoints(series.points, {
      phase,
      source,
      quality,
      activityContext: context,
      dateFrom,
      dateTo,
    })
  }, [context, dateFrom, dateTo, phase, quality, series, source])

  if (contextState.status === 'loading') {
    return <LoadingSkeleton rows={7} label="Cargando catálogo y contexto de tendencias" />
  }

  if (contextState.status === 'error') {
    return <ErrorState message={contextState.message} onRetry={retryContext} />
  }

  if (contextState.status === 'empty') {
    return <EmptyState title="Sin series disponibles" description="No hay astronauta o catálogo de métricas para consultar tendencias." />
  }

  const selectedMetric = contextState.data.metrics.find((metric) => metric.code === metricCode)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Entorno nave · Analítica descriptiva"
        title="Tendencias fisiológicas"
        description={`${contextState.data.astronaut.display_name} · ${contextState.data.astronaut.id}. Las comparaciones no constituyen diagnóstico.`}
        badge={<span className="rounded-full border border-notice/30 bg-notice/10 px-3 py-1 text-xs font-semibold text-ink">DATOS SINTÉTICOS · DEMO</span>}
      />

      <div className="flex flex-wrap gap-2" role="group" aria-label="Seleccionar fase de misión">
        {phaseOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={phase === option.value}
            onClick={() => setPhase(option.value)}
            className={`min-h-11 rounded-control border px-4 text-sm font-semibold transition-colors ${
              phase === option.value
                ? 'border-nasa-blue bg-nasa-blue text-white'
                : 'border-line bg-card text-ink hover:border-nasa-blue hover:text-nasa-blue'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <FilterBar label="Filtros de la serie" onClear={resetFilters}>
        <label className="text-sm font-medium text-ink">
          Métrica
          <select
            className={fieldClassName}
            value={metricCode}
            onChange={(event) => {
              setSeriesState({ status: 'loading' })
              setMetricCode(event.target.value)
              resetFilters()
            }}
          >
            {contextState.data.metrics.map((metric) => <option key={metric.code} value={metric.code}>{metric.label}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-ink">
          Origen
          <select className={fieldClassName} value={source} onChange={(event) => setSource(event.target.value)}>
            <option value="all">Todos los orígenes</option>
            {sources.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-ink">
          Calidad
          <select className={fieldClassName} value={quality} onChange={(event) => setQuality(event.target.value)}>
            <option value="all">Todas las calidades</option>
            {qualities.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-ink">
          Contexto de actividad
          <select className={fieldClassName} value={context} onChange={(event) => setContext(event.target.value)}>
            <option value="all">Sin exigir contexto</option>
            {contexts.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-ink">
          Desde (UTC)
          <input
            className={fieldClassName}
            type="date"
            value={dateFrom}
            min={dateRange?.min}
            max={dateTo || dateRange?.max}
            onChange={(event) => setDateFrom(event.target.value)}
          />
        </label>
        <label className="text-sm font-medium text-ink">
          Hasta (UTC)
          <input
            className={fieldClassName}
            type="date"
            value={dateTo}
            min={dateFrom || dateRange?.min}
            max={dateRange?.max}
            onChange={(event) => setDateTo(event.target.value)}
          />
        </label>
      </FilterBar>

      {dateRange && (
        <p className="flex items-center gap-2 text-sm text-muted">
          <CalendarRange aria-hidden="true" className="size-4 text-data" />
          Rango disponible: {dateRange.min} – {dateRange.max} UTC
        </p>
      )}

      {seriesState.status === 'loading' && <LoadingSkeleton rows={6} label="Cargando serie longitudinal" />}
      {seriesState.status === 'error' && <ErrorState message={seriesState.message} onRetry={retrySeries} />}
      {seriesState.status === 'empty' && (
        <EmptyState title="Sin datos para esta métrica" description="No existe una serie ni una referencia disponible. No se generó una curva de reemplazo." />
      )}

      {series && (
        <>
          <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
            <ChartPanel
              title={`${selectedMetric?.label ?? series.metric_code} (${series.unit})`}
              description={`${filteredPoints.length} de ${series.points.length} observaciones visibles. Eje temporal en UTC.`}
              empty={filteredPoints.length === 0}
              emptyMessage={
                context !== 'all'
                  ? 'TrendSeries no informa el contexto por punto. Se excluyeron las observaciones para no asumir comparabilidad.'
                  : 'No existen observaciones para la combinación de filtros seleccionada.'
              }
              footer={
                <p className="text-sm text-muted">
                  {filteredPoints.length === 1
                    ? 'Una sola observación no constituye una tendencia ni demuestra persistencia.'
                    : `${filteredPoints.length} observaciones visibles; no se interpolan periodos vacíos.`}
                </p>
              }
            >
              <LongitudinalTrendChart points={filteredPoints} baseline={series.baseline} unit={series.unit} />
            </ChartPanel>

            <aside className="space-y-4" aria-label="Interpretación y limitaciones">
              <AlertNotice title="Interpretación descriptiva">
                {series.summary}. Los datos y la referencia solo deben compararse cuando fase, método y contexto sean compatibles.
              </AlertNotice>
              <AlertNotice title="Limitaciones" tone="notice">
                <ul className="list-disc space-y-2 pl-5">
                  {series.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}
                  <li>El backend no informa contexto de actividad para cada punto de TrendSeries.</li>
                </ul>
              </AlertNotice>
            </aside>
          </div>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumen de evidencia">
            <SummaryCard icon={CircleDot} label="Valor observado" value={filteredPoints.length === 1 ? `${filteredPoints[0].value} ${series.unit}` : `${filteredPoints.length} registros`} detail={`${filteredPoints.length} observaciones visibles`} />
            <SummaryCard
              icon={Ruler}
              label="Referencia individual"
              value={series.baseline?.median !== null && series.baseline?.median !== undefined ? `${series.baseline.median} ${series.baseline.unit}` : 'Sin referencia'}
              detail={series.baseline ? `Mediana demo · n=${series.baseline.n}` : 'El backend no devolvió baseline'}
            />
            <SummaryCard icon={Database} label="Cobertura de evidencia" value={`${series.points.length} observación${series.points.length === 1 ? '' : 'es'}`} detail="Sin interpolación ni puntos inventados" />
            <SummaryCard icon={UsersRound} label="Contexto comparable" value={series.baseline?.activity_context ?? 'No informado'} detail="El contexto solo está disponible en el baseline" />
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-card border border-line bg-card p-5 shadow-card">
              <h2 className="text-base font-semibold text-ink">Baseline pre-vuelo · DEMO</h2>
              {series.baseline ? (
                <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <Definition label="Mediana" value={`${series.baseline.median ?? 'Sin dato'} ${series.baseline.unit}`} />
                  <Definition label="Muestra" value={`n=${series.baseline.n}`} />
                  <Definition label="Fase" value={phaseLabels[series.baseline.phase] ?? series.baseline.phase} />
                  <Definition label="Contexto" value={series.baseline.activity_context ?? 'No informado'} />
                  <Definition label="Inicio UTC" value={dateInputValue(series.baseline.period_start_utc) || 'No informado'} />
                  <Definition label="Fin UTC" value={dateInputValue(series.baseline.period_end_utc) || 'No informado'} />
                </dl>
              ) : (
                <p className="mt-3 text-sm text-muted">Referencia ausente: el backend no devolvió baseline para esta serie.</p>
              )}
            </div>

            <div className="rounded-card border border-line bg-card p-5 shadow-card">
              <h2 className="text-base font-semibold text-ink">Periodos sin datos</h2>
              <ul className="mt-4 space-y-3 text-sm text-muted">
                {(['preflight', 'inflight', 'postflight'] as MissionPhase[]).map((missionPhase) => {
                  const count = series.points.filter((point) => point.phase === missionPhase).length
                  return (
                    <li key={missionPhase} className="flex items-center justify-between gap-3 border-b border-line pb-3 last:border-0 last:pb-0">
                      <MissionPhaseBadge phase={missionPhase} />
                      <span>{count === 0 ? 'Sin observaciones' : `${count} observación${count === 1 ? '' : 'es'}`}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          </section>

          <AlertNotice title="Alcance de la comparación">
            <span className="inline-flex items-start gap-2">
              <Info aria-hidden="true" className="mt-1 size-4 shrink-0" />
              {series.baseline
                ? `El baseline corresponde a ${monthYear(series.baseline.period_start_utc)} en contexto ${series.baseline.activity_context ?? 'no informado'}; los puntos no incluyen contexto en la respuesta de tendencias.`
                : 'No existe una referencia individual para esta serie; los puntos no incluyen contexto en la respuesta de tendencias.'}
            </span>
          </AlertNotice>
        </>
      )}

      <HistoryTable
        astronautId={contextState.data.astronaut.id}
        metrics={contextState.data.metrics}
      />
    </div>
  )
}

function SummaryCard({ icon: Icon, label, value, detail }: { icon: typeof CalendarRange; label: string; value: string; detail: string }) {
  return (
    <article className="rounded-card border border-line bg-card p-5 shadow-card">
      <span className="grid size-9 place-items-center rounded-control bg-data/10 text-data"><Icon aria-hidden="true" className="size-4" /></span>
      <p className="mt-4 text-sm font-medium text-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold text-ink">{value}</p>
      <p className="mt-2 text-sm leading-5 text-muted">{detail}</p>
    </article>
  )
}

function Definition({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-muted">{label}</dt><dd className="mt-1 font-medium text-ink">{value}</dd></div>
}
