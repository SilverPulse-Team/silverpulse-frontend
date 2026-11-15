import type {
  DataSource,
  DataSourceKind,
  ImportRequest,
  MetricDefinition,
  MissionPhase,
  ObservationInput,
  ObservationQuality,
} from '../types'
import type { ImportDraftField, ImportDraftRow, ImportRowError, ImportValidationResult } from './importTypes'

const phases = new Set<MissionPhase>(['preflight', 'inflight', 'postflight'])
const qualities = new Set<ObservationQuality>(['adequate', 'low', 'unknown', 'not_applicable'])
const isoDateTime = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(?:Z|[+-](\d{2}):(\d{2}))$/

function rowError(row: number, field: ImportDraftField, code: string, detail: string): ImportRowError {
  return { row, field, code, detail }
}

function requiredErrors(row: ImportDraftRow): ImportRowError[] {
  const labels: Record<Exclude<ImportDraftField, 'activity_context'>, string> = {
    metric_code: 'metric_code',
    value: 'value',
    unit: 'unit',
    observed_at_utc: 'observed_at_utc',
    phase: 'phase',
    quality: 'quality',
  }

  return Object.entries(labels).flatMap(([field, label]) => (
    row[field as keyof typeof labels].trim().length === 0
      ? [rowError(row.row, field as keyof typeof labels, 'REQUIRED', `Falta el campo requerido ${label}.`)]
      : []
  ))
}

function valueForContract(value: string): number | string {
  const trimmed = value.trim()
  if (/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(trimmed)) return Number(trimmed)
  return trimmed
}

function isValidIsoDateTime(value: string) {
  const match = isoDateTime.exec(value)
  if (!match) return false

  const [, yearText, monthText, dayText, hourText, minuteText, secondText = '0', offsetHourText = '0', offsetMinuteText = '0'] = match
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)
  const hour = Number(hourText)
  const minute = Number(minuteText)
  const second = Number(secondText)
  const offsetHour = Number(offsetHourText)
  const offsetMinute = Number(offsetMinuteText)
  const daysInMonth = month >= 1 && month <= 12
    ? new Date(Date.UTC(year, month, 0)).getUTCDate()
    : 0

  return month >= 1
    && month <= 12
    && day >= 1
    && day <= daysInMonth
    && hour <= 23
    && minute <= 59
    && second <= 59
    && offsetHour <= 23
    && offsetMinute <= 59
    && !Number.isNaN(Date.parse(value))
}

export function validateImportRows(
  rows: ImportDraftRow[],
  metrics: MetricDefinition[],
  sourceKind: DataSourceKind,
): ImportValidationResult {
  const validRows: ImportValidationResult['validRows'] = []
  const errors: ImportRowError[] = []

  rows.forEach((row) => {
    const currentErrors = requiredErrors(row)
    const metric = metrics.find((candidate) => candidate.code === row.metric_code.trim())

    if (row.metric_code.trim() && !metric) {
      currentErrors.push(rowError(
        row.row,
        'metric_code',
        'UNSUPPORTED_METRIC',
        `La métrica "${row.metric_code}" no existe en el catálogo; no se deducirá otro indicador.`,
      ))
    }

    if (metric && row.unit.trim() && row.unit.trim() !== metric.unit) {
      currentErrors.push(rowError(
        row.row,
        'unit',
        'UNSUPPORTED_UNIT',
        `La unidad "${row.unit}" no coincide con ${metric.code}; se esperaba "${metric.unit}".`,
      ))
    }

    if (metric && !metric.supported_source_kinds.includes(sourceKind)) {
      currentErrors.push(rowError(
        row.row,
        'metric_code',
        'UNSUPPORTED_SOURCE',
        `${metric.code} no admite la fuente ${sourceKind} según el catálogo.`,
      ))
    }

    if (row.observed_at_utc.trim() && !isValidIsoDateTime(row.observed_at_utc.trim())) {
      currentErrors.push(rowError(
        row.row,
        'observed_at_utc',
        'INVALID_DATE',
        'La fecha debe usar ISO 8601 con zona UTC u offset explícito.',
      ))
    }

    if (row.phase.trim() && !phases.has(row.phase.trim() as MissionPhase)) {
      currentErrors.push(rowError(row.row, 'phase', 'INVALID_PHASE', `La fase "${row.phase}" no está permitida.`))
    }

    if (row.quality.trim() && !qualities.has(row.quality.trim() as ObservationQuality)) {
      currentErrors.push(rowError(row.row, 'quality', 'INVALID_QUALITY', `La calidad "${row.quality}" no está permitida.`))
    }

    if (currentErrors.length > 0 || !metric) {
      errors.push(...currentErrors)
      return
    }

    const observation: ObservationInput = {
      metric_code: metric.code,
      value: valueForContract(row.value),
      unit: metric.unit,
      observed_at_utc: row.observed_at_utc.trim(),
      phase: row.phase.trim() as MissionPhase,
      quality: row.quality.trim() as ObservationQuality,
      activity_context: row.activity_context.trim() || null,
      context: {
        import_row: row.row,
        original_record: structuredClone(row.original),
      },
    }
    validRows.push({ row: row.row, observation })
  })

  return { validRows, errors }
}

export function buildImportRequest(options: {
  astronautId: string
  source: DataSource
  rows: ImportDraftRow[]
  metrics: MetricDefinition[]
}): { request: ImportRequest | null; validation: ImportValidationResult } {
  const validation = validateImportRows(options.rows, options.metrics, options.source.kind)
  if (validation.errors.length > 0 || validation.validRows.length !== options.rows.length) {
    return { request: null, validation }
  }

  return {
    request: {
      astronaut_id: options.astronautId,
      source: options.source,
      observations: validation.validRows.map((row) => row.observation),
    },
    validation,
  }
}
