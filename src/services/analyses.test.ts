import { describe, expect, it, vi } from 'vitest'
import { createHttpDataProvider } from './httpDataProvider'

const payload = {
  analysis_id: 'ANL-1', astronaut_id: 'AST-001', date_utc: '2026-11-14', phase: 'inflight', question: null,
  status: 'ready', created_at_utc: '2026-11-15T00:00:00Z', updated_at_utc: '2026-11-15T00:00:00Z',
  snapshot: { hash: 'hash', revision: 1, observation_ids: [] }, guided_questions: [], guided_answers: {},
  decision1: { readings: [], reliable_count: 0, unverified_count: 0, missing_count: 6,
    absent_metrics: [], pending_questions: [], confirmed_answers: {}, repeat_resolutions: {} },
  provenance: {}, orchestrator: { executed: false, status: 'not_run', results: {}, coverage: {},
    execution_mode: 'not_run', fallback_reason: null }, post_analysis_questions: [], limitations: [],
}

describe('servicio de análisis HTTP', () => {
  it('usa PATCH real y no sustituye errores por fixtures', async () => {
    const fetchImplementation = vi.fn(async (_url: URL, init?: RequestInit) => {
      expect(init?.method).toBe('PATCH')
      expect(JSON.parse(String(init?.body))).toEqual({ answers: { q1: 'Si' } })
      return new Response(JSON.stringify(payload), { status: 200 })
    }) as unknown as typeof fetch
    const provider = createHttpDataProvider({ baseUrl: 'http://localhost:8000/api/v1', fetchImplementation })
    const result = await provider.saveAnalysisAnswers('ANL-1', { q1: 'Si' })
    expect(result.analysis_id).toBe('ANL-1')
    expect(fetchImplementation).toHaveBeenCalledOnce()
  })
})
