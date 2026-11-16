import type { DataProvider, DataProviderMetadata } from './dataProvider'
import { ApiClient, type ApiClientOptions } from './apiClient'
import { parseHealthStatus, parseMetricDefinitions } from './contractParsers'
import { createEarthService } from './earth'
import { createEvaluationService } from './evaluation'
import { createResearchService } from './research'
import { createShipService } from './ship'
import { createSimulatorService } from './simulator'

export function createHttpDataProvider(options: ApiClientOptions = {}): DataProvider {
  const client = new ApiClient(options)
  const ship = createShipService(client)
  const earth = createEarthService(client)
  const simulator = createSimulatorService(client)
  const research = createResearchService(client)
  const evaluation = createEvaluationService(client)
  const metadata: DataProviderMetadata = {
    mode: 'http',
    contractVersion: '0.2.0',
    synthetic: true,
    persistence: 'backend',
    acknowledgements: 'backend',
  }

  return {
    metadata,
    getHealth: () => client.get('/health', parseHealthStatus),
    getMetricCatalog: () => client.get('/catalog/metrics', parseMetricDefinitions),
    getShipAstronauts: ship.getAstronauts,
    getShipOverview: ship.getOverview,
    getShipBaselines: ship.getBaselines,
    getShipTrends: ship.getTrends,
    getReturnReadiness: ship.getReturnReadiness,
    getCountermeasures: ship.getCountermeasures,
    logCountermeasure: ship.logCountermeasure,
    importObservations: ship.importObservations,
    createShipObservation: ship.createObservation,
    getShipObservations: ship.getObservations,
    createAnalysis: ship.createAnalysis,
    getAnalysis: ship.getAnalysis,
    getAnalyses: ship.getAnalyses,
    saveAnalysisAnswers: ship.saveAnalysisAnswers,
    refreshAnalysis: ship.refreshAnalysis,
    runAnalysis: ship.runAnalysis,
    generateReport: ship.generateReport,
    getShipReports: ship.getReports,
    getShipReport: ship.getReport,
    getShipInbox: ship.getInbox,
    getEarthReports: earth.getReports,
    getEarthReport: earth.getReport,
    reviewEarthReport: earth.reviewReport,
    getSimulatorStatus: simulator.getStatus,
    getSimulatorMetrics: simulator.getMetrics,
    configureSimulator: simulator.configure,
    stepSimulator: simulator.step,
    getResearchSources: research.getSources,
    getEvaluationResults: evaluation.getResults,
    runEvaluation: evaluation.run,
  }
}
