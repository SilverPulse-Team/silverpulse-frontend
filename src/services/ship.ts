import type {
  ImportRequest,
  ReportGenerateInput,
} from '../types'
import type { ObservationFilters, PaginationOptions } from './dataProvider'
import type { ApiClient } from './apiClient'
import {
  parseAstronauts,
  parseBaselines,
  parseCountermeasures,
  parseImportResult,
  parseListObservations,
  parseListReports,
  parseOverview,
  parseReadiness,
  parseReport,
  parseShipInbox,
  parseTrendSeries,
} from './contractParsers'

export function createShipService(client: ApiClient) {
  return {
    getAstronauts: () => client.get('/ship/astronauts', parseAstronauts),

    getOverview: (astronautId: string) =>
      client.get(`/ship/astronauts/${encodeURIComponent(astronautId)}/overview`, parseOverview),

    getBaselines: (astronautId: string) =>
      client.get(`/ship/astronauts/${encodeURIComponent(astronautId)}/baselines`, parseBaselines),

    getTrends: (astronautId: string, metricCode: string) =>
      client.get(`/ship/astronauts/${encodeURIComponent(astronautId)}/trends`, parseTrendSeries, {
        query: { metric_code: metricCode },
      }),

    getReturnReadiness: (astronautId: string) =>
      client.get(
        `/ship/astronauts/${encodeURIComponent(astronautId)}/return-readiness`,
        parseReadiness,
      ),

    getCountermeasures: (astronautId: string) =>
      client.get(
        `/ship/astronauts/${encodeURIComponent(astronautId)}/countermeasures`,
        parseCountermeasures,
      ),

    importObservations: (input: ImportRequest) =>
      client.post('/ship/observations/import', input, parseImportResult),

    getObservations: (filters: ObservationFilters = {}) =>
      client.get('/ship/observations', parseListObservations, {
        query: {
          astronaut_id: filters.astronaut_id,
          metric_code: filters.metric_code,
          phase: filters.phase,
          source_kind: filters.source_kind,
          limit: filters.limit,
          offset: filters.offset,
        },
      }),

    generateReport: (input: ReportGenerateInput) =>
      client.post('/ship/reports/generate', input, parseReport),

    getReports: (options: PaginationOptions = {}) =>
      client.get('/ship/reports', parseListReports, {
        query: { limit: options.limit, offset: options.offset },
      }),

    getReport: (reportId: string) =>
      client.get(`/ship/reports/${encodeURIComponent(reportId)}`, parseReport),

    getInbox: () => client.get('/ship/inbox', parseShipInbox),
  }
}

export type ShipService = ReturnType<typeof createShipService>
