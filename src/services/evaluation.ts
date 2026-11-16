import type { EvaluationRunInput } from '../types'
import type { ApiClient } from './apiClient'
import { parseEvaluationResults, parseEvaluationRunResult } from './contractParsers'

export function createEvaluationService(client: ApiClient) {
  return {
    getResults: () => client.get('/evaluation/results', parseEvaluationResults),
    run: (input: EvaluationRunInput) => client.post('/evaluation/run', input, parseEvaluationRunResult),
  }
}

export type EvaluationService = ReturnType<typeof createEvaluationService>
