import type { MedicalReviewInput } from '../types'
import type { ApiClient } from './apiClient'
import type { PaginationOptions } from './dataProvider'
import { parseListReports, parseMedicalReviewResult, parseReport } from './contractParsers'

export function createEarthService(client: ApiClient) {
  return {
    getReports: (options: PaginationOptions = {}) =>
      client.get('/earth/reports', parseListReports, {
        query: { limit: options.limit, offset: options.offset },
      }),

    getReport: (reportId: string) =>
      client.get(`/earth/reports/${encodeURIComponent(reportId)}`, parseReport),

    reviewReport: (reportId: string, input: MedicalReviewInput) =>
      client.post(
        `/earth/reports/${encodeURIComponent(reportId)}/review`,
        input,
        parseMedicalReviewResult,
      ),
  }
}

export type EarthService = ReturnType<typeof createEarthService>
