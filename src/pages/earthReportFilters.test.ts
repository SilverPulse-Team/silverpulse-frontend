import { describe, expect, it } from 'vitest'
import type { Report } from '../types'
import { earthDeliveredReportFixture } from '../mocks/fixtures'
import { filterEarthReports, initialEarthReportFilters } from './earthReportFilters'

const reviewedReport: Report = {
  ...earthDeliveredReportFixture,
  report_id: 'RPT-0002',
  astronaut_id: 'AST-002',
  phase: 'postflight',
  communication: {
    ...earthDeliveredReportFixture.communication,
    delivered_at_utc: '2026-11-15T10:00:00Z',
  },
  review_status: 'reviewed',
}

const reports = [earthDeliveredReportFixture, reviewedReport]

describe('filtros de informes recibidos en Tierra', () => {
  it('solo devuelve informes existentes que coinciden con todos los filtros', () => {
    expect(filterEarthReports(reports, {
      phase: 'postflight',
      receivedDate: '2026-11-15',
      astronautId: 'AST-002',
      reviewStatus: 'reviewed',
    })).toEqual([reviewedReport])
  })

  it('filtra por fecha de recepción y estado sin fabricar registros', () => {
    expect(filterEarthReports(reports, {
      ...initialEarthReportFilters,
      receivedDate: '2026-11-16',
    })).toEqual([])
    expect(filterEarthReports(reports, {
      ...initialEarthReportFilters,
      reviewStatus: 'pending',
    })).toEqual([earthDeliveredReportFixture])
  })

  it('devuelve los informes sin reducir cuando los filtros están limpios', () => {
    expect(filterEarthReports(reports, initialEarthReportFilters)).toEqual(reports)
  })
})
