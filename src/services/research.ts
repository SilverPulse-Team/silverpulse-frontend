import type { ApiClient } from './apiClient'
import { parseResearchSources } from './contractParsers'

export function createResearchService(client: ApiClient) {
  return {
    getSources: () => client.get('/research/sources', parseResearchSources),
  }
}

export type ResearchService = ReturnType<typeof createResearchService>
