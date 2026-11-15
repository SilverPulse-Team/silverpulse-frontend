import type {
  DataProvider,
  DataProviderMetadata,
  MedicalReviewResult,
  MockScenario,
  ObservationFilters,
  PaginationOptions,
  ShipInbox,
} from '../services/dataProvider'
import type {
  ImportRequest,
  CountermeasureLogInput,
  CountermeasurePlan,
  MedicalReviewInput,
  Observation,
  ReportGenerateInput,
  SingleObservationRequest,
} from '../types'
import {
  astronautsFixture,
  baselinesFixture,
  countermeasuresFixture,
  earthReportsAfterDeliveryFixture,
  earthReportsBeforeDeliveryFixture,
  emptyShipInboxFixture,
  healthFixture,
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

function getFilteredObservations(observations: Observation[], filters: ObservationFilters = {}) {
  const limit = filters.limit ?? 25
  const offset = filters.offset ?? 0

  if (!Number.isInteger(limit) || limit < 1 || limit > 100 || !Number.isInteger(offset) || offset < 0) {
    throw new MockFixtureMismatchError('paginación de observaciones')
  }

  const matchingItems = observations.filter((observation) => {
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
  const storedObservations: Observation[] = clone(listObservationsFixture.items)
  const storedCountermeasures: CountermeasurePlan[] = clone(countermeasuresFixture)
  let nextObservationNumber = storedObservations.length + 1
  let nextCountermeasureLogNumber = 1

  const storeObservation = (input: SingleObservationRequest): Observation => {
    const id = `OBS-MOCK-${String(nextObservationNumber).padStart(4, '0')}`
    nextObservationNumber += 1
    const observation: Observation = {
      id,
      astronaut_id: input.astronaut_id,
      metric_code: input.observation.metric_code,
      value: input.observation.value,
      unit: input.observation.unit,
      observed_at_utc: input.observation.observed_at_utc,
      phase: input.observation.phase,
      quality: input.observation.quality,
      source_kind: input.source.kind,
      source_id: input.source.id,
      device_model: input.source.device_model ?? null,
      activity_context: input.observation.activity_context ?? null,
      is_synthetic: input.source.is_synthetic,
    }
    storedObservations.push(observation)
    return observation
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
      return clone(storedCountermeasures)
    },

    async logCountermeasure(astronautId, input: CountermeasureLogInput) {
      assertFixtureId(astronautId, 'AST-001', 'astronauta')
      const plan = storedCountermeasures.find((item) => item.id === input.plan_id)
      if (!plan) throw new MockFixtureNotFoundError(`plan de contramedida "${input.plan_id}"`)
      if (
        !Number.isFinite(input.duration_min) ||
        input.duration_min <= 0 ||
        Number.isNaN(new Date(input.completed_at_utc).getTime()) ||
        typeof input.self_reported !== 'boolean'
      ) {
        throw new MockFixtureMismatchError('registro de cumplimiento')
      }

      plan.logs_completed += 1
      const id = `CMLOG-MOCK-${String(nextCountermeasureLogNumber).padStart(4, '0')}`
      nextCountermeasureLogNumber += 1
      return { id, status: 'recorded' }
    },

    async importObservations(input: ImportRequest) {
      const observationIds = input.observations.map((observation) => storeObservation({
        astronaut_id: input.astronaut_id,
        source: input.source,
        observation,
      }).id)
      return {
        accepted: observationIds.length,
        rejected: 0,
        observation_ids: observationIds,
        errors: [],
      }
    },

    async createShipObservation(input: SingleObservationRequest) {
      return clone(storeObservation(input))
    },

    async getShipObservations(filters?: ObservationFilters) {
      return clone(getFilteredObservations(storedObservations, filters))
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
