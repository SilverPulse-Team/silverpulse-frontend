import { X } from 'lucide-react'
import { useEffect, useId, useRef } from 'react'
import type { Observation } from '../../types'
import { DataSourceBadge, MissionPhaseBadge, QualityBadge, TimeStamp } from '../ui'

interface ObservationDetailsProps {
  observation: Observation | null
  onClose: () => void
}

export function ObservationDetails({ observation, onClose }: ObservationDetailsProps) {
  const titleId = useId()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!observation) return

    const previousOverflow = document.body.style.overflow
    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
      triggerRef.current?.focus()
      triggerRef.current = null
    }
  }, [observation, onClose])

  if (!observation) return null

  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      <button type="button" className="absolute inset-0 bg-deep-space/75" aria-label="Cerrar detalle" onClick={onClose} />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative h-full w-full max-w-xl overflow-y-auto border-l border-line bg-card p-5 shadow-2xl sm:p-6"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 grid size-11 place-items-center rounded-control text-muted hover:bg-canvas hover:text-ink"
          aria-label="Cerrar"
        >
          <X aria-hidden="true" className="size-5" />
        </button>

        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-nasa-blue">Registro normalizado por API</p>
        <h2 id={titleId} className="mt-2 pr-12 text-xl font-semibold text-ink">Detalle {observation.id}</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Solo se muestran campos incluidos en la observación recibida. No existe archivo original ni señal cruda en este contrato.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <DataSourceBadge source={observation.source_kind} />
          <QualityBadge quality={observation.quality} />
          <MissionPhaseBadge phase={observation.phase} />
          {observation.is_synthetic && (
            <span className="inline-flex min-h-7 items-center rounded-full border border-notice/30 bg-notice/10 px-2.5 py-1 text-xs font-semibold text-ink">
              DATO SINTÉTICO · DEMO
            </span>
          )}
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <DetailField label="Astronauta" value={observation.astronaut_id} />
          <DetailField label="Métrica" value={observation.metric_code} />
          <DetailField label="Valor" value={`${observation.value} ${observation.unit}`} />
          <DetailField label="ID de fuente" value={observation.source_id} />
          {observation.device_model && <DetailField label="Modelo de dispositivo" value={observation.device_model} />}
          {observation.activity_context && <DetailField label="Contexto de actividad" value={observation.activity_context} />}
        </dl>

        <div className="mt-6 rounded-control border border-line bg-canvas p-4">
          <TimeStamp value={observation.observed_at_utc} label="Fecha de observación UTC" />
          <p className="mt-2 text-xs leading-5 text-muted">
            La respuesta no incluye fecha de sincronización; no se sustituye con la fecha de observación.
          </p>
        </div>
      </section>
    </div>
  )
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-control border border-line p-4">
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-2 break-words text-sm font-medium text-ink">{value}</dd>
    </div>
  )
}
