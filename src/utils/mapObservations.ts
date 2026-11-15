import type { ImportDraftField, ImportDraftRow, ParsedImportRow } from './importTypes'

export interface MappingDefaults {
  phase: string
  quality: string
  activity_context: string
}

const aliases: Record<ImportDraftField, string[]> = {
  metric_code: ['metric_code', 'metric', 'code', 'metrica', 'métrica'],
  value: ['value', 'valor'],
  unit: ['unit', 'unidad'],
  observed_at_utc: ['observed_at_utc', 'observed_at', 'timestamp', 'fecha_utc', 'fecha'],
  phase: ['phase', 'fase'],
  quality: ['quality', 'calidad'],
  activity_context: ['activity_context', 'activity', 'contexto_actividad', 'actividad'],
}

function normalizeColumn(column: string) {
  return column.trim().toLowerCase().replace(/[\s-]+/g, '_')
}

function displayValue(value: unknown) {
  if (value === null || value === undefined) return ''
  return typeof value === 'string' || typeof value === 'number' ? String(value) : ''
}

function findValue(row: ParsedImportRow, field: ImportDraftField) {
  const entries = Object.entries(row.values)
  const match = entries.find(([column]) => aliases[field].includes(normalizeColumn(column)))
  return match ? displayValue(match[1]) : ''
}

export function mapObservations(rows: ParsedImportRow[], defaults: MappingDefaults): ImportDraftRow[] {
  return rows.map((row) => ({
    row: row.row,
    metric_code: findValue(row, 'metric_code'),
    value: findValue(row, 'value'),
    unit: findValue(row, 'unit'),
    observed_at_utc: findValue(row, 'observed_at_utc'),
    phase: findValue(row, 'phase') || defaults.phase,
    quality: findValue(row, 'quality') || defaults.quality,
    activity_context: findValue(row, 'activity_context') || defaults.activity_context,
    original: structuredClone(row.values),
  }))
}
