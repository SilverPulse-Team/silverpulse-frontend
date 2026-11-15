import { CalendarDays, CheckCircle2, ClipboardCheck, UserRoundCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import type { CountermeasureLogInput, CountermeasurePlan } from '../../types'
import { PrimaryButton } from '../ui'
import { validateCountermeasureLog, type CountermeasureLogFormValues } from './countermeasureValidation'

interface CountermeasurePanelProps {
  plans: CountermeasurePlan[]
  optionalUnavailable?: boolean
  onLog: (input: CountermeasureLogInput) => Promise<void>
}

interface FormState {
  values: CountermeasureLogFormValues
  submitting: boolean
  error: string | null
  success: string | null
}

function initialValues(): CountermeasureLogFormValues {
  return { completedAt: '', duration: '', selfReported: true, notes: '' }
}

function CountermeasureCard({ plan, onLog }: { plan: CountermeasurePlan; onLog: CountermeasurePanelProps['onLog'] }) {
  const [state, setState] = useState<FormState>({ values: initialValues(), submitting: false, error: null, success: null })

  const update = <K extends keyof CountermeasureLogFormValues>(key: K, value: CountermeasureLogFormValues[K]) => {
    setState((current) => ({ ...current, values: { ...current.values, [key]: value }, error: null, success: null }))
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (state.submitting) return
    const input = validateCountermeasureLog(plan.id, state.values)
    if (typeof input === 'string') {
      setState((current) => ({ ...current, error: input, success: null }))
      return
    }

    setState((current) => ({ ...current, submitting: true, error: null, success: null }))
    try {
      await onLog(input)
      setState({ values: initialValues(), submitting: false, error: null, success: 'Cumplimiento registrado y conteo actualizado.' })
    } catch (error) {
      setState((current) => ({
        ...current,
        submitting: false,
        error: error instanceof Error ? error.message : 'No fue posible registrar el cumplimiento.',
      }))
    }
  }

  return (
    <article className="rounded-card border border-line bg-card p-5 shadow-card lg:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-nasa-blue">Plan humano existente · DEMO</p>
          <h3 className="mt-1 text-lg font-semibold text-ink">{plan.title}</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{plan.description}</p>
        </div>
        <div className="rounded-control border border-data/25 bg-data/10 px-3 py-2 text-sm font-semibold text-nasa-blue">
          {plan.logs_completed} completadas · {plan.planned_sessions} programadas
        </div>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="flex gap-3 rounded-control border border-line bg-canvas p-3">
          <UserRoundCheck aria-hidden="true" className="size-5 shrink-0 text-data" />
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Autorizado por</dt><dd className="mt-1 text-sm font-semibold text-ink">{plan.authorized_by}</dd></div>
        </div>
        <div className="flex gap-3 rounded-control border border-line bg-canvas p-3">
          <CalendarDays aria-hidden="true" className="size-5 shrink-0 text-data" />
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Rango del plan</dt><dd className="mt-1 text-sm font-semibold text-ink">{plan.start_date} — {plan.end_date ?? 'Sin fecha final'}</dd></div>
        </div>
      </dl>

      <form onSubmit={submit} className="mt-5 border-t border-line pt-5" noValidate>
        <h4 className="font-semibold text-ink">Registrar actividad completada</h4>
        <p className="mt-1 text-sm text-muted">Declara cumplimiento de este plan; no crea ni modifica una prescripción.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="text-sm font-semibold text-ink">Fecha y hora
            <input type="datetime-local" value={state.values.completedAt} onChange={(event) => update('completedAt', event.target.value)} className="sp-field mt-2 w-full rounded-control border border-line bg-card px-3" required />
          </label>
          <label className="text-sm font-semibold text-ink">Duración (min)
            <input type="number" min="1" step="1" value={state.values.duration} onChange={(event) => update('duration', event.target.value)} className="sp-field mt-2 w-full rounded-control border border-line bg-card px-3" required />
          </label>
          <label className="text-sm font-semibold text-ink md:col-span-2">Notas opcionales
            <input type="text" value={state.values.notes} onChange={(event) => update('notes', event.target.value)} className="sp-field mt-2 w-full rounded-control border border-line bg-card px-3" maxLength={500} />
          </label>
        </div>
        <label className="mt-4 flex min-h-11 items-center gap-3 text-sm text-ink">
          <input type="checkbox" checked={state.values.selfReported} onChange={(event) => update('selfReported', event.target.checked)} className="size-4 accent-nasa-blue" />
          Cumplimiento declarado por la persona usuaria
        </label>
        {state.error && <p role="alert" className="mt-3 text-sm font-semibold text-nasa-red">{state.error}</p>}
        {state.success && <p role="status" className="mt-3 flex items-center gap-2 text-sm font-semibold text-coverage"><CheckCircle2 aria-hidden="true" className="size-4" />{state.success}</p>}
        <PrimaryButton type="submit" isSubmitting={state.submitting} className="mt-4">
          <ClipboardCheck aria-hidden="true" className="size-4" /> Registrar cumplimiento
        </PrimaryButton>
      </form>
    </article>
  )
}

export function CountermeasurePanel({ plans, optionalUnavailable = false, onLog }: CountermeasurePanelProps) {
  return (
    <section aria-labelledby="countermeasures-title">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-nasa-blue">Extensión P1</p>
        <h2 id="countermeasures-title" className="mt-1 text-xl font-semibold text-ink">Contramedidas autorizadas</h2>
        <p className="mt-1 text-sm leading-6 text-muted">Seguimiento declarado; no equivale a valoración de condición física ni demuestra eficacia clínica.</p>
      </div>
      {optionalUnavailable ? (
        <div className="rounded-card border border-dashed border-line bg-card p-5 text-sm leading-6 text-muted">El endpoint P1 no está disponible. Esta extensión no bloquea la matriz P0.</div>
      ) : plans.length === 0 ? (
        <div className="rounded-card border border-dashed border-line bg-card p-5 text-sm leading-6 text-muted">No hay planes humanos autorizados. SilverPulse no crea uno automáticamente.</div>
      ) : (
        <div className="space-y-4">{plans.map((plan) => <CountermeasureCard key={plan.id} plan={plan} onLog={onLog} />)}</div>
      )}
    </section>
  )
}
