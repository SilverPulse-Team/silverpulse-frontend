/** SilverPulse API contract v0.2.0 shared primitives. */

export type MissionPhase = 'preflight' | 'inflight' | 'postflight'

export type DataSourceKind =
  | 'wearable'
  | 'clinical_assessment'
  | 'public_dataset'
  | 'synthetic'
  | 'manual'
  | 'mission_context'

export type ObservationQuality =
  | 'adequate'
  | 'low'
  | 'unknown'
  | 'not_applicable'

export type AnalysisStatus =
  | 'informational'
  | 'repeat_measurement'
  | 'review_suggested'
  | 'insufficient_data'

export interface Astronaut {
  id: string
  display_name: string
  mission_id: string
  is_fictional: boolean
}

export interface MetricDefinition {
  code: string
  label: string
  unit: string
  supported_source_kinds: string[]
  clinical_note: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  limit: number
  offset: number
}

export interface ApiError {
  detail: string
  code: string
}
