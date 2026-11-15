import { describe, expect, it, vi } from 'vitest'
import { createMockDataProvider, MockOperationUnavailableError } from '../mocks/mockApi'
import { simulatorMetricsFixture, simulatorStatusFixture } from '../mocks/fixtures'
import type { SimulatorConfigInput } from '../types'
import { createHttpDataProvider } from './httpDataProvider'

describe('servicio HTTP del simulador', () => {
  it('envía la configuración con el schema exacto de SimulatorConfigInput', async () => {
    const input: SimulatorConfigInput = {
      mode: 'delayed',
      one_way_latency_simulated_s: 900,
      time_acceleration: 30,
      drop_ack: true,
    } as const
    const responseStatus = {
      ...simulatorStatusFixture,
      mode: input.mode,
      one_way_latency_simulated_s: input.one_way_latency_simulated_s,
      time_acceleration: input.time_acceleration,
    }
    const fetchImplementation = vi.fn<typeof fetch>(async () => new Response(
      JSON.stringify(responseStatus),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    ))
    const provider = createHttpDataProvider({ baseUrl: 'http://localhost:8000/api/v1', fetchImplementation })

    const result = await provider.configureSimulator(input)

    expect(result.mode).toBe('delayed')
    expect(String(fetchImplementation.mock.calls[0][0])).toBe('http://localhost:8000/api/v1/simulator/config')
    expect(fetchImplementation.mock.calls[0][1]?.method).toBe('POST')
    expect(JSON.parse(String(fetchImplementation.mock.calls[0][1]?.body))).toEqual(input)
  })

  it('envía el entero simulado y devuelve el status contractual del endpoint step', async () => {
    const input = { simulated_seconds: 86400 }
    const fetchImplementation = vi.fn<typeof fetch>(async () => new Response(
      JSON.stringify(simulatorStatusFixture),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    ))
    const provider = createHttpDataProvider({ baseUrl: 'http://localhost:8000/api/v1', fetchImplementation })

    await expect(provider.stepSimulator(input)).resolves.toEqual(simulatorStatusFixture)
    expect(String(fetchImplementation.mock.calls[0][0])).toBe('http://localhost:8000/api/v1/simulator/step')
    expect(JSON.parse(String(fetchImplementation.mock.calls[0][1]?.body))).toEqual(input)
  })
})

describe('provider mock del simulador', () => {
  it('aplica solo configuración local y no presenta eso como entrega', async () => {
    const provider = createMockDataProvider()
    const status = await provider.configureSimulator({
      mode: 'online',
      one_way_latency_simulated_s: 500,
      time_acceleration: 10,
      drop_ack: false,
    })

    expect(status).toMatchObject({
      mode: 'online',
      one_way_latency_simulated_s: 500,
      time_acceleration: 10,
      last_delivered_at_utc: null,
    })
    expect(await provider.getSimulatorStatus()).toEqual(status)
    expect((await provider.getSimulatorMetrics()).has_run).toBe(false)
    expect((await provider.getEarthReports()).items).toEqual([])
  })

  it('no inventa avance ni métricas cuando no hay fixture ejecutable', async () => {
    const provider = createMockDataProvider()

    await expect(provider.stepSimulator({ simulated_seconds: 3600 })).rejects.toBeInstanceOf(
      MockOperationUnavailableError,
    )
    expect(await provider.getSimulatorMetrics()).toEqual(simulatorMetricsFixture)
  })

  it('rechaza parámetros fuera de límites sin alterar el estado del mock', async () => {
    const provider = createMockDataProvider()

    await expect(provider.configureSimulator({
      mode: 'online',
      one_way_latency_simulated_s: -1,
      time_acceleration: 1,
    })).rejects.toMatchObject({ status: 422 })
    await expect(provider.stepSimulator({ simulated_seconds: 86401 })).rejects.toMatchObject({ status: 422 })
    expect(await provider.getSimulatorStatus()).toEqual(simulatorStatusFixture)
  })
})
