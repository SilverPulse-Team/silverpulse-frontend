import type { DataSource, MissionPhase, ObservationInput, ObservationQuality } from '../types'

export interface ImportParseError {
  row: number
  code: string
  detail: string
}

export interface ParsedImportRow {
  row: number
  values: Record<string, unknown>
}

export interface ParsedImportData {
  columns: string[]
  rows: ParsedImportRow[]
  errors: ImportParseError[]
  /** Metadatos de procedencia de un ImportRequest canónico; ausente en arreglos simples y CSV. */
  source?: DataSource
}

export interface ImportDraftRow {
  row: number
  metric_code: string
  value: string
  unit: string
  observed_at_utc: string
  phase: string
  quality: string
  activity_context: string
  original: Record<string, unknown>
}

export type ImportDraftField = Exclude<keyof ImportDraftRow, 'row' | 'original'>

export interface ImportRowError extends ImportParseError {
  field: ImportDraftField | 'row'
}

export interface ValidatedImportRow {
  row: number
  observation: ObservationInput & {
    phase: MissionPhase
    quality: ObservationQuality
  }
}

export interface ImportValidationResult {
  validRows: ValidatedImportRow[]
  errors: ImportRowError[]
}
