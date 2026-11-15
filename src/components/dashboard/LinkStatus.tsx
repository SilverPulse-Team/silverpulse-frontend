import { Clock3, Radio, RadioTower, Unplug } from 'lucide-react'
import type { SimulatorStatus } from '../../types'
import { ErrorState, LoadingSkeleton, TimeStamp } from '../ui'
import { StatusBadge, type BadgeTone } from '../ui/StatusBadge'

const modeConfig: Record<
  SimulatorStatus['mode'],
  { label: string; description: string; icon: typeof Radio; tone: BadgeTone }
> = {
  online: {
    label: 'Enlace ONLINE',
    description: 'El simulador informa disponibilidad para transportar mensajes.',
    icon: RadioTower,
    tone: 'teal',
  },
  offline: {
    label: 'Enlace OFFLINE',
    description: 'El simulador informa el enlace desconectado; los mensajes pueden permanecer en cola.',
    icon: Unplug,
    tone: 'amber',
  },
  delayed: {
    label: 'Enlace DELAYED',
    description: 'El simulador informa transporte diferido con latencia configurada.',
    icon: Clock3,
    tone: 'blue',
  },
}

interface LinkStatusProps {
  status?: SimulatorStatus
  lastEarthSyncAt?: string | null
  loading?: boolean
  error?: string
  onRetry?: () => void
  embedded?: boolean
}

export function LinkModeBadge({ mode }: { mode: SimulatorStatus['mode'] }) {
  const config = modeConfig[mode]
  return <StatusBadge label={config.label} icon={config.icon} tone={config.tone} />
}

export function LinkStatus({ status, lastEarthSyncAt, loading, error, onRetry, embedded = false }: LinkStatusProps) {
  if (loading) return <LoadingSkeleton rows={3} label="Consultando estado del enlace con Tierra" />

  if (error) {
    return (
      <ErrorState
        title="API de comunicaciones inaccesible"
        message={`${error} No se asume que el enlace esté offline sin una respuesta del simulador.`}
        onRetry={onRetry}
      />
    )
  }

  if (!status) return null
  const config = modeConfig[status.mode]

  return (
    <section
      aria-labelledby="earth-link-title"
      className={
        embedded
          ? 'mt-5 rounded-control border border-line bg-canvas p-4'
          : 'rounded-card border border-line bg-card p-5 shadow-card'
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-nasa-blue">Comunicaciones</p>
          <h2 id="earth-link-title" className="mt-1 text-lg font-semibold text-ink">Estado del enlace</h2>
        </div>
        <LinkModeBadge mode={status.mode} />
      </div>
      <p className="mt-4 text-sm leading-6 text-muted">{config.description}</p>
      <p className="mt-2 text-sm font-medium text-ink">Este estado es logístico y no representa una condición médica.</p>

      <div className="mt-4 border-t border-line pt-4">
        {lastEarthSyncAt ? (
          <TimeStamp value={lastEarthSyncAt} label="Última sincronización con Tierra" />
        ) : (
          <p className="text-sm text-muted">Última sincronización: no informada por el overview.</p>
        )}
      </div>
    </section>
  )
}
