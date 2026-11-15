import type {
  Astronaut,
  Baseline,
  CountermeasurePlan,
  ImportResult,
  ListObservations,
  ListReports,
  MetricDefinition,
  Observation,
  Overview,
  Readiness,
  Report,
  SimulatorMetrics,
  SimulatorStatus,
  TrendSeries,
} from '../types'
import type {
  HealthStatus,
  MedicalReviewResult,
  ResearchSource,
  ShipInbox,
} from './dataProvider'
import type { ResponseParser } from './apiClient'

type Validator = (value: unknown, path: string) => void
type Fields = Record<string, { validator: Validator; optional?: boolean }>

function fail(path: string, expected: string): never {
  throw new TypeError(`${path} debe ser ${expected}.`)
}

const stringValue: Validator = (value, path) => {
  if (typeof value !== 'string') fail(path, 'string')
}

const numberValue: Validator = (value, path) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) fail(path, 'number finito')
}

const integerValue: Validator = (value, path) => {
  numberValue(value, path)
  if (!Number.isInteger(value)) fail(path, 'entero')
}

const booleanValue: Validator = (value, path) => {
  if (typeof value !== 'boolean') fail(path, 'boolean')
}

const nullValue: Validator = (value, path) => {
  if (value !== null) fail(path, 'null')
}

function oneOf(...allowed: string[]): Validator {
  return (value, path) => {
    stringValue(value, path)
    if (!allowed.includes(value as string)) fail(path, allowed.join(' | '))
  }
}

function union(...validators: Validator[]): Validator {
  return (value, path) => {
    for (const validator of validators) {
      try {
        validator(value, path)
        return
      } catch {
        // Try the next contract alternative.
      }
    }
    fail(path, 'una alternativa válida del contrato')
  }
}

function nullable(validator: Validator): Validator {
  return union(validator, nullValue)
}

function arrayOf(validator: Validator): Validator {
  return (value, path) => {
    if (!Array.isArray(value)) fail(path, 'array')
    value.forEach((item, index) => validator(item, `${path}[${index}]`))
  }
}

function objectOf(fields: Fields): Validator {
  return (value, path) => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) fail(path, 'object')
    const record = value as Record<string, unknown>
    const allowed = new Set(Object.keys(fields))

    for (const key of Object.keys(record)) {
      if (!allowed.has(key)) fail(`${path}.${key}`, 'una propiedad definida en el contrato')
    }

    for (const [key, field] of Object.entries(fields)) {
      if (!(key in record)) {
        if (field.optional) continue
        fail(`${path}.${key}`, 'una propiedad requerida')
      }
      field.validator(record[key], `${path}.${key}`)
    }
  }
}

function required(validator: Validator) {
  return { validator }
}

function optional(validator: Validator) {
  return { validator, optional: true }
}

function parser<T>(validator: Validator): ResponseParser<T> {
  return (value) => {
    validator(value, '$')
    return value as T
  }
}

const missionPhase = oneOf('preflight', 'inflight', 'postflight')
const sourceKind = oneOf(
  'wearable',
  'clinical_assessment',
  'public_dataset',
  'synthetic',
  'manual',
  'mission_context',
)
const quality = oneOf('adequate', 'low', 'unknown', 'not_applicable')
const analysisStatus = oneOf(
  'informational',
  'repeat_measurement',
  'review_suggested',
  'insufficient_data',
)

const astronaut = objectOf({
  id: required(stringValue),
  display_name: required(stringValue),
  mission_id: required(stringValue),
  is_fictional: required(booleanValue),
})

const metricDefinition = objectOf({
  code: required(stringValue),
  label: required(stringValue),
  unit: required(stringValue),
  supported_source_kinds: required(arrayOf(stringValue)),
  clinical_note: required(stringValue),
})

const observation = objectOf({
  id: required(stringValue),
  astronaut_id: required(stringValue),
  metric_code: required(stringValue),
  value: required(union(numberValue, stringValue)),
  unit: required(stringValue),
  observed_at_utc: required(stringValue),
  phase: required(missionPhase),
  quality: required(quality),
  source_kind: required(sourceKind),
  source_id: required(stringValue),
  device_model: optional(nullable(stringValue)),
  activity_context: optional(nullable(stringValue)),
  is_synthetic: required(booleanValue),
})

const overviewCard = objectOf({
  metric_code: required(stringValue),
  label: required(stringValue),
  value: required(nullable(union(numberValue, stringValue))),
  unit: required(nullable(stringValue)),
  observed_at_utc: required(nullable(stringValue)),
  source_kind: required(nullable(stringValue)),
  quality: required(stringValue),
  trend: required(stringValue),
})

const notice = objectOf({
  status: required(analysisStatus),
  reason_codes: required(arrayOf(stringValue)),
  clinically_validated: required(booleanValue),
})

const overview = objectOf({
  astronaut_id: required(stringValue),
  mission_phase: required(missionPhase),
  is_fictional: required(booleanValue),
  as_of_utc: required(stringValue),
  demo_data: required(booleanValue),
  cards: required(arrayOf(overviewCard)),
  notices: required(arrayOf(notice)),
  last_earth_sync_at_utc: required(nullable(stringValue)),
})

const baseline = objectOf({
  metric_code: required(stringValue),
  phase: required(stringValue),
  activity_context: optional(nullable(stringValue)),
  n: required(integerValue),
  median: required(nullable(numberValue)),
  iqr: required(nullable(numberValue)),
  unit: required(stringValue),
  period_start_utc: required(stringValue),
  period_end_utc: required(stringValue),
})

const trendPoint = objectOf({
  observed_at_utc: required(stringValue),
  value: required(union(stringValue, numberValue)),
  phase: required(stringValue),
  source_kind: required(stringValue),
  quality: required(stringValue),
})

const trendSeries = objectOf({
  metric_code: required(stringValue),
  unit: required(stringValue),
  points: required(arrayOf(trendPoint)),
  baseline: required(nullable(baseline)),
  summary: required(stringValue),
  limitations: required(arrayOf(stringValue)),
})

const readinessDomain = objectOf({
  code: required(oneOf('cardiovascular', 'musculoskeletal', 'sleep', 'sensorimotor', 'other')),
  coverage: required(oneOf('available', 'partial', 'insufficient')),
  trend: required(stringValue),
  evidence: required(arrayOf(stringValue)),
  missing: required(arrayOf(stringValue)),
})

const readiness = objectOf({
  astronaut_id: required(stringValue),
  assessment_kind: required(oneOf('evidence_summary_not_clearance')),
  comparison_phase: required(stringValue),
  generated_at_utc: required(stringValue),
  domains: required(arrayOf(readinessDomain)),
  medical_clearance: required(nullValue),
  clinically_validated: required(booleanValue),
  summary: required(stringValue),
})

const countermeasure = objectOf({
  id: required(stringValue),
  astronaut_id: required(stringValue),
  title: required(stringValue),
  authorized_by: required(stringValue),
  start_date: required(stringValue),
  end_date: optional(nullable(stringValue)),
  description: required(stringValue),
  source_document: optional(nullable(stringValue)),
  logs_completed: required(integerValue),
  planned_sessions: required(integerValue),
})

const importError = objectOf({
  row: required(integerValue),
  code: required(stringValue),
  detail: required(stringValue),
})

const importResult = objectOf({
  accepted: required(integerValue),
  rejected: required(integerValue),
  observation_ids: required(arrayOf(stringValue)),
  errors: required(arrayOf(importError)),
})

const analysis = objectOf({
  method: required(stringValue),
  status: required(analysisStatus),
  reason_codes: required(arrayOf(stringValue)),
  missing_data: required(arrayOf(stringValue)),
  explanation: required(stringValue),
  clinically_validated: required(booleanValue),
  algorithm_version: required(stringValue),
})

const communication = objectOf({
  message_id: required(stringValue),
  priority: required(oneOf('routine', 'priority')),
  status: required(oneOf('queued', 'transmitting', 'delivered', 'failed_retryable')),
  last_attempt_at_utc: required(nullable(stringValue)),
  delivered_at_utc: required(nullable(stringValue)),
})

const report = objectOf({
  report_id: required(stringValue),
  astronaut_id: required(stringValue),
  created_at_utc: required(stringValue),
  phase: required(stringValue),
  observations: required(arrayOf(observation)),
  analysis: required(analysis),
  readiness: required(nullable(readiness)),
  scientific_sources: required(arrayOf(stringValue)),
  communication: required(communication),
  review_status: required(oneOf('pending', 'reviewed', 'not_received_on_ship')),
  is_demo: required(booleanValue),
})

function paginated(item: Validator): Validator {
  return objectOf({
    items: required(arrayOf(item)),
    total: required(integerValue),
    limit: required(integerValue),
    offset: required(integerValue),
  })
}

const simulatorStatus = objectOf({
  mode: required(oneOf('online', 'offline', 'delayed')),
  one_way_latency_simulated_s: required(integerValue),
  time_acceleration: required(numberValue),
  queued_ship_to_earth: required(integerValue),
  queued_earth_to_ship: required(integerValue),
  in_flight: required(integerValue),
  last_delivered_at_utc: required(nullable(stringValue)),
  demo_mode: required(booleanValue),
})

const simulatorMetrics = objectOf({
  scenario_id: required(stringValue),
  delivered_count: required(integerValue),
  duplicates_suppressed: required(integerValue),
  messages_lost_after_restart: required(nullable(integerValue)),
  priority_delivery_delay_simulated_s: required(nullable(numberValue)),
  bytes_transferred: required(integerValue),
  queued_count: required(integerValue),
  has_run: required(booleanValue),
})

const inboxMessage = objectOf({
  message_id: required(stringValue),
  report_id: required(stringValue),
  note: required(stringValue),
  received_at_utc: required(stringValue),
})

const researchSource = objectOf({
  id: required(stringValue),
  title: required(stringValue),
  url: required(stringValue),
  relevance: required(stringValue),
})

export const parseHealthStatus = parser<HealthStatus>(objectOf({
  status: required(stringValue),
  demo_mode: required(booleanValue),
}))
export const parseMetricDefinitions = parser<MetricDefinition[]>(arrayOf(metricDefinition))
export const parseAstronauts = parser<Astronaut[]>(arrayOf(astronaut))
export const parseOverview = parser<Overview>(overview)
export const parseBaselines = parser<Baseline[]>(arrayOf(baseline))
export const parseTrendSeries = parser<TrendSeries>(trendSeries)
export const parseReadiness = parser<Readiness>(readiness)
export const parseCountermeasures = parser<CountermeasurePlan[]>(arrayOf(countermeasure))
export const parseImportResult = parser<ImportResult>(importResult)
export const parseObservation = parser<Observation>(observation)
export const parseListObservations = parser<ListObservations>(paginated(observation))
export const parseReport = parser<Report>(report)
export const parseListReports = parser<ListReports>(paginated(report))
export const parseShipInbox = parser<ShipInbox>(objectOf({ items: required(arrayOf(inboxMessage)) }))
export const parseMedicalReviewResult = parser<MedicalReviewResult>(objectOf({
  review_id: required(stringValue),
  return_message_id: required(stringValue),
  status: required(stringValue),
}))
export const parseSimulatorStatus = parser<SimulatorStatus>(simulatorStatus)
export const parseSimulatorMetrics = parser<SimulatorMetrics>(simulatorMetrics)
export const parseResearchSources = parser<ResearchSource[]>(arrayOf(researchSource))
