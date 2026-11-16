import { describe, expect, it, vi } from 'vitest'
import { readinessFixture } from '../mocks/fixtures'
import { createHttpDataProvider } from './httpDataProvider'

describe('servicio de preparación de retorno', () => {
  it('consulta el endpoint v0.2.0 y conserva la respuesta sin calcular resultados', async () => {
    const fetchImplementation = vi.fn<typeof fetch>(async () => new Response(
      JSON.stringify(readinessFixture),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    ))
    const provider = createHttpDataProvider({
      baseUrl: 'http://localhost:8000/api/v1',
      fetchImplementation,
    })

    const result = await provider.getReturnReadiness('AST-001')

    expect(result).toEqual(readinessFixture)
    expect(fetchImplementation).toHaveBeenCalledTimes(1)
    expect(String(fetchImplementation.mock.calls[0][0])).toBe(
      'http://localhost:8000/api/v1/ship/astronauts/AST-001/return-readiness',
    )
    expect(fetchImplementation.mock.calls[0][1]?.method).toBe('GET')
  })

  it('rechaza una autorización clínica inventada fuera del contrato', async () => {
    const invalidResponse = { ...readinessFixture, medical_clearance: true }
    const fetchImplementation = vi.fn<typeof fetch>(async () => new Response(
      JSON.stringify(invalidResponse),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    ))
    const provider = createHttpDataProvider({ fetchImplementation })

    await expect(provider.getReturnReadiness('AST-001')).rejects.toMatchObject({
      kind: 'invalid-response',
      message: 'La respuesta de la API no coincide con el contrato SilverPulse v0.2.0.',
    })
  })
})
