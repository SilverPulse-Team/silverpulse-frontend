import type { SimulatorConfigInput, SimulatorStepInput } from '../types'
import type { ApiClient } from './apiClient'
import { parseSimulatorMetrics, parseSimulatorStatus } from './contractParsers'

export function createSimulatorService(client: ApiClient) {
  return {
    getStatus: () => client.get('/simulator/status', parseSimulatorStatus),

    configure: (input: SimulatorConfigInput) =>
      client.post('/simulator/config', input, parseSimulatorStatus),

    step: (input: SimulatorStepInput) =>
      client.post('/simulator/step', input, parseSimulatorStatus),

    getMetrics: () => client.get('/simulator/metrics', parseSimulatorMetrics),
  }
}

export type SimulatorService = ReturnType<typeof createSimulatorService>
