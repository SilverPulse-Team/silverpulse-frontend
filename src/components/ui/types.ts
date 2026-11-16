export type { DataSourceKind, MissionPhase, ObservationQuality as DataQuality } from '../../types'

export type SyncStatus =
  | 'recorded_ship'
  | 'queued'
  | 'in_transit'
  | 'delivered_earth'
  | 'reviewed'
  | 'response_queued'
  | 'response_received_ship'

export type EvidenceCoverage = 'available' | 'partial' | 'insufficient'
