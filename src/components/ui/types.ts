export type DataSourceKind = 'synthetic' | 'public_dataset' | 'wearable' | 'clinical'

export type DataQuality = 'adequate' | 'unknown' | 'not_applicable'

export type MissionPhase = 'pre_flight' | 'in_flight' | 'post_flight'

export type SyncStatus =
  | 'recorded_ship'
  | 'queued'
  | 'in_transit'
  | 'delivered_earth'
  | 'reviewed'
  | 'response_queued'
  | 'response_received_ship'

export type EvidenceCoverage = 'available' | 'partial' | 'insufficient'
