import type {
  DataProvider,
  DataProviderMetadata,
  MedicalReviewResult,
  MockScenario,
  ObservationFilters,
  PaginationOptions,
  ShipInbox,
} from '../services/dataProvider'
import type { ImportRequest, MedicalReviewInput, ReportGenerateInput } from '../types'
import {
  astronautsFixture,
  baselinesFixture,
  countermeasuresFixture,
  earthReportsAfterDeliveryFixture,
  earthReportsBeforeDeliveryFixture,
  emptyShipInboxFixture,
  healthFixture,
  importRequestFixture,
  importResultFixture,
  listObservationsFixture,
  medicalReviewRequestFixture,
  medicalReviewResultFixture,
  metricCatalogFixture,
  overviewFixture,
  readinessFixture,
  reportGenerateRequestFixture,
  researchSourcesFixture,
  shipInboxAfterReturnFixture,
  shipReportFixture,
  shipReportsFixture,
  simulatorMetricsFixture,
  simulatorStatusFixture,
  trendsFixture,
} from './fixtures'

export interface MockDataProviderOptions {
  scenario?: MockScenario
}

export class MockFixtureNotFoundError extends Error {
  readonly status = 404

  constructor(resource: string) {
    super(`No existe un fixture sintético para ${resource}.`)
    this.name = 'MockFixtureNotFoundError'
  }
}

export class MockFixtureMismatchError extends Error {
  readonly status = 422

  constructor(operation: string) {
    super(
      `El modo mock solo reproduce la solicitud canónica v0.2.0 para ${operation}; no se ejecutó ni persistió la acción.`,
    )
    this.name = 'MockFixtureMismatchError'
  }
}

function clone<T>(value: T): T {
  return structuredClone(value)
}

function assertFixtureId(actual: string, expected: string, resource: string) {
  if (actual !== expected) {
    throw new MockFixtureNotFoundError(`${resource} "${actual}"`)
  }
}

function assertFixtureRequest<T>(actual: T, expected: T, operation: string) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new MockFixtureMismatchError(operation)
  }
}

function assertDefaultPagination(options?: PaginationOptions) {
  if (
    options &&
    ((options.limit !== undefined && options.limit !== 25) ||
      (options.offset !== undefined && options.offset !== 0))
  ) {
    throw new MockFixtureMismatchError('paginación')
  }
}

function getFilteredObservations(filters: ObservationFilters = {}) {
  const limit = filters.limit ?? 25
  const offset = filters.offset ?? 0

  if (!Number.isInteger(limit) || limit < 1 || limit > 100 || !Number.isInteger(offset) || offset < 0) {
    throw new MockFixtureMismatchError('paginación de observaciones')
  }

  const matchingItems = listObservationsFixture.items.filter((observation) => {
    if (filters.astronaut_id && observation.astronaut_id !== filters.astronaut_id) return false
    if (filters.metric_code && observation.metric_code !== filters.metric_code) return false
    if (filters.phase && observation.phase !== filters.phase) return false
    if (filters.source_kind && observation.source_kind !== filters.source_kind) return false
    return true
  })

  return {
    items: matchingItems.slice(offset, offset + limit),
    total: matchingItems.length,
    limit,
    offset,
  }
}

export function createMockDataProvider(options: MockDataProviderOptions = {}): DataProvider {
  const scenario = options.scenario ?? 'offline'
  const metadata: DataProviderMetadata = {
    mode: 'mock',
    contractVersion: '0.2.0',
    synthetic: true,
    scenario,
    persistence: 'simulated',
    acknowledgements: 'simulated',
  }

  return {
    metadata,

    async getHealth() {
      return clone(healthFixture)
    },

    async getMetricCatalog() {
      return clone(metricCatalogFixture)
    },

    async getShipAstronauts() {
      return clone(astronautsFixture)
    },

    async getShipOverview(astronautId) {
      assertFixtureId(astronautId, 'AST-001', 'astronauta')
      return clone(overviewFixture)
    },

    async getShipBaselines(astronautId) {
      assertFixtureId(astronautId, 'AST-001', 'astronauta')
      return clone(baselinesFixture)
    },

    async getShipTrends(astronautId, metricCode) {
      assertFixtureId(astronautId, 'AST-001', 'astronauta')
      assertFixtureId(metricCode, 'heart_rate', 'métrica')
      return clone(trendsFixture)
    },

    async getReturnReadiness(astronautId) {
      assertFixtureId(astronautId, 'AST-001', 'astronauta')
      return clone(readinessFixture)
    },

    async getCountermeasures(astronautId) {
      assertFixtureId(astronautId, 'AST-001', 'astronauta')
      return clone(countermeasuresFixture)
    },

    async importObservations(input: ImportRequest) {
      assertFixtureRequest(input, importRequestFixture, 'importación de observaciones')
      return clone(importResultFixture)
    },

    async getShipObservations(filters?: ObservationFilters) {
      return clone(getFilteredObservations(filters))
    },

    async generateReport(input: ReportGenerateInput) {
      assertFixtureRequest(input, reportGenerateRequestFixture, 'generación de informe')
      return clone(shipReportFixture)
    },

    async getShipReports(options?: PaginationOptions) {
      assertDefaultPagination(options)
      return clone(shipReportsFixture)
    },

    async getShipReport(reportId) {
      assertFixtureId(reportId, 'RPT-0001', 'informe de nave')
      return clone(shipReportFixture)
    },

    async getShipInbox(): Promise<ShipInbox> {
      return clone(scenario === 'after-return' ? shipInboxAfterReturnFixture : emptyShipInboxFixture)
    },

    async getEarthReports(options?: PaginationOptions) {
      assertDefaultPagination(options)
      return clone(
        scenario === 'offline' ? earthReportsBeforeDeliveryFixture : earthReportsAfterDeliveryFixture,
      )
    },

    async getEarthReport(reportId) {
      assertFixtureId(reportId, 'RPT-0001', 'informe de Tierra')
      if (scenario === 'offline') {
        throw new MockFixtureNotFoundError(`informe de Tierra "${reportId}" antes de entrega`)
      }
      return clone(earthReportsAfterDeliveryFixture.items[0])
    },

    async reviewEarthReport(
      reportId: string,
      input: MedicalReviewInput,
    ): Promise<MedicalReviewResult> {
      assertFixtureId(reportId, 'RPT-0001', 'informe de Tierra')
      if (scenario === 'offline') {
        throw new MockFixtureNotFoundError(`revisión de "${reportId}" antes de entrega`)
      }
      assertFixtureRequest(input, medicalReviewRequestFixture, 'revisión médica')
      return clone(medicalReviewResultFixture)
    },

    async getSimulatorStatus() {
      return clone(simulatorStatusFixture)
    },

    async getSimulatorMetrics() {
      return clone(simulatorMetricsFixture)
    },

    async getResearchSources() {
      return clone(researchSourcesFixture)
    },
  }
}
