import type { MissionPhase, PaginatedResponse } from './api'

export type AnalysisSessionStatus =
  | 'awaiting_answers'
  | 'ready'
  | 'completed'
  | 'partial'
  | 'insufficient_evidence'
  | 'failed'

export interface AnalysisCreateInput {
  astronaut_id: string
  date_utc: string
  phase: MissionPhase
  question?: string | null
}

export interface GuidedQuestion {
  id: string
  text: string
  options: string[]
}

export interface DecisionReading {
  id: string
  metric_code: string
  value: number | null
  unit: string
  observed_at_utc: string
  quality: string
  check: { status: 'reliable' | 'repeat' | 'insufficient'; reason: string }
}

export interface AnalysisSession {
  analysis_id: string
  astronaut_id: string
  date_utc: string
  phase: MissionPhase
  question: string | null
  status: AnalysisSessionStatus
  created_at_utc: string
  updated_at_utc: string
  snapshot: { hash: string; revision: number; observation_ids: string[] }
  guided_questions: GuidedQuestion[]
  guided_answers: Record<string, string>
  decision1: {
    readings: DecisionReading[]
    reliable_count: number
    unverified_count: number
    missing_count: number
    absent_metrics: string[]
    pending_questions: GuidedQuestion[]
    confirmed_answers: Record<string, string>
    repeat_resolutions: Record<string, string>
  }
  provenance: Record<string, unknown>
  orchestrator: {
    executed: boolean
    status: string
    results: Record<string, unknown>
    coverage: Record<string, unknown>
    execution_mode: string
    fallback_reason: string | null
  }
  post_analysis_questions: string[]
  limitations: string[]
}

export type AnalysisSessionList = PaginatedResponse<AnalysisSession>
