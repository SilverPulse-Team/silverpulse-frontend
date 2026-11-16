import { ExternalLink, FileCheck2, Inbox, Send } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { getDataProvider, type MedicalReviewResult } from '../../services'
import type { ListReports, Report } from '../../types'
import { AssistantQuickReplies } from './AssistantQuickReplies'
import { AssistantWindow } from './AssistantWindow'
import type { AssistantMessageData } from './types'

type Stage = 'welcome' | 'reports' | 'report' | 'note' | 'followup' | 'confirm' | 'done'
interface Props { open: boolean; onClose: () => void }

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'No fue posible completar la operación.'
}

export function EarthAssistant({ open, onClose }: Props) {
  const provider = useMemo(() => getDataProvider(), [])
  const location = useLocation()
  const navigate = useNavigate()
  const [stage, setStage] = useState<Stage>('welcome')
  const [reports, setReports] = useState<ListReports | null>(null)
  const [report, setReport] = useState<Report | null>(null)
  const [note, setNote] = useState('')
  const [followup, setFollowup] = useState(false)
  const [result, setResult] = useState<MedicalReviewResult | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const selectReport = useCallback((reportId: string) => {
    setBusy(true); setError('')
    provider.getEarthReport(reportId)
      .then((value) => { setReport(value); setStage('report') })
      .catch((reason: unknown) => setError(errorMessage(reason)))
      .finally(() => setBusy(false))
  }, [provider])

  useEffect(() => {
    const match = location.pathname.match(/^\/medical\/reports\/([^/]+)$/)
    if (!match) return
    let active = true
    provider.getEarthReport(decodeURIComponent(match[1])).then((value) => {
      if (!active) return
      setReport(value); setStage('report')
    }).catch((reason: unknown) => { if (active) setError(errorMessage(reason)) })
    return () => { active = false }
  }, [location.pathname, provider])

  const loadReports = () => {
    setBusy(true); setError('')
    provider.getEarthReports({ limit: 25, offset: 0 })
      .then((value) => { setReports(value); setStage('reports') })
      .catch((reason: unknown) => setError(errorMessage(reason)))
      .finally(() => setBusy(false))
  }

  const submitReview = () => {
    if (!report || !note.trim()) return
    setBusy(true); setError('')
    provider.reviewEarthReport(report.report_id, {
      review_status: 'reviewed', note: note.trim(), followup_requested: followup, is_demo: true,
    }).then((value) => {
      setResult(value); setReport((current) => current ? { ...current, review_status: 'reviewed' } : current); setStage('done')
    }).catch((reason: unknown) => setError(errorMessage(reason))).finally(() => setBusy(false))
  }

  const reset = () => { setStage('welcome'); setReports(null); setReport(null); setNote(''); setResult(null); setError('') }
  const openReport = () => { if (report) { onClose(); navigate(`/medical/reports/${encodeURIComponent(report.report_id)}`) } }

  const messages = useMemo<AssistantMessageData[]>(() => {
    const list: AssistantMessageData[] = [{
      id: 'welcome', role: 'assistant',
      content: 'Puedo consultar informes que ya fueron recibidos en Tierra y ayudarte a registrar una revisión DEMO. No diagnostico ni sustituyo al médico de vuelo.',
    }]
    if (stage === 'reports') list.push({
      id: 'report-count', role: 'assistant', content: reports?.total
        ? `Tierra tiene ${reports.total} informe${reports.total === 1 ? '' : 's'} recibido${reports.total === 1 ? '' : 's'}. Selecciona uno por su ID real.`
        : 'No hay informes recibidos en Tierra. Los informes todavía en la cola de nave no aparecen aquí.',
    })
    if (report) {
      list.push({ id: 'selected', role: 'user', label: 'Informe seleccionado', content: report.report_id })
      list.push({ id: 'summary', role: 'assistant', content: (
        <div className="space-y-2">
          <p className="font-semibold">{report.report_id} · {report.astronaut_id}</p>
          <p>{report.analysis.explanation}</p>
          <dl className="grid grid-cols-2 gap-2 text-xs text-muted">
            <div><dt>Observaciones</dt><dd className="font-semibold text-ink">{report.observations.length}</dd></div>
            <div><dt>Faltantes</dt><dd className="font-semibold text-ink">{report.analysis.missing_data.length}</dd></div>
            <div><dt>Recibido</dt><dd className="font-semibold text-ink">{report.communication.delivered_at_utc ?? 'Sin fecha'}</dd></div>
            <div><dt>Revisión</dt><dd className="font-semibold text-ink">{report.review_status}</dd></div>
          </dl>
          <p className="text-xs text-muted">Método: {report.analysis.method} · {report.analysis.clinically_validated ? 'validación indicada' : 'no clínicamente validado'}</p>
        </div>
      ) })
    }
    if (stage === 'note') list.push({ id: 'note-prompt', role: 'assistant', content: 'Escribe la nota demostrativa que deseas registrar. No incluyas datos clínicos reales.' })
    if (stage === 'followup' || stage === 'confirm' || stage === 'done') list.push({ id: 'note', role: 'user', label: 'Nota de revisión', content: note })
    if (stage === 'followup') list.push({ id: 'followup-prompt', role: 'assistant', content: '¿La revisión solicita seguimiento? Esta opción define la prioridad logística de la respuesta, no una emergencia clínica.' })
    if (stage === 'confirm') {
      list.push({ id: 'followup', role: 'user', content: followup ? 'Solicitar seguimiento' : 'Sin seguimiento solicitado' })
      list.push({ id: 'confirm', role: 'system', content: 'Confirma el POST. La respuesta quedará registrada y encolada en Tierra; todavía no habrá llegado a la nave.' })
    }
    if (stage === 'done' && result) list.push({ id: 'done', role: 'assistant', content: (
      <div className="space-y-1"><p className="font-semibold">Revisión registrada en Tierra</p><p>ID: {result.review_id}</p><p>Mensaje de retorno: {result.return_message_id}</p><p>Estado real: {result.status}. La llegada a nave depende del simulador y su ACK.</p></div>
    ) })
    if (error) list.push({ id: 'error', role: 'system', content: error })
    return list
  }, [error, followup, note, report, reports, result, stage])

  let controls
  if (stage === 'welcome') controls = <AssistantQuickReplies disabled={busy} replies={[{ id: 'reports', label: 'Ver informes recibidos' }]} onSelect={loadReports} />
  else if (stage === 'reports') controls = reports && reports.items.length > 0
    ? <AssistantQuickReplies disabled={busy} label="Informes recibidos" replies={reports.items.map((item) => ({ id: item.report_id, label: `${item.report_id} · ${item.review_status}` }))} onSelect={(reply) => selectReport(reply.id)} />
    : <button type="button" onClick={loadReports} className="inline-flex min-h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-control border border-line px-3 text-sm font-semibold"><Inbox aria-hidden="true" className="size-4" />Actualizar bandeja</button>
  else if (stage === 'report' && report) controls = <div className="grid grid-cols-2 gap-2"><button type="button" onClick={openReport} className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-control border border-line px-3 text-sm font-semibold"><ExternalLink aria-hidden="true" className="size-4" />Ver informe</button><button type="button" disabled={report.review_status === 'reviewed'} onClick={() => setStage('note')} className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-control bg-nasa-blue px-3 text-sm font-semibold text-white disabled:bg-slate-300"><FileCheck2 aria-hidden="true" className="size-4" />{report.review_status === 'reviewed' ? 'Ya revisado' : 'Preparar revisión'}</button></div>
  else if (stage === 'note') controls = <div className="space-y-2"><label className="sr-only" htmlFor="assistant-review-note">Nota de revisión</label><textarea id="assistant-review-note" value={note} onChange={(event) => setNote(event.target.value)} maxLength={2000} rows={3} placeholder="Nota DEMO para la tripulación" className="w-full resize-none rounded-control border border-line p-3 text-sm text-ink focus:border-nasa-blue" /><button type="button" disabled={!note.trim()} onClick={() => setStage('followup')} className="min-h-11 w-full whitespace-nowrap rounded-control bg-nasa-blue px-4 text-sm font-semibold text-white disabled:bg-slate-300">Continuar</button></div>
  else if (stage === 'followup') controls = <AssistantQuickReplies disabled={busy} replies={[{ id: 'yes', label: 'Solicitar seguimiento' }, { id: 'no', label: 'Sin seguimiento' }]} onSelect={(reply) => { setFollowup(reply.id === 'yes'); setStage('confirm') }} />
  else if (stage === 'confirm') controls = <div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => setStage('note')} className="min-h-11 whitespace-nowrap rounded-control border border-line px-3 text-sm font-semibold">Editar nota</button><button type="button" disabled={busy} onClick={submitReview} className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-control bg-nasa-blue px-3 text-sm font-semibold text-white"><Send aria-hidden="true" className="size-4" />Confirmar envío</button></div>
  else if (stage === 'done') controls = <div className="grid grid-cols-2 gap-2"><button type="button" onClick={openReport} className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-control border border-line px-3 text-sm font-semibold"><ExternalLink aria-hidden="true" className="size-4" />Abrir informe</button><button type="button" onClick={reset} className="min-h-11 whitespace-nowrap rounded-control bg-nasa-blue px-3 text-sm font-semibold text-white">Otra revisión</button></div>

  return <AssistantWindow open={open} variant="earth" messages={messages} controls={controls} busy={busy} onClose={onClose} />
}
