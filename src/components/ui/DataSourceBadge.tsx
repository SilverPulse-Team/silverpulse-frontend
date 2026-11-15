import { ClipboardPenLine, Database, FlaskConical, Orbit, Stethoscope, Watch } from 'lucide-react'
import { StatusBadge, type BadgeTone } from './StatusBadge'
import type { DataSourceKind } from './types'

const sourceConfig: Record<
  DataSourceKind,
  { label: string; icon: typeof Database; tone: BadgeTone }
> = {
  synthetic: { label: 'Fuente: Sintético', icon: FlaskConical, tone: 'blue' },
  public_dataset: { label: 'Fuente: Dataset público', icon: Database, tone: 'neutral' },
  wearable: { label: 'Fuente: Wearable', icon: Watch, tone: 'teal' },
  clinical_assessment: { label: 'Fuente: Evaluación clínica', icon: Stethoscope, tone: 'amber' },
  manual: { label: 'Fuente: Registro manual', icon: ClipboardPenLine, tone: 'neutral' },
  mission_context: { label: 'Fuente: Contexto de misión', icon: Orbit, tone: 'blue' },
}

export function DataSourceBadge({ source }: { source: string }) {
  const config = sourceConfig[source as DataSourceKind] ?? {
    label: `Fuente: ${source}`,
    icon: Database,
    tone: 'neutral' as const,
  }
  return <StatusBadge {...config} />
}
