import type {
  Astronaut,
  Baseline,
  CountermeasureLogInput,
  CountermeasurePlan,
  ImportRequest,
  ImportResult,
  ListObservations,
  ListReports,
  MedicalReviewInput,
  MetricDefinition,
  Observation,
  Overview,
  Readiness,
  Report,
  ReportGenerateInput,
  SimulatorMetrics,
  SimulatorStatus,
  SingleObservationRequest,
  TrendSeries,
} from '../types'

export type DataProviderMode = 'mock' | 'http'
export type MockScenario = 'offline' | 'after-delivery' | 'after-return'

export interface HealthStatus {
  status: string
  demo_mode: boolean
}

export interface ShipInboxMessage {
  message_id: string
  report_id: string
  note: string
  received_at_utc: string
}

export interface ShipInbox {
  items: ShipInboxMessage[]
}

export interface MedicalReviewResult {
  review_id: string
  return_message_id: string
  status: string
}

export interface CountermeasureLogResult {
  id: string
  status: string
}

export interface ResearchSource {
  id: string
  title: string
  url: string
  relevance: string
}

export interface ObservationFilters {
  astronaut_id?: string
  metric_code?: string
  phase?: string
  source_kind?: string
  limit?: number
  offset?: number
}

export interface PaginationOptions {
  limit?: number
  offset?: number
}

export interface DataProviderMetadata {
  mode: DataProviderMode
  contractVersion: '0.2.0'
  synthetic: boolean
  scenario?: MockScenario
  persistence: 'simulated' | 'backend'
  acknowledgements: 'simulated' | 'backend'
}

export interface DataProvider {
  readonly metadata: DataProviderMetadata
  getHealth(): Promise<HealthStatus>
  getMetricCatalog(): Promise<MetricDefinition[]>
  getShipAstronauts(): Promise<Astronaut[]>
  getShipOverview(astronautId: string): Promise<Overview>
  getShipBaselines(astronautId: string): Promise<Baseline[]>
  getShipTrends(astronautId: string, metricCode: string): Promise<TrendSeries>
  getReturnReadiness(astronautId: string): Promise<Readiness>
  getCountermeasures(astronautId: string): Promise<CountermeasurePlan[]>
  logCountermeasure(astronautId: string, input: CountermeasureLogInput): Promise<CountermeasureLogResult>
  importObservations(input: ImportRequest): Promise<ImportResult>
  createShipObservation(input: SingleObservationRequest): Promise<Observation>
  getShipObservations(filters?: ObservationFilters): Promise<ListObservations>
  generateReport(input: ReportGenerateInput): Promise<Report>
  getShipReports(options?: PaginationOptions): Promise<ListReports>
  getShipReport(reportId: string): Promise<Report>
  getShipInbox(): Promise<ShipInbox>
  getEarthReports(options?: PaginationOptions): Promise<ListReports>
  getEarthReport(reportId: string): Promise<Report>
  reviewEarthReport(reportId: string, input: MedicalReviewInput): Promise<MedicalReviewResult>
  getSimulatorStatus(): Promise<SimulatorStatus>
  getSimulatorMetrics(): Promise<SimulatorMetrics>
  getResearchSources(): Promise<ResearchSource[]>
}

export function resolveDataProviderMode(value = import.meta.env.VITE_DATA_PROVIDER): DataProviderMode {
  if (value === undefined || value === '' || value === 'mock') {
    return 'mock'
  }

  if (value === 'http') {
    return 'http'
  }

  throw new Error(`VITE_DATA_PROVIDER debe ser "mock" o "http"; se recibió "${value}".`)
}

export function resolveMockScenario(value = import.meta.env.VITE_MOCK_SCENARIO): MockScenario {
  if (value === undefined || value === '' || value === 'offline') {
    return 'offline'
  }

  if (value === 'after-delivery' || value === 'after-return') {
    return value
  }

  throw new Error(
    `VITE_MOCK_SCENARIO debe ser "offline", "after-delivery" o "after-return"; se recibió "${value}".`,
  )
}
