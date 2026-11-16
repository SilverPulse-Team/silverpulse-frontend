// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMockDataProvider } from '../mocks/mockApi'
import { resetDataProvider, setDataProvider, type DataProvider } from '../services'
import { EvidencePage } from './EvidencePage'

afterEach(() => {
  cleanup()
  resetDataProvider()
})

describe('EvidencePage', () => {
  it('ejecuta un escenario conocido sin exigir que el usuario memorice fixture_id', async () => {
    const base = createMockDataProvider()
    const runEvaluation = vi.fn(async () => ({
      run_id: 'RUN-DEMO',
      fixture_id: 'analysis_abc',
      sample_n: 9,
      metrics: { result_status: 'completed' },
    }))
    const provider = {
      ...base,
      metadata: { ...base.metadata, mode: 'http' as const, persistence: 'backend' as const, acknowledgements: 'backend' as const },
      getEvaluationResults: vi.fn(async () => []),
      runEvaluation,
    } satisfies DataProvider
    setDataProvider(provider)
    render(<EvidencePage />)

    fireEvent.click(screen.getByRole('tab', { name: 'Evaluación' }))
    fireEvent.click(screen.getByRole('button', { name: /Comparar análisis A\/B\/C/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Ejecutar escenario' }))

    await waitFor(() => expect(runEvaluation).toHaveBeenCalledWith({ fixture_id: 'analysis_abc' }))
    expect(await screen.findByRole('heading', { name: 'Corrida RUN-DEMO' })).toBeTruthy()
  })

  it('explica el alcance del demo en lugar de mostrar una lista opaca de limitaciones', async () => {
    setDataProvider(createMockDataProvider())
    render(<EvidencePage />)

    fireEvent.click(screen.getByRole('tab', { name: 'Alcance del demo' }))
    expect(screen.getByText('¿Para qué sirve esta sección?')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Sí demuestra' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'No demuestra' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Cómo presentarlo' })).toBeTruthy()
  })
})
