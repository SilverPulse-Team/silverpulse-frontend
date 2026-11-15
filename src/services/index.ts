import { createMockDataProvider } from '../mocks/mockApi'
import { createHttpDataProvider } from './httpDataProvider'
import type { DataProvider } from './dataProvider'
import { resolveDataProviderMode, resolveMockScenario } from './dataProvider'

export type {
  DataProvider,
  DataProviderMetadata,
  DataProviderMode,
  CountermeasureLogResult,
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
export { ApiClient, ApiClientError, resolveApiBaseUrl } from './apiClient'
export { createHttpDataProvider } from './httpDataProvider'

let provider: DataProvider | undefined

export function getDataProvider(): DataProvider {
  if (provider) {
    return provider
  }

  const mode = resolveDataProviderMode()
  if (mode === 'http') {
    provider = createHttpDataProvider()
    return provider
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
