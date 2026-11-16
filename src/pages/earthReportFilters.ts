import type { Report, ReviewStatus } from '../types'

export interface EarthReportFilters {
  phase: string
  receivedDate: string
  astronautId: string
  reviewStatus: ReviewStatus | 'all'
}

export const initialEarthReportFilters: EarthReportFilters = {
  phase: 'all',
  receivedDate: '',
  astronautId: 'all',
  reviewStatus: 'all',
}

export function filterEarthReports(reports: Report[], filters: EarthReportFilters) {
  return reports.filter((report) => {
    if (filters.phase !== 'all' && report.phase !== filters.phase) return false
    if (filters.astronautId !== 'all' && report.astronaut_id !== filters.astronautId) return false
    if (filters.reviewStatus !== 'all' && report.review_status !== filters.reviewStatus) return false
    if (filters.receivedDate && report.communication.delivered_at_utc?.slice(0, 10) !== filters.receivedDate) {
      return false
    }

    return true
  })
}
