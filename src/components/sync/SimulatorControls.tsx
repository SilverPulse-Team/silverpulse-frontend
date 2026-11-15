import { useState, type FormEvent } from 'react'
import type { SimulatorConfigInput, SimulatorStatus } from '../../types'
import { PrimaryButton, SecondaryButton } from '../ui'
import { parseSimulatedSeconds, parseSimulatorConfigNumbers } from './simulatorValidation'

export type SimulatorOperation = 'configure' | 'step' | null

interface SimulatorControlsProps {
  status: SimulatorStatus
  isSubmitting: SimulatorOperation
  error?: string
  notice?: string
  onConfigure: (input: SimulatorConfigInput) => void
  onStep: (simulatedSeconds: number) => void
}

export function SimulatorControls({
  status,
  isSubmitting,
  error,
  notice,
  onConfigure,
  onStep,
}: SimulatorControlsProps) {
  const [mode, setMode] = useState<SimulatorConfigInput['mode']>(status.mode)
  const [latency, setLatency] = useState(String(status.one_way_latency_simulated_s))
  const [acceleration, setAcceleration] = useState(String(status.time_acceleration))
  const [dropAck, setDropAck] = useState(false)
  const [simulatedSeconds, setSimulatedSeconds] = useState('3600')
  const [configError, setConfigError] = useState<string>()
  const [stepError, setStepError] = useState<string>()

  const submitConfig = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const parsed = parseSimulatorConfigNumbers(latency, acceleration)
    if (!parsed.ok) {
      setConfigError([parsed.errors.latency, parsed.errors.acceleration].filter(Boolean).join(' '))
      return
    }

    setConfigError(undefined)
    onConfigure({
      mode,
      one_way_latency_simulated_s: parsed.one_way_latency_simulated_s,
      time_acceleration: parsed.time_acceleration,
      drop_ack: dropAck,
    })
  }

  const submitStep = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const parsed = parseSimulatedSeconds(simulatedSeconds)
    if (!parsed.ok) {
      setStepError(parsed.error)
      return
    }

    setStepError(undefined)
    onStep(parsed.value)
  }

  return (
    <section aria-labelledby="simulator-controls-title" className="rounded-card border border-line bg-card p-5 shadow-card lg:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-nasa-blue">Acciones del simulador</p>
      <h2 id="simulator-controls-title" className="mt-1 text-lg font-semibold text-ink">Estado del enlace</h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        Cambiar la configuración no confirma que se haya entregado un informe. La entrega requiere evidencia de recepción.
      </p>

      {notice && <p role="status" className="mt-4 rounded-control border border-coverage/30 bg-coverage/5 p-3 text-sm text-ink">{notice}</p>}
      {error && <p role="alert" className="mt-4 rounded-control border border-nasa-red/30 bg-nasa-red/5 p-3 text-sm text-ink">{error}</p>}

      <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={submitConfig} aria-label="Configurar enlace simulado">
        <label className="grid gap-1.5 text-sm font-medium text-ink">
          Modo del enlace
          <select
            value={mode}
            onChange={(event) => {
              const nextMode = event.target.value
              if (nextMode === 'online' || nextMode === 'offline' || nextMode === 'delayed') {
                setMode(nextMode)
              }
            }}
            className="min-h-11 rounded-control border border-line bg-white px-3"
          >
            <option value="offline">Offline</option>
            <option value="online">Online</option>
            <option value="delayed">Delayed</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-ink">
          Latencia unidireccional simulada (s)
          <input type="number" min="0" step="1" value={latency} onChange={(event) => setLatency(event.target.value)} aria-invalid={Boolean(configError)} className="min-h-11 rounded-control border border-line bg-white px-3" />
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-ink">
          Aceleración del tiempo (×)
          <input type="number" min="0.000001" step="any" value={acceleration} onChange={(event) => setAcceleration(event.target.value)} aria-invalid={Boolean(configError)} className="min-h-11 rounded-control border border-line bg-white px-3" />
        </label>
        <label className="flex min-h-11 items-center gap-3 rounded-control border border-line bg-canvas px-3 text-sm text-ink sm:mt-6">
          <input type="checkbox" checked={dropAck} onChange={(event) => setDropAck(event.target.checked)} className="size-4 accent-nasa-blue" />
          Simular pérdida de ACK
        </label>
        {configError && <p role="alert" className="text-sm text-nasa-red sm:col-span-2">{configError}</p>}
        <div className="sm:col-span-2">
          <PrimaryButton type="submit" isSubmitting={isSubmitting === 'configure'} disabled={isSubmitting !== null}>
            Aplicar configuración
          </PrimaryButton>
        </div>
      </form>

      <form onSubmit={submitStep} className="mt-5 grid gap-4 border-t border-line pt-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end" aria-label="Avanzar reloj de simulación">
        <label className="grid gap-1.5 text-sm font-medium text-ink">
          Avanzar reloj lógico (segundos simulados)
          <input type="number" min="1" max="86400" step="1" value={simulatedSeconds} onChange={(event) => setSimulatedSeconds(event.target.value)} aria-invalid={Boolean(stepError)} className="min-h-11 rounded-control border border-line bg-white px-3" />
          <span className="text-xs font-normal text-muted">Entero entre 1 y 86400 segundos.</span>
        </label>
        <SecondaryButton type="submit" isSubmitting={isSubmitting === 'step'} disabled={isSubmitting !== null}>
          Avanzar simulación
        </SecondaryButton>
        {stepError && <p role="alert" className="text-sm text-nasa-red sm:col-span-2">{stepError}</p>}
      </form>
    </section>
  )
}
