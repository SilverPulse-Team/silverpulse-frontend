import { describe, expect, it, vi } from 'vitest'
import { evaluationResultsFixture, researchSourcesFixture } from '../mocks/fixtures'
import { createMockDataProvider, MockOperationUnavailableError } from '../mocks/mockApi'
import { createHttpDataProvider } from './httpDataProvider'

describe('servicio HTTP de evidencia científica', () => {
  it('consulta las fuentes públicas del catálogo sin agregar URLs propias', async () => {
    const fetchImplementation = vi.fn<typeof fetch>(async () => new Response(
      JSON.stringify(researchSourcesFixture),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    ))
    const provider = createHttpDataProvider({ baseUrl: 'http://localhost:8000/api/v1', fetchImplementation })

    await expect(provider.getResearchSources()).resolves.toEqual(researchSourcesFixture)
    expect(String(fetchImplementation.mock.calls[0][0])).toBe(
      'http://localhost:8000/api/v1/research/sources',
    )
  })

  it('consulta resultados sin normalizar las métricas dinámicas del backend', async () => {
    const results = [
      { run_id: 'run-1', sample_n: 8, metrics: { observed_count: 7, policy: 'FIFO' } },
    ]
    const fetchImplementation = vi.fn<typeof fetch>(async () => new Response(
      JSON.stringify(results),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    ))
    const provider = createHttpDataProvider({ baseUrl: 'http://localhost:8000/api/v1', fetchImplementation })

    await expect(provider.getEvaluationResults()).resolves.toEqual(results)
    expect(String(fetchImplementation.mock.calls[0][0])).toBe(
      'http://localhost:8000/api/v1/evaluation/results',
    )
  })

  it('envía solo fixture_id y valida la respuesta de ejecución', async () => {
    const result = {
      run_id: 'run-2',
      fixture_id: 'fixture-public-01',
      sample_n: 6,
      metrics: { observed_count: 5 },
    }
    const fetchImplementation = vi.fn<typeof fetch>(async () => new Response(
      JSON.stringify(result),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    ))
    const provider = createHttpDataProvider({ baseUrl: 'http://localhost:8000/api/v1', fetchImplementation })

    await expect(provider.runEvaluation({ fixture_id: 'fixture-public-01' })).resolves.toEqual(result)
    expect(String(fetchImplementation.mock.calls[0][0])).toBe(
      'http://localhost:8000/api/v1/evaluation/run',
    )
    expect(fetchImplementation.mock.calls[0][1]?.method).toBe('POST')
    expect(JSON.parse(String(fetchImplementation.mock.calls[0][1]?.body))).toEqual({
      fixture_id: 'fixture-public-01',
    })
  })

  it('rechaza respuestas de evaluación que no cumplen el contrato', async () => {
    const fetchImplementation = vi.fn<typeof fetch>(async () => new Response(
      JSON.stringify([{ run_id: 'run-1', sample_n: '8', metrics: {} }]),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    ))
    const provider = createHttpDataProvider({ baseUrl: 'http://localhost:8000/api/v1', fetchImplementation })

    await expect(provider.getEvaluationResults()).rejects.toMatchObject({ kind: 'invalid-response' })
  })
})

describe('provider mock de evaluación científica', () => {
  it('devuelve una lista vacía y no inventa una corrida', async () => {
    const provider = createMockDataProvider()

    expect(evaluationResultsFixture).toEqual([])
    await expect(provider.getEvaluationResults()).resolves.toEqual([])
    await expect(provider.runEvaluation({ fixture_id: 'fixture-1' })).rejects.toBeInstanceOf(
      MockOperationUnavailableError,
    )
  })
})
