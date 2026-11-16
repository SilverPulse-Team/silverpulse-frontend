// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMockDataProvider } from '../mocks/mockApi'
import { resetDataProvider, setDataProvider, type DataProvider } from '../services'
import type { AnalysisSession } from '../types'
import { AnalysisPage } from './AnalysisPage'

const session: AnalysisSession = {
  analysis_id: 'ANL-001', astronaut_id: 'AST-001', date_utc: '2026-11-14', phase: 'inflight', question: null,
  status: 'awaiting_answers', created_at_utc: '2026-11-15T00:00:00Z', updated_at_utc: '2026-11-15T00:00:00Z',
  snapshot: { hash: 'abc', revision: 1, observation_ids: ['OBS-1'] },
  guided_questions: [{ id: 'repeat_heart_rate', text: 'Puedes repetir el pulso?', options: ['Ya la repeti', 'No puedo ahora'] }],
  guided_answers: {},
  decision1: { readings: [{ id: 'OBS-1', metric_code: 'heart_rate', value: 180, unit: 'bpm', observed_at_utc: '2026-11-14T07:00:00Z', quality: 'adequate', check: { status: 'repeat', reason: 'cambio brusco' } }], reliable_count: 0, unverified_count: 1, missing_count: 5, absent_metrics: [], pending_questions: [], confirmed_answers: {}, repeat_resolutions: {} },
  provenance: {}, orchestrator: { executed: false, status: 'not_run', results: {}, coverage: {}, execution_mode: 'not_run', fallback_reason: null },
  post_analysis_questions: [], limitations: ['No clínico.'],
}

afterEach(() => { cleanup(); resetDataProvider() })

describe('AnalysisPage', () => {
  it('recupera la sesión, explica la repetición y persiste opciones entregadas por API', async () => {
    const base = createMockDataProvider()
    const save = vi.fn(async (_id: string, answers: Record<string, string>) => ({
      ...session, status: 'ready' as const, guided_answers: answers,
    }))
    const provider = {
      ...base,
      metadata: { ...base.metadata, mode: 'http' as const, persistence: 'backend' as const, acknowledgements: 'backend' as const },
      getAnalysis: vi.fn(async () => session),
      saveAnalysisAnswers: save,
    } satisfies DataProvider
    setDataProvider(provider)
    render(<MemoryRouter initialEntries={['/astronaut/analysis?id=ANL-001']}><AnalysisPage /></MemoryRouter>)

    expect(await screen.findByText('Preguntas previas de Decision 1')).toBeTruthy()
    expect(screen.getByText(/no vuelve confiable el dato anterior/i)).toBeTruthy()
    fireEvent.click(screen.getByRole('radio', { name: 'No puedo ahora' }))
    fireEvent.click(screen.getByRole('button', { name: 'Guardar respuestas' }))

    expect(save).toHaveBeenCalledWith('ANL-001', { repeat_heart_rate: 'No puedo ahora' })
    expect(await screen.findByText('Lista para ejecutar')).toBeTruthy()
  })
})
