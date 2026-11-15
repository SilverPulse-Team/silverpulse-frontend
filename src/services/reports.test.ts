import { describe, expect, it, vi } from 'vitest'
import {
  earthDeliveredReportFixture,
  medicalReviewRequestFixture,
  medicalReviewResultFixture,
  reportGenerateRequestFixture,
  shipReportFixture,
  shipReportsFixture,
} from '../mocks/fixtures'
import { createMockDataProvider } from '../mocks/mockApi'
import { createHttpDataProvider } from './httpDataProvider'

describe('servicio HTTP de informes de nave', () => {
  it('envía ReportGenerateInput contractual y valida la respuesta del informe', async () => {
    const fetchImplementation = vi.fn<typeof fetch>(async () => new Response(
      JSON.stringify(shipReportFixture),
      { status: 201, headers: { 'Content-Type': 'application/json' } },
    ))
    const provider = createHttpDataProvider({ baseUrl: 'http://localhost:8000/api/v1', fetchImplementation })

    const report = await provider.generateReport(reportGenerateRequestFixture)

    expect(report.report_id).toBe(shipReportFixture.report_id)
    const [url, options] = fetchImplementation.mock.calls[0]
    expect(String(url)).toBe('http://localhost:8000/api/v1/ship/reports/generate')
    expect(options?.method).toBe('POST')
    expect(JSON.parse(String(options?.body))).toEqual({
      astronaut_id: reportGenerateRequestFixture.astronaut_id,
      phase: reportGenerateRequestFixture.phase,
      include_return_summary: reportGenerateRequestFixture.include_return_summary,
    })
  })

  it('consulta el listado local mediante GET /ship/reports', async () => {
    const fetchImplementation = vi.fn<typeof fetch>(async () => new Response(
      JSON.stringify(shipReportsFixture),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    ))
    const provider = createHttpDataProvider({ baseUrl: 'http://localhost:8000/api/v1', fetchImplementation })

    const reports = await provider.getShipReports()

    expect(reports.items[0].report_id).toBe('RPT-0001')
    expect(String(fetchImplementation.mock.calls[0][0])).toBe('http://localhost:8000/api/v1/ship/reports')
  })

  it('consulta el detalle terrestre solo mediante GET /earth/reports/{id}', async () => {
    const fetchImplementation = vi.fn<typeof fetch>(async () => new Response(
      JSON.stringify(earthDeliveredReportFixture),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    ))
    const provider = createHttpDataProvider({ baseUrl: 'http://localhost:8000/api/v1', fetchImplementation })

    const report = await provider.getEarthReport('RPT-0001')

    expect(report).toEqual(earthDeliveredReportFixture)
    expect(String(fetchImplementation.mock.calls[0][0])).toBe('http://localhost:8000/api/v1/earth/reports/RPT-0001')
    expect(fetchImplementation).toHaveBeenCalledTimes(1)
  })

  it('envía la revisión de Tierra con el body contractual y conserva el estado de respuesta', async () => {
    const fetchImplementation = vi.fn<typeof fetch>(async () => new Response(
      JSON.stringify(medicalReviewResultFixture),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    ))
    const provider = createHttpDataProvider({ baseUrl: 'http://localhost:8000/api/v1', fetchImplementation })

    const result = await provider.reviewEarthReport('RPT-0001', medicalReviewRequestFixture)

    expect(result).toEqual(medicalReviewResultFixture)
    expect(String(fetchImplementation.mock.calls[0][0])).toBe('http://localhost:8000/api/v1/earth/reports/RPT-0001/review')
    expect(fetchImplementation.mock.calls[0][1]?.method).toBe('POST')
    expect(JSON.parse(String(fetchImplementation.mock.calls[0][1]?.body))).toEqual(medicalReviewRequestFixture)
  })
})

describe('provider mock del ciclo logístico del informe', () => {
  it.each([
    ['offline', 'queued', 'not_received_on_ship'],
    ['after-delivery', 'delivered', 'pending'],
    ['after-return', 'delivered', 'reviewed'],
  ] as const)('expone el estado de escenario %s sin adelantar la respuesta', async (scenario, status, reviewStatus) => {
    const provider = createMockDataProvider({ scenario })
    const { items } = await provider.getShipReports()

    expect(items[0].communication.status).toBe(status)
    expect(items[0].review_status).toBe(reviewStatus)
    expect(provider.metadata.scenario).toBe(scenario)
  })

  it('mantiene queued fuera de Tierra y solo expone una respuesta en el escenario de retorno', async () => {
    const offline = createMockDataProvider({ scenario: 'offline' })
    const afterReturn = createMockDataProvider({ scenario: 'after-return' })

    expect((await offline.getEarthReports()).total).toBe(0)
    expect((await offline.getShipInbox()).items).toHaveLength(0)
    expect((await afterReturn.getShipInbox()).items[0].report_id).toBe('RPT-0001')
    expect((await afterReturn.getEarthReports()).items[0].review_status).toBe('reviewed')
    expect(await afterReturn.getEarthReport('RPT-0001')).toMatchObject({
      communication: { status: 'delivered', delivered_at_utc: expect.any(String) },
      review_status: 'reviewed',
    })
  })

  it('rechaza una generación no canónica sin añadir un informe fantasma', async () => {
    const provider = createMockDataProvider()

    await expect(provider.generateReport({
      ...reportGenerateRequestFixture,
      astronaut_id: 'AST-UNKNOWN',
    })).rejects.toMatchObject({ status: 422 })
    expect((await provider.getShipReports()).items.map(({ report_id }) => report_id)).toEqual(['RPT-0001'])
    expect((await provider.getEarthReports()).items).toEqual([])
  })
})
