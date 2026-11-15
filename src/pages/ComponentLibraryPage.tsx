import { useState } from 'react'
import {
  AlertNotice,
  ChartPanel,
  ConfirmationModal,
  DataSourceBadge,
  EmptyState,
  ErrorState,
  EvidenceCoverageCard,
  FilterBar,
  LoadingSkeleton,
  MetricCard,
  MissionPhaseBadge,
  PrimaryButton,
  QualityBadge,
  ReportTimeline,
  ResponsiveDataTable,
  SecondaryButton,
  SyncStatusBadge,
  TimeStamp,
  type DataQuality,
  type DataSourceKind,
  type DataTableColumn,
  type MissionPhase,
} from '../components/ui'

interface ObservationRow {
  id: string
  metric: string
  value: number
  unit: string
  observedAt: string
  source: DataSourceKind
  quality: DataQuality
  phase: MissionPhase
}

const observations: ObservationRow[] = [
  {
    id: 'OBS-0001',
    metric: 'Frecuencia cardíaca',
    value: 71,
    unit: 'bpm',
    observedAt: '2026-11-14T15:00:00Z',
    source: 'synthetic',
    quality: 'adequate',
    phase: 'in_flight',
  },
  {
    id: 'OBS-0002',
    metric: 'Duración de sueño',
    value: 372,
    unit: 'min',
    observedAt: '2026-11-14T06:00:00Z',
    source: 'synthetic',
    quality: 'unknown',
    phase: 'in_flight',
  },
]

const observationColumns: DataTableColumn<ObservationRow>[] = [
  { key: 'metric', header: 'Métrica', render: (row) => <span className="font-medium">{row.metric}</span> },
  { key: 'value', header: 'Valor', render: (row) => <span>{row.value} {row.unit}</span> },
  { key: 'date', header: 'Observada', render: (row) => <TimeStamp value={row.observedAt} label="UTC" /> },
  { key: 'source', header: 'Fuente', render: (row) => <DataSourceBadge source={row.source} /> },
  { key: 'quality', header: 'Calidad', render: (row) => <QualityBadge quality={row.quality} /> },
  { key: 'phase', header: 'Fase', render: (row) => <MissionPhaseBadge phase={row.phase} /> },
]

const fieldClassName =
  'min-h-11 w-full rounded-control border border-line bg-card px-3 text-sm text-ink focus:border-nasa-blue'

export function ComponentLibraryPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="space-y-8">
      <section aria-labelledby="metric-components-title">
        <SectionHeading
          id="metric-components-title"
          eyebrow="Componentes de datos"
          title="Observaciones con contexto completo"
          description="Cada valor conserva unidad, fuente, calidad, fase y fecha. Los valores nulos se abstienen de inventar una medición."
        />
        <div className="mt-4 grid gap-4 xl:grid-cols-3">
          <MetricCard
            label="Frecuencia cardíaca"
            value={71}
            unit="bpm"
            source="synthetic"
            quality="adequate"
            phase="in_flight"
            observedAt="2026-11-14T15:00:00Z"
            helperText="Una observación no demuestra una tendencia."
          />
          <MetricCard
            label="Sueño"
            value={372}
            unit="min"
            source="synthetic"
            quality="unknown"
            phase="in_flight"
            observedAt="2026-11-14T06:00:00Z"
            helperText="6 h 12 min · Bajo referencia personal."
          />
          <MetricCard label="Fuerza muscular" value={null} helperText="No se recibió una prueba comparable." />
        </div>
      </section>

      <section aria-labelledby="badge-components-title" className="rounded-card border border-line bg-card p-5 shadow-card">
        <SectionHeading id="badge-components-title" title="Badges semánticos" description="Texto e icono acompañan siempre al color." compact />
        <div className="mt-4 flex flex-wrap gap-2">
          <QualityBadge quality="adequate" />
          <QualityBadge quality="unknown" />
          <QualityBadge quality="not_applicable" />
          <DataSourceBadge source="synthetic" />
          <MissionPhaseBadge phase="in_flight" />
          <SyncStatusBadge status="queued" />
          <SyncStatusBadge status="delivered_earth" />
          <SyncStatusBadge status="reviewed" />
        </div>
      </section>

      <section aria-labelledby="filter-components-title">
        <SectionHeading id="filter-components-title" eyebrow="Componentes operativos" title="Filtros y tabla responsive" />
        <div className="mt-4 space-y-4">
          <FilterBar onClear={() => undefined}>
            <label className="text-sm font-medium text-ink">
              Métrica
              <select className={`${fieldClassName} mt-1.5`} defaultValue="all">
                <option value="all">Todas</option>
                <option value="heart_rate">Frecuencia cardíaca</option>
                <option value="sleep">Sueño</option>
              </select>
            </label>
            <label className="text-sm font-medium text-ink">
              Fase
              <select className={`${fieldClassName} mt-1.5`} defaultValue="in_flight">
                <option value="all">Todas</option>
                <option value="in_flight">Durante vuelo</option>
              </select>
            </label>
            <label className="text-sm font-medium text-ink">
              Calidad
              <select className={`${fieldClassName} mt-1.5`} defaultValue="all">
                <option value="all">Todas</option>
                <option value="adequate">Adecuada</option>
                <option value="unknown">Desconocida</option>
              </select>
            </label>
            <label className="text-sm font-medium text-ink">
              Fuente
              <select className={`${fieldClassName} mt-1.5`} defaultValue="synthetic">
                <option value="all">Todas</option>
                <option value="synthetic">Sintético</option>
              </select>
            </label>
          </FilterBar>

          <ResponsiveDataTable
            caption="Observaciones de demostración"
            columns={observationColumns}
            rows={observations}
            getRowKey={(row) => row.id}
          />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2" aria-label="Gráfica y cobertura de evidencia">
        <ChartPanel
          title="Tendencia de frecuencia cardíaca"
          description="La gráfica se abstiene cuando la evidencia no permite una serie temporal."
          empty
          emptyMessage="Solo existe una observación. Datos insuficientes para una tendencia."
        />
        <EvidenceCoverageCard
          domain="Musculoesquelético"
          status="insufficient"
          available={['Actividad registrada']}
          missing={['Prueba de fuerza muscular', 'Densidad ósea']}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-2" aria-label="Timeline y avisos">
        <div className="rounded-card border border-line bg-card p-5 shadow-card">
          <h2 className="text-base font-semibold text-ink">Timeline de informe</h2>
          <div className="mt-5">
            <ReportTimeline
              events={[
                { id: 'generated', label: 'Generado localmente', status: 'complete', timestamp: '2026-11-14T15:10:00Z' },
                { id: 'queued', label: 'En cola para sincronización', status: 'current', timestamp: '2026-11-14T15:11:00Z' },
                { id: 'delivered', label: 'Entregado a Tierra', status: 'pending' },
                { id: 'reviewed', label: 'Revisado', status: 'pending' },
              ]}
            />
          </div>
        </div>
        <div className="space-y-4">
          <AlertNotice title="Interpretación descriptiva">
            Una sola observación no demuestra persistencia ni constituye un diagnóstico.
          </AlertNotice>
          <AlertNotice title="Revisión sugerida" tone="notice">
            Falta una prueba de fuerza comparable. Este aviso no representa una emergencia clínica.
          </AlertNotice>
        </div>
      </section>

      <section aria-labelledby="state-components-title">
        <SectionHeading
          id="state-components-title"
          eyebrow="Estados reutilizables"
          title="Vacío, carga, error y confirmación"
          description="Los estados pueden representarse sin una API operativa."
        />
        <div className="mt-4 grid gap-4 xl:grid-cols-3">
          <EmptyState title="Sin mensajes recibidos" description="Los mensajes aparecerán después de su recepción y confirmación." />
          <LoadingSkeleton rows={3} label="Cargando observaciones de demostración" />
          <ErrorState message="Verifica la conexión e intenta nuevamente. No se perdieron datos locales." onRetry={() => undefined} />
        </div>
        <div className="mt-4 flex flex-wrap gap-3 rounded-card border border-line bg-card p-5 shadow-card">
          <PrimaryButton type="button" onClick={() => setIsModalOpen(true)}>Abrir confirmación</PrimaryButton>
          <SecondaryButton type="button">Acción secundaria</SecondaryButton>
          <PrimaryButton type="button" isSubmitting>Registrando</PrimaryButton>
        </div>
      </section>

      <ConfirmationModal
        open={isModalOpen}
        title="Confirmar registro demo"
        description="Esta confirmación demuestra el patrón visual; no enviará información ni ejecutará una solicitud HTTP."
        confirmLabel="Confirmar demo"
        onConfirm={() => setIsModalOpen(false)}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}

interface SectionHeadingProps {
  id: string
  title: string
  eyebrow?: string
  description?: string
  compact?: boolean
}

function SectionHeading({ id, title, eyebrow, description, compact = false }: SectionHeadingProps) {
  return (
    <div>
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.14em] text-nasa-blue">{eyebrow}</p>}
      <h2 id={id} className={`${eyebrow ? 'mt-1' : ''} ${compact ? 'text-base' : 'text-xl'} font-semibold text-ink`}>
        {title}
      </h2>
      {description && <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">{description}</p>}
    </div>
  )
}
