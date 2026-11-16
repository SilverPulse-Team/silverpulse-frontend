import { CircleDot, Earth, Rocket } from 'lucide-react'
import { StatusBadge, type BadgeTone } from './StatusBadge'
import type { MissionPhase } from './types'

const phaseConfig: Record<
  MissionPhase,
  { label: string; icon: typeof Rocket; tone: BadgeTone }
> = {
  preflight: { label: 'Fase: Pre-vuelo', icon: Earth, tone: 'neutral' },
  inflight: { label: 'Fase: Durante vuelo', icon: Rocket, tone: 'blue' },
  postflight: { label: 'Fase: Post-vuelo', icon: CircleDot, tone: 'teal' },
}

export function MissionPhaseBadge({ phase }: { phase: MissionPhase }) {
  const config = phaseConfig[phase]
  return <StatusBadge {...config} />
}
