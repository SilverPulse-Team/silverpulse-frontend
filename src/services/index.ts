import { createMockDataProvider } from '../mocks/mockApi'
import type { DataProvider } from './dataProvider'
import { resolveDataProviderMode, resolveMockScenario } from './dataProvider'

export type {
  DataProvider,
  DataProviderMetadata,
  DataProviderMode,
  HealthStatus,
  MedicalReviewResult,
  MockScenario,
  ObservationFilters,
  PaginationOptions,
  ResearchSource,
  ShipInbox,
  ShipInboxMessage,
} from './dataProvider'
export { resolveDataProviderMode, resolveMockScenario } from './dataProvider'

let provider: DataProvider | undefined

export function getDataProvider(): DataProvider {
  if (provider) {
    return provider
  }

  const mode = resolveDataProviderMode()
  if (mode === 'http') {
    throw new Error(
      'VITE_DATA_PROVIDER="http" requiere el cliente HTTP de FE-11. Usa "mock" hasta implementarlo.',
    )
  }

  provider = createMockDataProvider({ scenario: resolveMockScenario() })
  return provider
}

export function setDataProvider(nextProvider: DataProvider) {
  provider = nextProvider
}

export function resetDataProvider() {
  provider = undefined
}
