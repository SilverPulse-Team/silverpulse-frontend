export type SimulatorMode = 'online' | 'offline' | 'delayed'

export interface SimulatorStatus {
  mode: SimulatorMode
  one_way_latency_simulated_s: number
  time_acceleration: number
  queued_ship_to_earth: number
  queued_earth_to_ship: number
  in_flight: number
  last_delivered_at_utc: string | null
  demo_mode: boolean
}

export interface SimulatorConfigInput {
  mode: SimulatorMode
  one_way_latency_simulated_s: number
  time_acceleration: number
  drop_ack?: boolean
}

export interface SimulatorStepInput {
  simulated_seconds: number
}

export interface SimulatorMetrics {
  scenario_id: string
  delivered_count: number
  duplicates_suppressed: number
  messages_lost_after_restart: number | null
  priority_delivery_delay_simulated_s: number | null
  bytes_transferred: number
  queued_count: number
  has_run: boolean
}
