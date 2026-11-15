import { CircleCheck, CircleHelp, MinusCircle } from 'lucide-react'
import { StatusBadge, type BadgeTone } from './StatusBadge'
import type { DataQuality } from './types'

const qualityConfig: Record<
  DataQuality,
  { label: string; icon: typeof CircleCheck; tone: BadgeTone }
> = {
  adequate: { label: 'Calidad: Adecuada', icon: CircleCheck, tone: 'teal' },
  unknown: { label: 'Calidad: Desconocida', icon: CircleHelp, tone: 'amber' },
  not_applicable: { label: 'Calidad: No aplica', icon: MinusCircle, tone: 'neutral' },
}

export function QualityBadge({ quality }: { quality: DataQuality }) {
  const config = qualityConfig[quality]
  return <StatusBadge {...config} />
}
