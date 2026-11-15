export interface EvaluationRunInput {
  fixture_id: string
}

export interface EvaluationResult {
  run_id: string
  sample_n: number
  metrics: Record<string, unknown>
}

export interface EvaluationRunResult extends EvaluationResult {
  fixture_id: string
}
