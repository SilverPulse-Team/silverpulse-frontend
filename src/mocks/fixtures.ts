import type {
  Analysis,
  Astronaut,
  Baseline,
  CountermeasurePlan,
  ImportRequest,
  ImportResult,
  ListObservations,
  ListReports,
  MedicalReviewInput,
  MetricDefinition,
  Observation,
  Overview,
  Readiness,
  Report,
  ReportGenerateInput,
  SimulatorMetrics,
  SimulatorStatus,
  TrendSeries,
} from '../types'
import type {
  HealthStatus,
  MedicalReviewResult,
  ResearchSource,
  ShipInbox,
} from '../services/dataProvider'

export const FIXTURE_CONTRACT_VERSION = '0.2.0' as const
export const FIXTURE_NOTE =
  'TODOS LOS DATOS SON SINTÉTICOS Y FICTICIOS. No representa backend implementado.' as const

export const healthFixture = {
  status: 'ok',
  demo_mode: true,
} satisfies HealthStatus

export const astronautsFixture = [
  {
    id: 'AST-001',
    display_name: 'Astronauta Demo 01',
    mission_id: 'MARS-DEMO',
    is_fictional: true,
  },
] satisfies Astronaut[]

export const importRequestFixture = {
  astronaut_id: 'AST-001',
  source: {
    id: 'SCENARIO-001',
    kind: 'synthetic',
    provider: 'SilverPulse demo',
    device_model: null,
    license: null,
    citation: null,
    is_synthetic: true,
  },
  observations: [
    {
      metric_code: 'heart_rate',
      value: 71,
      unit: 'bpm',
      observed_at_utc: '2026-11-14T15:00:00Z',
      phase: 'inflight',
      quality: 'adequate',
      activity_context: 'rest',
    },
    {
      metric_code: 'sleep_duration',
      value: 372,
      unit: 'min',
      observed_at_utc: '2026-11-14T06:00:00Z',
      phase: 'inflight',
      quality: 'unknown',
      activity_context: 'sleep',
    },
  ],
} satisfies ImportRequest

export const importResultFixture = {
  accepted: 2,
  rejected: 0,
  observation_ids: ['OBS-0001', 'OBS-0002'],
  errors: [],
} satisfies ImportResult

export const overviewFixture = {
  astronaut_id: 'AST-001',
  mission_phase: 'inflight',
  is_fictional: true,
  as_of_utc: '2026-11-14T15:02:00Z',
  demo_data: true,
  cards: [
    {
      metric_code: 'heart_rate',
      label: 'Frecuencia cardíaca',
      value: 71,
      unit: 'bpm',
      observed_at_utc: '2026-11-14T15:00:00Z',
      source_kind: 'synthetic',
      quality: 'adequate',
      trend: 'stable',
    },
    {
      metric_code: 'sleep_duration',
      label: 'Sueño',
      value: 372,
      unit: 'min',
      observed_at_utc: '2026-11-14T06:00:00Z',
      source_kind: 'synthetic',
      quality: 'unknown',
      trend: 'below_personal_baseline',
    },
    {
      metric_code: 'muscle_strength',
      label: 'Fuerza',
      value: null,
      unit: null,
      observed_at_utc: null,
      source_kind: null,
      quality: 'unknown',
      trend: 'insufficient_data',
    },
  ],
  notices: [
    {
      status: 'review_suggested',
      reason_codes: ['SLEEP_TREND', 'MISSING_STRENGTH_TEST'],
      clinically_validated: false,
    },
  ],
  last_earth_sync_at_utc: null,
} satisfies Overview

export const readinessFixture = {
  astronaut_id: 'AST-001',
  assessment_kind: 'evidence_summary_not_clearance',
  comparison_phase: 'preflight_vs_inflight',
  generated_at_utc: '2026-11-14T15:10:00Z',
  domains: [
    {
      code: 'cardiovascular',
      coverage: 'partial',
      trend: 'review_needed',
      evidence: ['heart_rate'],
      missing: ['orthostatic_assessment'],
    },
    {
      code: 'musculoskeletal',
      coverage: 'insufficient',
      trend: 'not_assessable',
      evidence: ['exercise_duration'],
      missing: ['muscle_strength', 'bone_density'],
    },
    {
      code: 'sleep',
      coverage: 'available',
      trend: 'below_personal_baseline',
      evidence: ['sleep_duration'],
      missing: [],
    },
    {
      code: 'sensorimotor',
      coverage: 'insufficient',
      trend: 'not_assessable',
      evidence: [],
      missing: ['balance_assessment'],
    },
  ],
  medical_clearance: null,
  clinically_validated: false,
  summary: 'Cobertura insuficiente para evaluar aptitud de retorno. Requiere valoración profesional.',
} satisfies Readiness

export const observationsFixture = [
  {
    id: 'OBS-0001',
    astronaut_id: 'AST-001',
    metric_code: 'heart_rate',
    value: 71,
    unit: 'bpm',
    observed_at_utc: '2026-11-14T15:00:00Z',
    phase: 'inflight',
    quality: 'adequate',
    source_kind: 'synthetic',
    source_id: 'SCENARIO-001',
    device_model: null,
    activity_context: 'rest',
    is_synthetic: true,
  },
  {
    id: 'OBS-0002',
    astronaut_id: 'AST-001',
    metric_code: 'sleep_duration',
    value: 372,
    unit: 'min',
    observed_at_utc: '2026-11-14T06:00:00Z',
    phase: 'inflight',
    quality: 'unknown',
    source_kind: 'synthetic',
    source_id: 'SCENARIO-001',
    device_model: null,
    activity_context: 'sleep',
    is_synthetic: true,
  },
] satisfies Observation[]

export const listObservationsFixture = {
  items: observationsFixture,
  total: 2,
  limit: 25,
  offset: 0,
} satisfies ListObservations

export const reportGenerateRequestFixture = {
  astronaut_id: 'AST-001',
  phase: 'inflight',
  include_return_summary: true,
} satisfies ReportGenerateInput

const analysisFixture = {
  method: 'ORBIT_VERIFY_v0.2',
  status: 'review_suggested',
  reason_codes: ['SLEEP_TREND', 'MISSING_STRENGTH_TEST'],
  missing_data: ['muscle_strength', 'balance_assessment'],
  explanation:
    'Cambios descriptivos en sueño con información funcional incompleta. No permite concluir riesgo clínico ni aptitud de retorno.',
  clinically_validated: false,
  algorithm_version: '0.2.0',
} satisfies Analysis

export const shipReportFixture = {
  report_id: 'RPT-0001',
  astronaut_id: 'AST-001',
  created_at_utc: '2026-11-14T15:12:00Z',
  phase: 'inflight',
  observations: observationsFixture,
  analysis: analysisFixture,
  readiness: readinessFixture,
  scientific_sources: ['NASA-HRP-RISKS', 'NASA-ASCR'],
  communication: {
    message_id: 'MSG-0001',
    priority: 'routine',
    status: 'queued',
    last_attempt_at_utc: null,
    delivered_at_utc: null,
  },
  review_status: 'not_received_on_ship',
  is_demo: true,
} satisfies Report

export const shipReportsFixture = {
  items: [shipReportFixture],
  total: 1,
  limit: 25,
  offset: 0,
} satisfies ListReports

export const shipReportAfterDeliveryFixture = {
  ...shipReportFixture,
  communication: {
    ...shipReportFixture.communication,
    status: 'delivered',
    delivered_at_utc: '2026-11-14T15:35:00Z',
  },
  review_status: 'pending',
} satisfies Report

export const shipReportAfterReturnFixture = {
  ...shipReportAfterDeliveryFixture,
  review_status: 'reviewed',
} satisfies Report

export const shipReportsAfterDeliveryFixture = {
  ...shipReportsFixture,
  items: [shipReportAfterDeliveryFixture],
} satisfies ListReports

export const shipReportsAfterReturnFixture = {
  ...shipReportsFixture,
  items: [shipReportAfterReturnFixture],
} satisfies ListReports

export const earthReportsBeforeDeliveryFixture = {
  items: [],
  total: 0,
  limit: 25,
  offset: 0,
} satisfies ListReports

export const simulatorStatusFixture = {
  mode: 'offline',
  one_way_latency_simulated_s: 1200,
  time_acceleration: 60,
  queued_ship_to_earth: 3,
  queued_earth_to_ship: 1,
  in_flight: 0,
  last_delivered_at_utc: null,
  demo_mode: true,
} satisfies SimulatorStatus

export const simulatorMetricsFixture = {
  scenario_id: 'offline_reconnect_01',
  delivered_count: 0,
  duplicates_suppressed: 0,
  messages_lost_after_restart: null,
  priority_delivery_delay_simulated_s: null,
  bytes_transferred: 0,
  queued_count: 3,
  has_run: false,
} satisfies SimulatorMetrics

export const medicalReviewRequestFixture = {
  review_status: 'reviewed',
  note: 'Se requiere comprobación documental adicional (nota ficticia de demostración).',
  followup_requested: true,
  is_demo: true,
} satisfies MedicalReviewInput

export const metricCatalogFixture = [
  {
    code: 'heart_rate',
    label: 'Frecuencia cardíaca',
    unit: 'bpm',
    supported_source_kinds: ['wearable', 'public_dataset', 'synthetic'],
    clinical_note: 'Interpretar según método y contexto',
  },
  {
    code: 'sleep_duration',
    label: 'Duración de sueño',
    unit: 'min',
    supported_source_kinds: ['wearable', 'public_dataset', 'synthetic'],
    clinical_note: 'Estimación no equivalente a polisomnografía',
  },
] satisfies MetricDefinition[]

export const baselinesFixture = [
  {
    metric_code: 'heart_rate',
    phase: 'preflight',
    activity_context: 'rest',
    n: 12,
    median: 65,
    iqr: 6,
    unit: 'bpm',
    period_start_utc: '2026-10-01T00:00:00Z',
    period_end_utc: '2026-10-12T23:59:59Z',
  },
] satisfies Baseline[]

export const trendsFixture = {
  metric_code: 'heart_rate',
  unit: 'bpm',
  points: [
    {
      observed_at_utc: '2026-11-14T15:00:00Z',
      value: 71,
      phase: 'inflight',
      source_kind: 'synthetic',
      quality: 'adequate',
    },
  ],
  baseline: baselinesFixture[0],
  summary: 'Cambio descriptivo respecto a referencia de demostración; no diagnóstico',
  limitations: ['Una única observación de ejemplo no permite concluir persistencia'],
} satisfies TrendSeries

export const countermeasuresFixture = [
  {
    id: 'CM-001',
    astronaut_id: 'AST-001',
    title: 'Sesión programada de ejercicio (demo)',
    authorized_by: 'CMO-DEMO',
    start_date: '2026-11-01',
    end_date: null,
    description: 'Plan ficticio suministrado por responsable humano; no generado por SilverPulse',
    source_document: null,
    logs_completed: 5,
    planned_sessions: 7,
  },
] satisfies CountermeasurePlan[]

export const earthDeliveredReportFixture = {
  ...shipReportFixture,
  communication: {
    message_id: 'MSG-0001',
    priority: 'routine',
    status: 'delivered',
    last_attempt_at_utc: null,
    delivered_at_utc: '2026-11-14T15:35:00Z',
  },
  review_status: 'pending',
} satisfies Report

export const earthReportsAfterDeliveryFixture = {
  items: [earthDeliveredReportFixture],
  total: 1,
  limit: 25,
  offset: 0,
} satisfies ListReports

export const medicalReviewResultFixture = {
  review_id: 'REV-001',
  return_message_id: 'MSG-RETURN-001',
  status: 'queued',
} satisfies MedicalReviewResult

export const emptyShipInboxFixture = { items: [] } satisfies ShipInbox

export const shipInboxAfterReturnFixture = {
  items: [
    {
      message_id: 'MSG-RETURN-001',
      report_id: 'RPT-0001',
      note: 'Se requiere comprobación documental adicional (nota ficticia de demostración).',
      received_at_utc: '2026-11-14T16:25:00Z',
    },
  ],
} satisfies ShipInbox

export const researchSourcesFixture = [
  {
    id: 'NASA-ASCR',
    title: 'Astronaut Strength, Conditioning and Rehabilitation',
    url: 'https://www.nasa.gov/directorates/esdmd/hhp/astronaut-strength-conditioning-and-rehabilitation/',
    relevance: 'Seguimiento humano de ejercicios y recuperación',
  },
  {
    id: 'NASA-DTN',
    title: 'Delay/Disruption Tolerant Networking',
    url: 'https://www.nasa.gov/communicating-with-missions/delay-disruption-tolerant-networking/',
    relevance: 'Justificación de transporte diferido',
  },
] satisfies ResearchSource[]

export const silverPulseFixturesV020 = {
  note: FIXTURE_NOTE,
  version: FIXTURE_CONTRACT_VERSION,
  health: healthFixture,
  astronauts: astronautsFixture,
  importRequest: importRequestFixture,
  importResult: importResultFixture,
  overview: overviewFixture,
  readiness: readinessFixture,
  observations: listObservationsFixture,
  reportGenerateRequest: reportGenerateRequestFixture,
  shipReport: shipReportFixture,
  shipReports: shipReportsFixture,
  shipReportAfterDelivery: shipReportAfterDeliveryFixture,
  shipReportAfterReturn: shipReportAfterReturnFixture,
  shipReportsAfterDelivery: shipReportsAfterDeliveryFixture,
  shipReportsAfterReturn: shipReportsAfterReturnFixture,
  earthReportsBeforeDelivery: earthReportsBeforeDeliveryFixture,
  simulatorStatus: simulatorStatusFixture,
  simulatorMetrics: simulatorMetricsFixture,
  medicalReviewRequest: medicalReviewRequestFixture,
  metricCatalog: metricCatalogFixture,
  baselines: baselinesFixture,
  trends: trendsFixture,
  countermeasures: countermeasuresFixture,
  earthReportsAfterDelivery: earthReportsAfterDeliveryFixture,
  medicalReviewResult: medicalReviewResultFixture,
  shipInboxAfterReturn: shipInboxAfterReturnFixture,
  researchSources: researchSourcesFixture,
}
