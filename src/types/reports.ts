import type { AnalysisStatus, MissionPhase, PaginatedResponse } from './api'
import type { Observation, Readiness } from './observations'

export type MessagePriority = 'routine' | 'priority'

export type CommunicationStatus =
  | 'queued'
  | 'transmitting'
  | 'delivered'
  | 'failed_retryable'

export type ReviewStatus = 'pending' | 'reviewed' | 'not_received_on_ship'

export interface ReportGenerateInput {
  astronaut_id: string
  phase: MissionPhase
  include_return_summary?: boolean
}

export interface Analysis {
  method: string
  status: AnalysisStatus
  reason_codes: string[]
  missing_data: string[]
  explanation: string
  clinically_validated: boolean
  algorithm_version: string
}

export interface Communication {
  message_id: string
  priority: MessagePriority
  status: CommunicationStatus
  last_attempt_at_utc: string | null
  delivered_at_utc: string | null
}

export interface Report {
  report_id: string
  astronaut_id: string
  created_at_utc: string
  phase: string
  observations: Observation[]
  analysis: Analysis
  readiness: Readiness | null
  scientific_sources: string[]
  communication: Communication
  review_status: ReviewStatus
  is_demo: boolean
}

export interface MedicalReviewInput {
  review_status: 'reviewed'
  note: string
  followup_requested: boolean
  is_demo: boolean
}

export type ListReports = PaginatedResponse<Report>
