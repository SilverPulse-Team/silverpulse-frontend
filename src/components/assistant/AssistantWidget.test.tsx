// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMockDataProvider } from '../../mocks/mockApi'
import { earthReportsAfterDeliveryFixture } from '../../mocks/fixtures'
import { resetDataProvider, setDataProvider, type DataProvider } from '../../services'
import type { AnalysisSession } from '../../types'
import { AssistantWidget } from './AssistantWidget'

const readySession: AnalysisSession = {
  analysis_id: 'ANL-CHAT-1', astronaut_id: 'AST-002', date_utc: '2026-11-15', phase: 'inflight', question: null,
  status: 'ready', created_at_utc: '2026-11-15T12:00:00Z', updated_at_utc: '2026-11-15T12:00:00Z',
  snapshot: { hash: 'snapshot', revision: 1, observation_ids: ['OBS-1', 'OBS-2'] },
  guided_questions: [], guided_answers: {},
  decision1: { readings: [], reliable_count: 2, unverified_count: 0, missing_count: 4, absent_metrics: [], pending_questions: [], confirmed_answers: {}, repeat_resolutions: {} },
  provenance: { all_synthetic: true },
  orchestrator: { executed: false, status: 'not_run', results: {}, coverage: {}, execution_mode: 'not_run', fallback_reason: null },
  post_analysis_questions: [], limitations: ['Demo'],
}

afterEach(() => { cleanup(); resetDataProvider() })

describe('AssistantWidget', () => {
  it('muestra solo el asistente de nave y ejecuta una sesión real del provider', async () => {
    const base = createMockDataProvider()
    const createAnalysis = vi.fn(async () => readySession)
    const runAnalysis = vi.fn(async () => ({
      ...readySession,
      status: 'partial' as const,
      orchestrator: {
        executed: true, status: 'partial', execution_mode: 'deterministic_fallback', fallback_reason: 'ollama_no_disponible',
        coverage: { observed_features: ['heart_rate_bpm', 'spo2_pct'], missing_features: ['hrv_ms'] },
        results: { explanation: 'Resumen determinista recibido del backend.' },
      },
    }))
    const provider = {
      ...base,
      getShipAstronauts: vi.fn(async () => [
        { id: 'AST-001', display_name: 'Demo 01', mission_id: 'M1', is_fictional: true },
        { id: 'AST-002', display_name: 'Demo 02', mission_id: 'M1', is_fictional: true },
      ]),
      createAnalysis,
      runAnalysis,
    } satisfies DataProvider
    setDataProvider(provider)
    render(<MemoryRouter initialEntries={['/astronaut']}><AssistantWidget environment="ship" /></MemoryRouter>)

    expect(screen.queryByRole('button', { name: 'Abrir asistente de revisión' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Abrir asistente de a bordo' }))
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar análisis' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Demo 02 · AST-002' }))
    fireEvent.change(screen.getByLabelText('Día UTC'), { target: { value: '2026-11-15' } })
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Durante vuelo' }))

    expect(await screen.findByText('Sesión ANL-CHAT-1')).toBeTruthy()
    expect(createAnalysis).toHaveBeenCalledWith(expect.objectContaining({ astronaut_id: 'AST-002', date_utc: '2026-11-15', phase: 'inflight' }))
    fireEvent.click(screen.getByRole('button', { name: 'Analizar observaciones' }))
    expect(await screen.findByText('Análisis parcial')).toBeTruthy()
    expect(screen.getByText(/deterministic_fallback/)).toBeTruthy()
    expect(runAnalysis).toHaveBeenCalledWith('ANL-CHAT-1')
  })

  it('consulta solo informes Earth y registra una revisión tras confirmación explícita', async () => {
    const base = createMockDataProvider({ scenario: 'after-delivery' })
    const report = earthReportsAfterDeliveryFixture.items[0]
    const reviewEarthReport = vi.fn(async () => ({ review_id: 'REV-1', return_message_id: 'MSG-RETURN-1', status: 'queued' }))
    const provider = {
      ...base,
      getEarthReports: vi.fn(async () => earthReportsAfterDeliveryFixture),
      getEarthReport: vi.fn(async () => report),
      reviewEarthReport,
    } satisfies DataProvider
    setDataProvider(provider)
    render(<MemoryRouter initialEntries={['/medical']}><AssistantWidget environment="earth" /></MemoryRouter>)

    expect(screen.queryByRole('button', { name: 'Abrir asistente de a bordo' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Abrir asistente de revisión' }))
    fireEvent.click(screen.getByRole('button', { name: 'Ver informes recibidos' }))
    fireEvent.click(await screen.findByRole('button', { name: `${report.report_id} · ${report.review_status}` }))
    expect(await screen.findByText(new RegExp(report.report_id))).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Preparar revisión' }))
    fireEvent.change(screen.getByLabelText('Nota de revisión'), { target: { value: 'Nota demostrativa revisada por una persona.' } })
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Sin seguimiento' }))
    expect(screen.getByText(/Confirma el POST/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar envío' }))

    expect(await screen.findByText('Revisión registrada en Tierra')).toBeTruthy()
    expect(screen.getByText(/La llegada a nave depende del simulador/i)).toBeTruthy()
    await waitFor(() => expect(reviewEarthReport).toHaveBeenCalledWith(report.report_id, {
      review_status: 'reviewed', note: 'Nota demostrativa revisada por una persona.', followup_requested: false, is_demo: true,
    }))
  })

  it('cierra con Escape y devuelve el foco al launcher', async () => {
    setDataProvider(createMockDataProvider())
    render(<MemoryRouter initialEntries={['/astronaut']}><AssistantWidget environment="ship" /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: 'Abrir asistente de a bordo' }))
    fireEvent.keyDown(window, { key: 'Escape' })
    const launcher = await screen.findByRole('button', { name: 'Abrir asistente de a bordo' })
    await waitFor(() => expect(document.activeElement).toBe(launcher))
  })

  it('persiste una respuesta cerrada antes de habilitar el análisis', async () => {
    const base = createMockDataProvider()
    const guidedQuestion = { id: 'Q-QUALITY', text: '¿La lectura fue tomada correctamente?', options: ['Sí', 'No'] }
    const pending: AnalysisSession = {
      ...readySession,
      status: 'awaiting_answers',
      guided_questions: [guidedQuestion],
      decision1: { ...readySession.decision1, pending_questions: [guidedQuestion] },
    }
    const saveAnalysisAnswers = vi.fn(async () => ({
      ...pending,
      status: 'ready' as const,
      guided_answers: { 'Q-QUALITY': 'Sí' },
      decision1: { ...pending.decision1, pending_questions: [], confirmed_answers: { 'Q-QUALITY': 'Sí' } },
    }))
    setDataProvider({ ...base, getAnalysis: vi.fn(async () => pending), saveAnalysisAnswers } satisfies DataProvider)
    render(<MemoryRouter initialEntries={['/astronaut/analysis?id=ANL-CHAT-1']}><AssistantWidget environment="ship" /></MemoryRouter>)

    fireEvent.click(screen.getByRole('button', { name: 'Abrir asistente de a bordo' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Sí' }))

    await waitFor(() => expect(saveAnalysisAnswers).toHaveBeenCalledWith('ANL-CHAT-1', { 'Q-QUALITY': 'Sí' }))
    expect(await screen.findByText('Sí')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Analizar observaciones' })).toBeTruthy()
  })

  it('muestra estados Earth vacío y de error sin inventar informes', async () => {
    const base = createMockDataProvider()
    const getEarthReports = vi.fn()
      .mockResolvedValueOnce({ items: [], total: 0, limit: 25, offset: 0 })
      .mockRejectedValueOnce(new Error('Earth no disponible'))
    setDataProvider({ ...base, getEarthReports } satisfies DataProvider)
    render(<MemoryRouter initialEntries={['/medical']}><AssistantWidget environment="earth" /></MemoryRouter>)

    fireEvent.click(screen.getByRole('button', { name: 'Abrir asistente de revisión' }))
    fireEvent.click(screen.getByRole('button', { name: 'Ver informes recibidos' }))
    expect(await screen.findByText(/No hay informes recibidos en Tierra/)).toBeTruthy()
    expect(screen.queryByText(/RPT-/)).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Actualizar bandeja' }))
    expect(await screen.findByText('Earth no disponible')).toBeTruthy()
  })
})
