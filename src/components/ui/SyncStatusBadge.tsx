import { CheckCheck, Clock3, Download, Eye, Radio, Send, Upload } from 'lucide-react'
import { StatusBadge, type BadgeTone } from './StatusBadge'
import type { SyncStatus } from './types'

const syncConfig: Record<
  SyncStatus,
  { label: string; icon: typeof Clock3; tone: BadgeTone }
> = {
  recorded_ship: { label: 'Registrado en nave', icon: Download, tone: 'neutral' },
  queued: { label: 'En cola', icon: Clock3, tone: 'amber' },
  in_transit: { label: 'En tránsito', icon: Radio, tone: 'blue' },
  delivered_earth: { label: 'Entregado a Tierra', icon: Upload, tone: 'teal' },
  reviewed: { label: 'Revisado', icon: Eye, tone: 'teal' },
  response_queued: { label: 'Respuesta en cola', icon: Send, tone: 'amber' },
  response_received_ship: { label: 'Respuesta recibida en nave', icon: CheckCheck, tone: 'teal' },
}

export function SyncStatusBadge({ status }: { status: SyncStatus }) {
  const config = syncConfig[status]
  return <StatusBadge {...config} />
}
