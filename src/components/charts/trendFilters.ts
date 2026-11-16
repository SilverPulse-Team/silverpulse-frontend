import type { MissionPhase, TrendPoint } from '../../types'

export interface TrendFilters {
  phase: MissionPhase | 'all'
  source: string
  quality: string
  activityContext: string
  dateFrom: string
  dateTo: string
}

function isWithinDateRange(point: TrendPoint, from: string, to: string) {
  const timestamp = new Date(point.observed_at_utc).getTime()
  if (!Number.isFinite(timestamp)) return false
  if (from && timestamp < new Date(`${from}T00:00:00Z`).getTime()) return false
  if (to && timestamp > new Date(`${to}T23:59:59.999Z`).getTime()) return false
  return true
}

export function filterTrendPoints(points: TrendPoint[], filters: TrendFilters) {
  return points.filter((point) => {
    if (filters.phase !== 'all' && point.phase !== filters.phase) return false
    if (filters.source !== 'all' && point.source_kind !== filters.source) return false
    if (filters.quality !== 'all' && point.quality !== filters.quality) return false

    // TrendSeries v0.2.0 does not expose activity_context per point. Requiring a
    // context must therefore abstain instead of assigning the baseline context.
    if (filters.activityContext !== 'all') return false

    return isWithinDateRange(point, filters.dateFrom, filters.dateTo)
  })
}
