import { describe, expect, it, vi } from 'vitest'
import { createMockDataProvider } from '../mocks/mockApi'
import { importRequestFixture } from '../mocks/fixtures'
import { createHttpDataProvider } from './httpDataProvider'

describe('servicio HTTP de observaciones', () => {
  it('envía ImportRequest como application/json al endpoint múltiple', async () => {
    const fetchImplementation = vi.fn<typeof fetch>(async () => new Response(JSON.stringify({
      accepted: 2,
      rejected: 0,
      observation_ids: ['OBS-1001', 'OBS-1002'],
      errors: [],
    }), { status: 201, headers: { 'Content-Type': 'application/json' } }))
    const provider = createHttpDataProvider({ baseUrl: 'http://localhost:8000/api/v1', fetchImplementation })

    const result = await provider.importObservations(importRequestFixture)

    expect(result.accepted).toBe(2)
    expect(fetchImplementation).toHaveBeenCalledTimes(1)
    const [url, options] = fetchImplementation.mock.calls[0]
    expect(String(url)).toBe('http://localhost:8000/api/v1/ship/observations/import')
    expect(options?.method).toBe('POST')
    expect(new Headers(options?.headers).get('Content-Type')).toBe('application/json')
    expect(JSON.parse(String(options?.body))).toEqual(importRequestFixture)
  })

  it('usa POST /ship/observations para una captura individual', async () => {
    const responseObservation = {
      id: 'OBS-1001',
      astronaut_id: importRequestFixture.astronaut_id,
      ...importRequestFixture.observations[0],
      source_kind: importRequestFixture.source.kind,
      source_id: importRequestFixture.source.id,
      device_model: null,
      is_synthetic: true,
    }
    const fetchImplementation = vi.fn<typeof fetch>(async () => new Response(
      JSON.stringify(responseObservation),
      { status: 201, headers: { 'Content-Type': 'application/json' } },
    ))
    const provider = createHttpDataProvider({ baseUrl: 'http://localhost:8000/api/v1', fetchImplementation })

    const result = await provider.createShipObservation({
      astronaut_id: importRequestFixture.astronaut_id,
      source: importRequestFixture.source,
      observation: importRequestFixture.observations[0],
    })

    expect(result.id).toBe('OBS-1001')
    expect(String(fetchImplementation.mock.calls[0][0])).toBe('http://localhost:8000/api/v1/ship/observations')
  })

  it.each([400, 409, 422])('conserva el estado HTTP %i cuando FastAPI rechaza la importación', async (status) => {
    const fetchImplementation = vi.fn<typeof fetch>(async () => new Response(JSON.stringify({
      code: `ERROR_${status}`,
      detail: `Detalle ${status}`,
    }), { status, headers: { 'Content-Type': 'application/json' } }))
    const provider = createHttpDataProvider({ baseUrl: 'http://localhost:8000/api/v1', fetchImplementation })

    await expect(provider.importObservations(importRequestFixture)).rejects.toMatchObject({
      status,
      code: `ERROR_${status}`,
      detail: `Detalle ${status}`,
    })
  })
})

describe('provider mock de observaciones', () => {
  it('identifica el modo simulado y refresca su historial en memoria', async () => {
    const provider = createMockDataProvider()
    const before = await provider.getShipObservations({ astronaut_id: 'AST-001' })
    const result = await provider.importObservations(importRequestFixture)
    const after = await provider.getShipObservations({ astronaut_id: 'AST-001' })

    expect(provider.metadata.mode).toBe('mock')
    expect(provider.metadata.persistence).toBe('simulated')
    expect(result).toMatchObject({ accepted: 2, rejected: 0, errors: [] })
    expect(after.total).toBe(before.total + 2)
    expect(after.items.slice(-2).map((observation) => observation.id)).toEqual(result.observation_ids)
  })
})
