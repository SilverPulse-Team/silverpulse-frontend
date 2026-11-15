import { Database, FlaskConical, Stethoscope, Watch } from 'lucide-react'
import { StatusBadge, type BadgeTone } from './StatusBadge'
import type { DataSourceKind } from './types'

const sourceConfig: Record<
  DataSourceKind,
  { label: string; icon: typeof Database; tone: BadgeTone }
> = {
  synthetic: { label: 'Fuente: Sintético', icon: FlaskConical, tone: 'blue' },
  public_dataset: { label: 'Fuente: Dataset público', icon: Database, tone: 'neutral' },
  wearable: { label: 'Fuente: Wearable', icon: Watch, tone: 'teal' },
  clinical: { label: 'Fuente: Clínico', icon: Stethoscope, tone: 'amber' },
}

export function DataSourceBadge({ source }: { source: DataSourceKind }) {
  const config = sourceConfig[source]
  return <StatusBadge {...config} />
}
