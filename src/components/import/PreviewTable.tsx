import { DataSourceBadge, QualityBadge, ResponsiveDataTable, TimeStamp } from '../ui'
import type { DataTableColumn } from '../ui'
import type { DataSourceKind, ObservationQuality } from '../../types'

export interface ImportPreviewRow {
  row: number
  metricCode: string
  metricLabel: string
  value: number | string
  unit: string
  observedAtUtc: string
  quality: ObservationQuality
  sourceKind: DataSourceKind
}

interface PreviewTableProps {
  rows: ImportPreviewRow[]
}

const columns: DataTableColumn<ImportPreviewRow>[] = [
  {
    key: 'metric',
    header: 'Métrica',
    render: (row) => (
      <div>
        <p className="font-semibold text-ink">{row.metricLabel}</p>
        <p className="mt-1 font-mono text-xs text-muted">{row.metricCode}</p>
      </div>
    ),
  },
  {
    key: 'value',
    header: 'Valor',
    render: (row) => <span className="font-semibold">{row.value} {row.unit}</span>,
  },
  {
    key: 'date',
    header: 'Fecha UTC',
    render: (row) => <TimeStamp value={row.observedAtUtc} />,
  },
  {
    key: 'source',
    header: 'Fuente',
    render: (row) => <DataSourceBadge source={row.sourceKind} />,
  },
  {
    key: 'quality',
    header: 'Calidad',
    render: (row) => <QualityBadge quality={row.quality} />,
  },
]

export function PreviewTable({ rows }: PreviewTableProps) {
  return (
    <ResponsiveDataTable
      caption="Vista previa de observaciones por importar"
      columns={columns}
      rows={rows}
      getRowKey={(row) => `${row.row}-${row.metricCode}-${row.observedAtUtc}`}
      emptyTitle="Sin filas para previsualizar"
      emptyDescription="Selecciona un escenario sintético o un archivo válido para preparar la vista previa."
    />
  )
}
