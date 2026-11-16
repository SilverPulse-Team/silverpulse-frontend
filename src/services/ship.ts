import type {
  ImportRequest,
  AnalysisCreateInput,
  CountermeasureLogInput,
  ReportGenerateInput,
  SingleObservationRequest,
} from '../types'
import type { ObservationFilters, PaginationOptions } from './dataProvider'
import type { ApiClient } from './apiClient'
import {
  parseAstronauts,
  parseAnalysisSession,
  parseAnalysisSessionList,
  parseBaselines,
  parseCountermeasures,
  parseCountermeasureLogResult,
  parseImportResult,
  parseListObservations,
  parseListReports,
  parseOverview,
  parseObservation,
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

    logCountermeasure: (astronautId: string, input: CountermeasureLogInput) =>
      client.post(
        `/ship/astronauts/${encodeURIComponent(astronautId)}/countermeasures/logs`,
        input,
        parseCountermeasureLogResult,
      ),

    importObservations: (input: ImportRequest) =>
      client.post('/ship/observations/import', input, parseImportResult),

    createObservation: (input: SingleObservationRequest) =>
      client.post('/ship/observations', input, parseObservation),

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

    createAnalysis: (input: AnalysisCreateInput) =>
      client.post('/ship/analyses', input, parseAnalysisSession),

    getAnalysis: (analysisId: string) =>
      client.get(`/ship/analyses/${encodeURIComponent(analysisId)}`, parseAnalysisSession),

    getAnalyses: (options: PaginationOptions & { astronaut_id?: string } = {}) =>
      client.get('/ship/analyses', parseAnalysisSessionList, {
        query: { astronaut_id: options.astronaut_id, limit: options.limit, offset: options.offset },
      }),

    saveAnalysisAnswers: (analysisId: string, answers: Record<string, string>) =>
      client.patch(`/ship/analyses/${encodeURIComponent(analysisId)}/answers`, { answers }, parseAnalysisSession),

    refreshAnalysis: (analysisId: string) =>
      client.post(`/ship/analyses/${encodeURIComponent(analysisId)}/refresh`, undefined, parseAnalysisSession),

    runAnalysis: (analysisId: string) =>
      client.post(`/ship/analyses/${encodeURIComponent(analysisId)}/run`, undefined, parseAnalysisSession),

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
