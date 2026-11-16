import type {
  AnalysisStatus,
  DataSourceKind,
  MissionPhase,
  ObservationQuality,
  PaginatedResponse,
} from './api'

export interface DataSource {
  id: string
  kind: DataSourceKind
  provider: string
  device_model?: string | null
  license?: string | null
  citation?: string | null
  is_synthetic: boolean
}

export interface ObservationInput {
  metric_code: string
  value: number | string
  unit: string
  observed_at_utc: string
  phase: MissionPhase
  quality: ObservationQuality
  activity_context?: string | null
  context?: Record<string, unknown>
}

export interface Observation {
  id: string
  astronaut_id: string
  metric_code: string
  value: number | string
  unit: string
  observed_at_utc: string
  phase: MissionPhase
  quality: ObservationQuality
  source_kind: DataSourceKind
  source_id: string
  device_model?: string | null
  activity_context?: string | null
  is_synthetic: boolean
}

export interface ImportRequest {
  astronaut_id: string
  source: DataSource
  observations: ObservationInput[]
}

export interface SingleObservationRequest {
  astronaut_id: string
  source: DataSource
  observation: ObservationInput
}

export interface ImportError {
  row: number
  code: string
  detail: string
}

export interface ImportResult {
  accepted: number
  rejected: number
  observation_ids: string[]
  errors: ImportError[]
}

export interface OverviewCard {
  metric_code: string
  label: string
  value: number | string | null
  unit: string | null
  observed_at_utc: string | null
  source_kind: string | null
  quality: string
  trend: string
}

export interface Notice {
  status: AnalysisStatus
  reason_codes: string[]
  clinically_validated: boolean
}

export interface Overview {
  astronaut_id: string
  mission_phase: MissionPhase
  is_fictional: boolean
  as_of_utc: string
  demo_data: boolean
  cards: OverviewCard[]
  notices: Notice[]
  last_earth_sync_at_utc: string | null
}

export interface Baseline {
  metric_code: string
  phase: string
  activity_context?: string | null
  n: number
  median: number | null
  iqr: number | null
  unit: string
  period_start_utc: string
  period_end_utc: string
}

export interface TrendPoint {
  observed_at_utc: string
  value: string | number
  phase: string
  source_kind: string
  quality: string
}

export interface TrendSeries {
  metric_code: string
  unit: string
  points: TrendPoint[]
  baseline: Baseline | null
  summary: string
  limitations: string[]
}

export type ReadinessDomainCode =
  | 'cardiovascular'
  | 'musculoskeletal'
  | 'sleep'
  | 'sensorimotor'
  | 'other'

export type EvidenceCoverage = 'available' | 'partial' | 'insufficient'

export interface ReadinessDomain {
  code: ReadinessDomainCode
  coverage: EvidenceCoverage
  trend: string
  evidence: string[]
  missing: string[]
}

export interface Readiness {
  astronaut_id: string
  assessment_kind: 'evidence_summary_not_clearance'
  comparison_phase: string
  generated_at_utc: string
  domains: ReadinessDomain[]
  medical_clearance: null
  clinically_validated: boolean
  summary: string
}

export interface CountermeasurePlan {
  id: string
  astronaut_id: string
  title: string
  authorized_by: string
  start_date: string
  end_date?: string | null
  description: string
  source_document?: string | null
  logs_completed: number
  planned_sessions: number
}

export interface CountermeasureLogInput {
  plan_id: string
  completed_at_utc: string
  duration_min: number
  self_reported: boolean
  notes?: string | null
}

export type ListObservations = PaginatedResponse<Observation>
