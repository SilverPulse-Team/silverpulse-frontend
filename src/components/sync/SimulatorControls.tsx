import { Clock3, Link2, Settings2 } from 'lucide-react'
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
    <section aria-labelledby="simulator-controls-title" className="min-w-0 rounded-card border border-line bg-card p-4 shadow-card sm:p-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-nasa-blue/10 text-nasa-blue"><Link2 aria-hidden="true" className="size-5" /></span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-nasa-blue">Acciones del simulador</p>
            <h2 id="simulator-controls-title" className="mt-1 text-lg font-semibold text-ink">Configurar enlace</h2>
            <p className="mt-1 text-sm leading-5 text-muted">Configurar no confirma entrega; el ACK se verifica por separado.</p>
          </div>
        </div>
        <span className="rounded-full border border-nasa-blue/25 bg-nasa-blue/5 px-3 py-1 text-xs font-semibold text-nasa-blue">Actual: {status.mode}</span>
      </header>

      {notice && <p role="status" className="mt-4 rounded-control border border-coverage/30 bg-coverage/5 p-3 text-sm text-ink">{notice}</p>}
      {error && <p role="alert" className="mt-4 rounded-control border border-nasa-red/30 bg-nasa-red/5 p-3 text-sm text-ink">{error}</p>}

      <form className="mt-5 space-y-4" onSubmit={submitConfig} aria-label="Configurar enlace simulado">
        <div className="grid gap-3 sm:grid-cols-2">
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
            className="sp-field rounded-control border border-line bg-white px-3"
          >
            <option value="offline">Offline</option>
            <option value="online">Online</option>
            <option value="delayed">Delayed</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-ink">
          Latencia unidireccional simulada (s)
          <input type="number" min="0" step="1" value={latency} onChange={(event) => setLatency(event.target.value)} aria-invalid={Boolean(configError)} className="sp-field rounded-control border border-line bg-white px-3" />
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-ink">
          Aceleración del tiempo (×)
          <input type="number" min="0.000001" step="any" value={acceleration} onChange={(event) => setAcceleration(event.target.value)} aria-invalid={Boolean(configError)} className="sp-field rounded-control border border-line bg-white px-3" />
        </label>
        </div>
        <div className="flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex min-h-11 items-center gap-3 rounded-control border border-line bg-canvas px-3 text-sm text-ink">
          <input type="checkbox" checked={dropAck} onChange={(event) => setDropAck(event.target.checked)} className="size-4 accent-nasa-blue" />
          Simular pérdida de ACK
        </label>
        <PrimaryButton type="submit" isSubmitting={isSubmitting === 'configure'} disabled={isSubmitting !== null}>
          <Settings2 aria-hidden="true" className="size-4" />Aplicar configuración
        </PrimaryButton>
        </div>
        {configError && <p role="alert" className="text-sm text-nasa-red">{configError}</p>}
      </form>

      <form onSubmit={submitStep} className="mt-4 rounded-card border border-line bg-canvas p-4" aria-label="Avanzar reloj de simulación">
        <div className="flex items-center gap-2"><Clock3 aria-hidden="true" className="size-5 text-nasa-blue" /><h3 className="font-semibold text-ink">Avanzar tiempo simulado</h3></div>
        <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <label className="grid gap-1.5 text-sm font-medium text-ink">
            Segundos
            <input type="number" min="1" max="86400" step="1" value={simulatedSeconds} onChange={(event) => setSimulatedSeconds(event.target.value)} aria-invalid={Boolean(stepError)} className="sp-field rounded-control border border-line bg-white px-3" />
          </label>
          <SecondaryButton type="submit" isSubmitting={isSubmitting === 'step'} disabled={isSubmitting !== null}>Avanzar simulación</SecondaryButton>
        </div>
        <div className="mt-3 flex flex-wrap gap-2" aria-label="Duraciones rápidas">
          {[['1200', '20 min'], ['3600', '1 hora'], ['21600', '6 horas']].map(([value, label]) => (
            <button key={value} type="button" onClick={() => setSimulatedSeconds(value)} className="min-h-9 rounded-full border border-line bg-card px-3 text-xs font-semibold text-ink hover:border-nasa-blue hover:text-nasa-blue">{label}</button>
          ))}
        </div>
        {stepError && <p role="alert" className="mt-2 text-sm text-nasa-red">{stepError}</p>}
      </form>
    </section>
  )
}
