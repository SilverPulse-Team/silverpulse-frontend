import { CalendarDays, ExternalLink, RefreshCw, Rocket, Upload } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { getDataProvider } from '../../services'
import type { AnalysisSession, AnalysisSessionList, Astronaut, GuidedQuestion, MissionPhase } from '../../types'
import { AssistantQuickReplies } from './AssistantQuickReplies'
import { AssistantWindow } from './AssistantWindow'
import type { AssistantMessageData } from './types'

type Stage = 'welcome' | 'astronaut' | 'date' | 'phase' | 'sessions' | 'session'
type Intent = 'new' | 'resume'

interface Props { open: boolean; onClose: () => void }

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'No fue posible completar la operación.'
}

function statusLabel(status: AnalysisSession['status']) {
  return ({
    awaiting_answers: 'respuestas pendientes', ready: 'lista para analizar', completed: 'completada',
    partial: 'resultado parcial', insufficient_evidence: 'evidencia insuficiente', failed: 'fallida',
  })[status]
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

export function ShipAssistant({ open, onClose }: Props) {
  const provider = useMemo(() => getDataProvider(), [])
  const navigate = useNavigate()
  const location = useLocation()
  const [stage, setStage] = useState<Stage>('welcome')
  const [intent, setIntent] = useState<Intent>('new')
  const [astronauts, setAstronauts] = useState<Astronaut[]>([])
  const [astronautId, setAstronautId] = useState('')
  const [dateUtc, setDateUtc] = useState(() => new Date().toISOString().slice(0, 10))
  const [phase, setPhase] = useState<MissionPhase>('inflight')
  const [sessions, setSessions] = useState<AnalysisSessionList | null>(null)
  const [session, setSession] = useState<AnalysisSession | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const loadSession = useCallback((analysisId: string) => {
    setBusy(true); setError('')
    provider.getAnalysis(analysisId)
      .then((value) => { setSession(value); setAstronautId(value.astronaut_id); setDateUtc(value.date_utc); setPhase(value.phase); setStage('session') })
      .catch((reason: unknown) => setError(errorMessage(reason)))
      .finally(() => setBusy(false))
  }, [provider])

  useEffect(() => {
    const analysisId = new URLSearchParams(location.search).get('id')
    if (location.pathname !== '/astronaut/analysis' || !analysisId) return
    let active = true
    provider.getAnalysis(analysisId).then((value) => {
      if (!active) return
      setSession(value); setAstronautId(value.astronaut_id); setDateUtc(value.date_utc); setPhase(value.phase); setStage('session')
    }).catch((reason: unknown) => { if (active) setError(errorMessage(reason)) })
    return () => { active = false }
  }, [location.pathname, location.search, provider])

  const chooseAstronaut = (id: string, nextIntent = intent) => {
    setAstronautId(id); setError('')
    if (nextIntent === 'new') { setStage('date'); return }
    setBusy(true)
    provider.getAnalyses({ astronaut_id: id, limit: 10, offset: 0 })
      .then((value) => { setSessions(value); setStage('sessions') })
      .catch((reason: unknown) => setError(errorMessage(reason)))
      .finally(() => setBusy(false))
  }

  const begin = (nextIntent: Intent) => {
    setIntent(nextIntent); setBusy(true); setError('')
    provider.getShipAstronauts()
      .then((items) => {
        setAstronauts(items)
        if (items.length === 1) chooseAstronaut(items[0].id, nextIntent)
        else setStage('astronaut')
      })
      .catch((reason: unknown) => setError(errorMessage(reason)))
      .finally(() => setBusy(false))
  }

  const createSession = (selectedPhase = phase) => {
    setBusy(true); setError('')
    provider.createAnalysis({ astronaut_id: astronautId, date_utc: dateUtc, phase: selectedPhase, question: null })
      .then((value) => { setSession(value); setStage('session') })
      .catch((reason: unknown) => setError(errorMessage(reason)))
      .finally(() => setBusy(false))
  }

  const saveAnswer = (question: GuidedQuestion, answer: string) => {
    if (!session) return
    setBusy(true); setError('')
    provider.saveAnalysisAnswers(session.analysis_id, { [question.id]: answer })
      .then(setSession)
      .catch((reason: unknown) => setError(errorMessage(reason)))
      .finally(() => setBusy(false))
  }

  const refresh = () => {
    if (!session) return
    setBusy(true); setError('')
    provider.refreshAnalysis(session.analysis_id).then(setSession)
      .catch((reason: unknown) => setError(errorMessage(reason))).finally(() => setBusy(false))
  }

  const run = () => {
    if (!session) return
    setBusy(true); setError('')
    provider.runAnalysis(session.analysis_id).then(setSession)
      .catch((reason: unknown) => setError(errorMessage(reason))).finally(() => setBusy(false))
  }

  const reset = () => { setStage('welcome'); setSession(null); setSessions(null); setError('') }
  const go = (path: string) => { onClose(); navigate(path) }

  const currentQuestion = session?.guided_questions.find((question) => session.guided_answers[question.id] === undefined)
  const unresolvedRepeat = session
    ? Object.entries(session.guided_answers).some(([id, answer]) => answer === 'Ya la repeti' && !session.decision1.repeat_resolutions[id])
    : false

  const messages = useMemo<AssistantMessageData[]>(() => {
    const list: AssistantMessageData[] = [{
      id: 'welcome', role: 'assistant',
      content: 'Puedo revisar observaciones sintéticas persistidas, guiar Decision 1 y ejecutar Zoeh cuando exista evidencia suficiente. No diagnostico ni autorizo decisiones clínicas.',
    }]
    if (astronautId) list.push({ id: 'astronaut-selected', role: 'user', label: 'Astronauta', content: astronautId })
    if (stage === 'date' || stage === 'phase' || stage === 'session') {
      list.push({ id: 'date', role: 'user', label: 'Día UTC', content: dateUtc })
    }
    if (stage === 'session' && session) {
      list.push({ id: 'phase', role: 'user', label: 'Fase', content: phase })
      list.push({ id: 'snapshot', role: 'assistant', content: (
        <div className="space-y-2">
          <p className="font-semibold">Sesión {session.analysis_id}</p>
          <p>Decision 1 encontró <strong>{session.decision1.reliable_count}</strong> lecturas confiables, <strong>{session.decision1.unverified_count}</strong> no verificadas y <strong>{session.decision1.missing_count}</strong> faltantes.</p>
          <p className="text-xs text-muted">Snapshot {session.snapshot.revision} · {statusLabel(session.status)} · {session.provenance.all_synthetic === true ? 'datos sintéticos' : 'procedencia mixta o no sintética'}</p>
        </div>
      ) })
      for (const question of session.guided_questions) {
        list.push({ id: `q-${question.id}`, role: 'assistant', label: `Decision 1 · ${question.id}`, content: question.text })
        const answer = session.guided_answers[question.id]
        if (answer !== undefined) list.push({ id: `a-${question.id}`, role: 'user', content: answer })
      }
      if (unresolvedRepeat) list.push({ id: 'repeat-help', role: 'system', content: '“Ya la repetí” no crea una medición. Importa una observación nueva y después actualiza las lecturas de esta sesión.' })
      if (session.status === 'insufficient_evidence') list.push({ id: 'insufficient', role: 'system', content: 'El backend se abstuvo: no hay evidencia confiable suficiente para ejecutar Zoeh.' })
      if (session.orchestrator.executed) {
        const coverage = session.orchestrator.coverage
        const observed = stringArray(coverage.observed_features)
        const missing = stringArray(coverage.missing_features)
        const explanation = typeof session.orchestrator.results.explanation === 'string' ? session.orchestrator.results.explanation : null
        list.push({ id: 'zoeh-result', role: 'assistant', label: 'Resultado Zoeh', content: (
          <div className="space-y-2">
            <p className="font-semibold">{session.status === 'partial' ? 'Análisis parcial' : 'Análisis completado'}</p>
            <p>Variables analizadas: {observed.length ? observed.join(', ') : 'ninguna reportada'}.</p>
            {missing.length > 0 && <p>Omitidas por ausencia: {missing.join(', ')}.</p>}
            <p className="text-xs text-muted">Modo: {session.orchestrator.execution_mode}{session.orchestrator.fallback_reason ? ` · ${session.orchestrator.fallback_reason}` : ''}</p>
            {explanation && <p>{explanation}</p>}
          </div>
        ) })
      }
      if (session.post_analysis_questions.length > 0) list.push({
        id: 'post-questions', role: 'system', content: (
          <div><p className="font-semibold">Preguntas posteriores informativas</p><ul className="mt-1 list-disc pl-4">{session.post_analysis_questions.map((item) => <li key={item}>{item}</li>)}</ul><p className="mt-1">Este prototipo no dispone de un endpoint para responderlas.</p></div>
        ),
      })
    }
    if (error) list.push({ id: 'error', role: 'system', content: error })
    return list
  }, [astronautId, dateUtc, error, phase, session, stage, unresolvedRepeat])

  let controls
  if (stage === 'welcome') controls = <AssistantQuickReplies disabled={busy} replies={[{ id: 'new', label: 'Iniciar análisis' }, { id: 'resume', label: 'Continuar sesión' }]} onSelect={(reply) => begin(reply.id as Intent)} />
  else if (stage === 'astronaut') controls = astronauts.length ? <AssistantQuickReplies disabled={busy} label="Seleccionar astronauta" replies={astronauts.map((item) => ({ id: item.id, label: `${item.display_name} · ${item.id}` }))} onSelect={(reply) => chooseAstronaut(reply.id)} /> : <p className="text-sm text-muted">No hay astronautas disponibles.</p>
  else if (stage === 'date') controls = <div className="flex items-end gap-2"><label className="min-w-0 flex-1 text-xs font-semibold text-muted">Día UTC<input type="date" value={dateUtc} onChange={(event) => setDateUtc(event.target.value)} className="sp-field mt-1 w-full rounded-control border border-line px-3 text-sm text-ink" /></label><button type="button" onClick={() => setStage('phase')} className="inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-control bg-nasa-blue px-3 text-sm font-semibold text-white"><CalendarDays aria-hidden="true" className="size-4" />Continuar</button></div>
  else if (stage === 'phase') controls = <AssistantQuickReplies disabled={busy} label="Seleccionar fase" replies={[{ id: 'preflight', label: 'Pre-vuelo' }, { id: 'inflight', label: 'Durante vuelo' }, { id: 'postflight', label: 'Post-vuelo' }]} onSelect={(reply) => { const selected = reply.id as MissionPhase; setPhase(selected); createSession(selected) }} />
  else if (stage === 'sessions') controls = <div className="space-y-2">{sessions && sessions.items.length > 0 ? <AssistantQuickReplies disabled={busy} label="Sesiones anteriores" replies={sessions.items.slice(0, 5).map((item) => ({ id: item.analysis_id, label: `${item.date_utc} · ${statusLabel(item.status)}` }))} onSelect={(reply) => loadSession(reply.id)} /> : <p className="text-sm text-muted">No hay sesiones previas para esta persona.</p>}<button type="button" onClick={() => { setIntent('new'); setStage('date') }} className="min-h-11 whitespace-nowrap text-sm font-semibold text-nasa-blue">Iniciar nuevo análisis</button></div>
  else if (session && currentQuestion) controls = <AssistantQuickReplies disabled={busy} label={currentQuestion.text} replies={currentQuestion.options.map((option) => ({ id: option, label: option }))} onSelect={(reply) => saveAnswer(currentQuestion, reply.id)} />
  else if (session && unresolvedRepeat) controls = <div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => go(`/astronaut/import?analysis=${encodeURIComponent(session.analysis_id)}`)} className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-control border border-line px-3 text-sm font-semibold"><Upload aria-hidden="true" className="size-4" />Importar</button><button type="button" disabled={busy} onClick={refresh} className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-control bg-nasa-blue px-3 text-sm font-semibold text-white"><RefreshCw aria-hidden="true" className="size-4" />Actualizar</button></div>
  else if (session && session.decision1.reliable_count === 0 && !session.orchestrator.executed) controls = <div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => go(`/astronaut/import?analysis=${encodeURIComponent(session.analysis_id)}`)} className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-control bg-nasa-blue px-3 text-sm font-semibold text-white"><Upload aria-hidden="true" className="size-4" />Importar</button><button type="button" onClick={refresh} disabled={busy} className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-control border border-line px-3 text-sm font-semibold"><RefreshCw aria-hidden="true" className="size-4" />Actualizar</button></div>
  else if (session && session.status === 'ready' && !session.orchestrator.executed) controls = <button type="button" disabled={busy} onClick={run} className="inline-flex min-h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-control bg-nasa-blue px-4 text-sm font-semibold text-white"><Rocket aria-hidden="true" className="size-4" />Analizar observaciones</button>
  else if (session) controls = <div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => go(`/astronaut/analysis?id=${encodeURIComponent(session.analysis_id)}`)} className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-control border border-line px-3 text-sm font-semibold"><ExternalLink aria-hidden="true" className="size-4" />Abrir detalle</button><button type="button" onClick={reset} className="min-h-11 whitespace-nowrap rounded-control bg-nasa-blue px-3 text-sm font-semibold text-white">Nuevo análisis</button></div>

  return <AssistantWindow open={open} variant="ship" messages={messages} controls={controls} busy={busy} onClose={onClose} />
}
