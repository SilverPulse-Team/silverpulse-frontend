import { Activity } from 'lucide-react'
import { DataSourceBadge } from './DataSourceBadge'
import { MissionPhaseBadge } from './MissionPhaseBadge'
import { QualityBadge } from './QualityBadge'
import { TimeStamp } from './TimeStamp'
import type { MissionPhase } from './types'

interface MetricCardBase {
  label: string
  helperText?: string
}

interface MetricCardWithValue extends MetricCardBase {
  value: string | number
  unit: string
  source: string
  quality: string
  phase: MissionPhase
  observedAt: string | Date
}

interface MetricCardWithoutValue extends MetricCardBase {
  value: null
  quality?: string
  unit?: never
  source?: never
  phase?: never
  observedAt?: never
}

export type MetricCardProps = MetricCardWithValue | MetricCardWithoutValue

export function MetricCard(props: MetricCardProps) {
  const hasValue = props.value !== null

  return (
    <article className="rounded-card border border-line bg-card p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted">{props.label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            {hasValue ? props.value : 'Sin datos'}{' '}
            {hasValue && <span className="text-base font-medium text-muted">{props.unit}</span>}
          </p>
        </div>
        <span className="grid size-10 shrink-0 place-items-center rounded-control bg-data/10 text-data">
          <Activity aria-hidden="true" className="size-5" />
        </span>
      </div>

      {props.helperText && <p className="mt-3 text-sm leading-5 text-muted">{props.helperText}</p>}

      {hasValue ? (
        <div className="mt-4 space-y-3 border-t border-line pt-4">
          <div className="flex flex-wrap gap-2">
            <DataSourceBadge source={props.source} />
            <QualityBadge quality={props.quality} />
            <MissionPhaseBadge phase={props.phase} />
          </div>
          <TimeStamp value={props.observedAt} />
        </div>
      ) : (
        <div className="mt-4 space-y-3 border-t border-line pt-4">
          {props.quality && <QualityBadge quality={props.quality} />}
          <p className="text-sm text-muted">Evidencia insuficiente · unidad, fuente y fecha no disponibles</p>
        </div>
      )}
    </article>
  )
}
