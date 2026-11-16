import { BrainCircuit, RefreshCw, Rocket, Save } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { GuidedQuestionsPanel } from '../components/analysis/GuidedQuestionsPanel'
import { AnalysisResultsPanel } from '../components/analysis/AnalysisResultsPanel'
import { PageHeader } from '../components/layout/PageHeader'
import { AlertNotice, EmptyState, ErrorState, LoadingSkeleton, PrimaryButton, SecondaryButton } from '../components/ui'
import { getDataProvider } from '../services'
import type { AnalysisSession, Astronaut, MissionPhase } from '../types'

type LoadState = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready'; astronauts: Astronaut[] }
const phaseOptions: Array<{ value: MissionPhase; label: string }> = [
  { value: 'preflight', label: 'Pre-vuelo' }, { value: 'inflight', label: 'Durante vuelo' }, { value: 'postflight', label: 'Post-vuelo' },
]
const fieldClass = 'sp-field mt-1.5 w-full rounded-control border border-line bg-card px-3 text-sm text-ink focus:border-nasa-blue'

function message(error: unknown) {
  return error instanceof Error ? error.message : 'La operación no pudo completarse.'
}

function statusLabel(status: AnalysisSession['status']) {
  return ({ awaiting_answers: 'Respuestas pendientes', ready: 'Lista para ejecutar', completed: 'Completada', partial: 'Parcial', insufficient_evidence: 'Evidencia insuficiente', failed: 'Fallida' })[status]
}

export function AnalysisPage() {
  const provider = useMemo(() => getDataProvider(), [])
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const sessionId = params.get('id')
  const [load, setLoad] = useState<LoadState>({ status: 'loading' })
  const [session, setSession] = useState<AnalysisSession | null>(null)
  const [astronautId, setAstronautId] = useState('')
  const [dateUtc, setDateUtc] = useState(() => new Date().toISOString().slice(0, 10))
  const [phase, setPhase] = useState<MissionPhase>('inflight')
  const [question, setQuestion] = useState('')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState<'create' | 'save' | 'refresh' | 'run' | null>(null)
  const [operationError, setOperationError] = useState('')

  const loadContext = useCallback(async () => {
    setLoad({ status: 'loading' })
    try {
      const astronauts = await provider.getShipAstronauts()
      setLoad({ status: 'ready', astronauts })
      if (astronauts.length === 1) setAstronautId(astronauts[0].id)
    } catch (error) { setLoad({ status: 'error', message: message(error) }) }
  }, [provider])

  useEffect(() => {
    let active = true
    provider.getShipAstronauts().then((astronauts) => {
      if (!active) return
      setLoad({ status: 'ready', astronauts })
      if (astronauts.length === 1) setAstronautId(astronauts[0].id)
    }).catch((error: unknown) => { if (active) setLoad({ status: 'error', message: message(error) }) })
    return () => { active = false }
  }, [provider])
  useEffect(() => {
    if (!sessionId) return
    let active = true
    provider.getAnalysis(sessionId).then((value) => {
      if (!active) return
      setSession(value); setAnswers(value.guided_answers); setAstronautId(value.astronaut_id)
      setDateUtc(value.date_utc); setPhase(value.phase); setQuestion(value.question ?? '')
    }).catch((error: unknown) => { if (active) setOperationError(message(error)) })
    return () => { active = false }
  }, [provider, sessionId])

  const replaceSession = (value: AnalysisSession) => { setSession(value); setAnswers(value.guided_answers); setOperationError('') }
  const act = async (kind: NonNullable<typeof busy>, operation: () => Promise<AnalysisSession>) => {
    setBusy(kind); setOperationError('')
    try { replaceSession(await operation()) } catch (error) { setOperationError(message(error)) } finally { setBusy(null) }
  }
  const create = async () => {
    if (!astronautId) { setOperationError('Selecciona explícitamente un astronauta.'); return }
    setBusy('create'); setOperationError('')
    try {
      const value = await provider.createAnalysis({ astronaut_id: astronautId, date_utc: dateUtc, phase, question: question.trim() || null })
      replaceSession(value); navigate(`/astronaut/analysis?id=${encodeURIComponent(value.analysis_id)}`, { replace: true })
    } catch (error) { setOperationError(message(error)) } finally { setBusy(null) }
  }

  if (load.status === 'loading') return <LoadingSkeleton rows={7} label="Cargando análisis" />
  if (load.status === 'error') return <ErrorState message={load.message} onRetry={() => void loadContext()} />
  if (load.astronauts.length === 0) return <EmptyState title="Sin astronautas" description="La API no devolvió personas ficticias disponibles." />

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Entorno nave" title="Análisis guiado" description="Decision 1 revisa lecturas persistidas antes de que Zoeh ejecute componentes con cobertura real. No es una evaluación clínica." badge={provider.metadata.mode === 'mock' ? <span className="rounded-full bg-notice/15 px-3 py-1 text-xs font-semibold">Mock: análisis no disponible</span> : undefined} />
      <section className="rounded-card border border-line bg-card p-5 shadow-card sm:p-6" aria-labelledby="selection-title">
        <div className="flex items-center gap-3"><BrainCircuit aria-hidden="true" className="size-5 text-nasa-blue" /><h2 id="selection-title" className="text-lg font-semibold">Selección UTC</h2></div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <label className="text-sm font-medium">Astronauta
            <select className={fieldClass} value={astronautId} onChange={(event) => setAstronautId(event.target.value)} disabled={Boolean(session)}>
              {load.astronauts.length > 1 && <option value="">Selecciona una persona</option>}
              {load.astronauts.map((astronaut) => <option key={astronaut.id} value={astronaut.id}>{astronaut.display_name} · {astronaut.id}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium">Día UTC<input className={fieldClass} type="date" value={dateUtc} onChange={(event) => setDateUtc(event.target.value)} disabled={Boolean(session)} /></label>
          <label className="text-sm font-medium">Fase<select className={fieldClass} value={phase} onChange={(event) => setPhase(event.target.value as MissionPhase)} disabled={Boolean(session)}>{phaseOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        </div>
        <label className="mt-4 block text-sm font-medium">Pregunta opcional<textarea className="mt-1.5 min-h-24 w-full rounded-control border border-line bg-card p-3 text-sm" value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={1000} disabled={Boolean(session)} /></label>
        {!session && <PrimaryButton type="button" onClick={() => void create()} isSubmitting={busy === 'create'} className="mt-5 w-full sm:w-auto"><Save aria-hidden="true" className="size-4" />Crear o reanudar</PrimaryButton>}
      </section>

      {operationError && <ErrorState message={operationError} onRetry={sessionId ? () => void act('refresh', () => provider.getAnalysis(sessionId)) : undefined} />}
      {session && (
        <>
          <section className="rounded-card border border-line bg-card p-5 shadow-card sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div><p className="text-xs font-semibold uppercase tracking-wider text-nasa-blue">{session.analysis_id}</p><h2 className="mt-1 text-lg font-semibold">{statusLabel(session.status)}</h2><p className="mt-1 text-sm text-muted">Snapshot {session.snapshot.revision} · actualizado {new Date(session.updated_at_utc).toLocaleString('es', { timeZone: 'UTC' })} UTC</p></div>
              <SecondaryButton type="button" onClick={() => void act('refresh', () => provider.refreshAnalysis(session.analysis_id))} isSubmitting={busy === 'refresh'} disabled={busy !== null}><RefreshCw aria-hidden="true" className="size-4" />Buscar lecturas nuevas</SecondaryButton>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 text-center"><Count label="Confiables" value={session.decision1.reliable_count} /><Count label="No verificadas" value={session.decision1.unverified_count} /><Count label="Faltantes" value={session.decision1.missing_count} /></div>
            {session.decision1.readings.length > 0 ? <ul className="mt-5 divide-y divide-line border-y border-line">{session.decision1.readings.map((reading) => <li key={reading.id} className="grid gap-1 py-3 text-sm sm:grid-cols-[1fr_auto]"><span className="font-medium">{reading.metric_code}: {reading.value ?? 'sin dato'} {reading.unit}</span><span className="text-muted">{reading.check.status} · {reading.check.reason}</span></li>)}</ul> : <div className="mt-5"><EmptyState title="Sin lecturas para ese día" description="La sesión se conserva, pero Zoeh no se ejecutará sin evidencia suficiente." /></div>}
          </section>
          <GuidedQuestionsPanel questions={session.guided_questions} answers={answers} analysisId={session.analysis_id} disabled={busy !== null || ['completed', 'partial'].includes(session.status)} saving={busy === 'save'} onChange={(id, value) => setAnswers((current) => ({ ...current, [id]: value }))} onSave={() => void act('save', () => provider.saveAnalysisAnswers(session.analysis_id, answers))} />
          {session.status === 'insufficient_evidence' && <AlertNotice title="Evidencia insuficiente" tone="notice">El backend se abstuvo de ejecutar Zoeh. Importa observaciones válidas y crea o refresca una sesión según corresponda.</AlertNotice>}
          {!session.orchestrator.executed && session.status !== 'insufficient_evidence' && <PrimaryButton type="button" disabled={session.status !== 'ready' || busy !== null} isSubmitting={busy === 'run'} onClick={() => void act('run', () => provider.runAnalysis(session.analysis_id))} className="w-full sm:w-auto"><Rocket aria-hidden="true" className="size-4" />Ejecutar análisis</PrimaryButton>}
          <AnalysisResultsPanel session={session} />
          <AlertNotice title="Limitaciones"> <ul className="list-disc pl-5">{session.limitations.map((item) => <li key={item}>{item}</li>)}</ul></AlertNotice>
        </>
      )}
    </div>
  )
}

function Count({ label, value }: { label: string; value: number }) {
  return <div className="rounded-control bg-canvas p-3"><strong className="block text-xl text-ink">{value}</strong><span className="text-xs text-muted">{label}</span></div>
}
