import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router'
import { PageHeader } from '../components/layout/PageHeader'
import { explainReasonCode, labelEvidenceCode } from '../components/reports/reportPresentation'
import {
  DataSourceBadge,
  EmptyState,
  ErrorState,
  LoadingSkeleton,
  QualityBadge,
  TimeStamp,
} from '../components/ui'
import { getDataProvider, type MedicalReviewResult } from '../services'
import type { MedicalReviewInput, Report } from '../types'
import { createSubmissionLock } from '../utils/submissionLock'

type ReportState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: Report }

const phaseLabels: Record<string, string> = {
  preflight: 'Pre-vuelo',
  inflight: 'Durante vuelo',
  postflight: 'Post-vuelo',
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado al consultar la revisión.'
}

export function EarthReportReviewPage() {
  const { id } = useParams<{ id: string }>()
  const [reportState, setReportState] = useState<ReportState>({ status: 'loading' })
  const [requestVersion, setRequestVersion] = useState(0)
  const [note, setNote] = useState('Se requiere comprobación documental adicional (nota ficticia de demostración).')
  const [followupRequested, setFollowupRequested] = useState(true)
  const [submissionLoading, setSubmissionLoading] = useState(false)
  const [submissionError, setSubmissionError] = useState<string>()
  const [reviewResult, setReviewResult] = useState<MedicalReviewResult>()
  const submissionLockRef = useRef(createSubmissionLock())

  const retry = useCallback(() => {
    setReportState({ status: 'loading' })
    setRequestVersion((version) => version + 1)
  }, [])

  useEffect(() => {
    let isCurrent = true
    if (!id) {
      return () => { isCurrent = false }
    }

    getDataProvider().getEarthReport(id)
      .then((report) => {
        if (isCurrent) setReportState({ status: 'ready', data: report })
      })
      .catch((error: unknown) => {
        if (isCurrent) setReportState({ status: 'error', message: getErrorMessage(error) })
      })

    return () => {
      isCurrent = false
    }
  }, [id, requestVersion])

  const backLink = (
    <Link
      to="/medical"
      className="inline-flex min-h-11 items-center justify-center rounded-control border border-line bg-card px-4 py-2 text-sm font-semibold text-ink hover:border-nasa-blue hover:text-nasa-blue"
    >
      Volver a la bandeja
    </Link>
  )

  const submitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!id || reportState.status !== 'ready' || !note.trim()) return

    const report = reportState.data

    setSubmissionError(undefined)
    setReviewResult(undefined)
    await submissionLockRef.current.run(async () => {
      setSubmissionLoading(true)
      try {
        const input: MedicalReviewInput = {
          review_status: 'reviewed',
          note: note.trim(),
          followup_requested: followupRequested,
          is_demo: true,
        }
        const result = await getDataProvider().reviewEarthReport(id, input)
        setReviewResult(result)
        if (result.status === 'queued') {
          setReportState({ status: 'ready', data: { ...report, review_status: 'reviewed' } })
        }
      } catch (error) {
        setSubmissionError(getErrorMessage(error))
      } finally {
        setSubmissionLoading(false)
      }
    })
  }

  if (!id) {
    return (
      <div className="space-y-5">
        <PageHeader eyebrow="Entorno Tierra · Revisión" title="Informe no disponible" />
        <ErrorState message="No se especificó un identificador de informe." />
        {backLink}
      </div>
    )
  }

  if (reportState.status === 'loading') {
    return (
      <div className="space-y-5">
        <PageHeader eyebrow="Entorno Tierra · Revisión" title="Informe" description="Consultando el informe recibido por Tierra." />
        <LoadingSkeleton rows={7} label="Cargando informe médico recibido" />
      </div>
    )
  }

  if (reportState.status === 'error') {
    return (
      <div className="space-y-5">
        <PageHeader eyebrow="Entorno Tierra · Revisión" title="Informe no disponible" />
        <ErrorState message={reportState.message} onRetry={retry} />
        {backLink}
      </div>
    )
  }

  const report = reportState.data
  const deliveryConfirmed =
    report.communication.status === 'delivered' && report.communication.delivered_at_utc !== null

  if (!deliveryConfirmed) {
    return (
      <div className="space-y-5">
        <PageHeader eyebrow="Entorno Tierra · Revisión" title="Informe no recibido" />
        <ErrorState
          title="No se puede revisar este informe en Tierra"
          message="El informe no tiene estado delivered y fecha de entrega confirmada."
        />
        {backLink}
      </div>
    )
  }

  return (
    <article className="mx-auto max-w-6xl space-y-5">
      <PageHeader
        eyebrow="Entorno Tierra · Médico de vuelo ficticio"
        title={`Revisión del informe ${report.report_id}`}
        description={`${report.astronaut_id} · ${phaseLabels[report.phase] ?? report.phase}`}
        badge={
          <span className="rounded-full border border-notice/40 bg-notice/10 px-3 py-1 text-xs font-semibold text-ink">
            Recibido en Tierra · DEMO
          </span>
        }
        actions={backLink}
      />

      <section className="rounded-card border border-line bg-card p-5 shadow-card">
        <div className="grid gap-4 sm:grid-cols-2">
          <TimeStamp value={report.created_at_utc} label="Creado originalmente en nave" />
          <TimeStamp value={report.communication.delivered_at_utc} label="Entregado a Tierra" />
        </div>
        <p className="mt-4 text-sm leading-6 text-muted">
          Informe descriptivo · {report.analysis.clinically_validated ? 'validación clínica indicada en los datos recibidos' : 'no clínicamente validado'}.
          No es diagnóstico, prescripción ni autorización de retorno.
        </p>
      </section>

      <section aria-labelledby="earth-report-observations-title" className="rounded-card border border-line bg-card p-5 shadow-card">
        <h2 id="earth-report-observations-title" className="text-lg font-semibold text-ink">Observaciones recibidas</h2>
        {report.observations.length === 0 ? (
          <div className="mt-3"><EmptyState title="Sin observaciones" description="El informe recibido no incluye observaciones fuente." /></div>
        ) : (
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {report.observations.map((observation) => (
              <li key={observation.id} className="rounded-control border border-line bg-canvas p-4">
                <h3 className="font-semibold text-ink">{observation.metric_code}: {observation.value} {observation.unit}</h3>
                <TimeStamp value={observation.observed_at_utc} className="mt-2 block" />
                <div className="mt-3 flex flex-wrap gap-2">
                  <DataSourceBadge source={observation.source_kind} />
                  <QualityBadge quality={observation.quality} />
                  <span className="text-xs text-muted">
                    {phaseLabels[observation.phase] ?? observation.phase} · {observation.is_synthetic ? 'Sintético' : 'No sintético'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-card border border-line bg-card p-5 shadow-card">
          <h2 className="text-lg font-semibold text-ink">Análisis recibido</h2>
          <p className="mt-2 text-sm text-muted">
            Método: <strong>{report.analysis.method}</strong> · versión <strong>{report.analysis.algorithm_version}</strong>
          </p>
          <p className="mt-3 text-sm leading-6 text-ink">{report.analysis.explanation}</p>
          <ul className="mt-4 space-y-3">
            {report.analysis.reason_codes.map((code, index) => (
              <li key={`${code}-${index}`} className="rounded-control border border-line bg-canvas p-3">
                <code className="font-mono text-sm font-semibold text-ink">{code}</code>
                <p className="mt-1 text-sm text-muted">{explainReasonCode(code)}</p>
              </li>
            ))}
          </ul>
          <h3 className="mt-4 font-semibold text-ink">Evidencia faltante</h3>
          {report.analysis.missing_data.length === 0 ? (
            <p className="mt-2 text-sm text-muted">Sin faltantes reportados.</p>
          ) : (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
              {report.analysis.missing_data.map((code) => <li key={code}>{labelEvidenceCode(code)} <code>({code})</code></li>)}
            </ul>
          )}
        </div>

        <section aria-labelledby="medical-review-form-title" className="rounded-card border border-line bg-card p-5 shadow-card">
          <h2 id="medical-review-form-title" className="text-lg font-semibold text-ink">Observaciones del médico</h2>
          {submissionError && <p role="alert" className="mt-3 rounded-control border border-nasa-red/30 bg-nasa-red/5 p-3 text-sm text-ink">{submissionError}</p>}
          {reviewResult && (
            <p role="status" className="mt-3 rounded-control border border-coverage/30 bg-coverage/5 p-3 text-sm text-ink">
              <strong className="block">
                {reviewResult.status === 'queued'
                  ? 'Revisión guardada · Respuesta en cola'
                  : 'Respuesta de revisión recibida; el estado de cola no está confirmado'}
              </strong>
              <span className="mt-1 block">ID de revisión: {reviewResult.review_id}</span>
              <span className="block">ID del mensaje de retorno: {reviewResult.return_message_id}</span>
              <span className="block">Estado informado por la API: {reviewResult.status}</span>
              <span className="mt-1 block">
                Esto no significa que haya sido recibida en nave; se confirma únicamente al encontrarla en /ship/inbox.
              </span>
              <Link
                to="/mission-control"
                className="mt-2 inline-flex min-h-11 items-center font-semibold text-nasa-blue hover:text-deep-space"
              >
                Consultar timeline de sincronización
              </Link>
            </p>
          )}
          {!reviewResult && report.review_status !== 'pending' && (
            <div role="status" className="mt-3 rounded-control border border-line bg-canvas p-3 text-sm text-ink">
              <p>
                Este informe ya figura como {report.review_status === 'reviewed' ? 'revisado' : 'revisado; el retorno aún no consta como recibido en nave'}.
                La recepción solo se confirma consultando /ship/inbox.
              </p>
              <Link
                to="/mission-control"
                className="mt-2 inline-flex min-h-11 items-center font-semibold text-nasa-blue hover:text-deep-space"
              >
                Consultar timeline de sincronización
              </Link>
            </div>
          )}
          {report.review_status === 'pending' && !reviewResult && (
            <form onSubmit={(event) => { void submitReview(event) }} className="mt-4 space-y-4">
              <label className="grid gap-1.5 text-sm font-medium text-ink">
                Nota de revisión ficticia
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  required
                  rows={4}
                  maxLength={2000}
                  disabled={submissionLoading || Boolean(reviewResult)}
                  className="rounded-control border border-line bg-white p-3 text-sm font-normal disabled:bg-canvas"
                />
              </label>
              <label className="flex min-h-11 items-center gap-3 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={followupRequested}
                  onChange={(event) => setFollowupRequested(event.target.checked)}
                  disabled={submissionLoading || Boolean(reviewResult)}
                  className="size-4 accent-nasa-blue"
                />
                Solicitar seguimiento
              </label>
              <div className="rounded-control border border-line bg-canvas p-3 text-sm text-ink">
                <p>Estado al guardar: <strong>Revisado</strong></p>
                <p className="mt-1 text-xs text-muted">El contrato solo permite registrar review_status=reviewed.</p>
                <p className="mt-1 text-xs text-muted">La solicitud se envía con is_demo=true; esta nota es ficticia.</p>
              </div>
              <p className="text-xs leading-5 text-muted">
                La respuesta se encola en Tierra; no se presenta como recibida hasta que aparezca en la bandeja de nave.
              </p>
              <button
                type="submit"
                disabled={submissionLoading || Boolean(reviewResult) || !note.trim()}
                aria-busy={submissionLoading}
                className="inline-flex min-h-11 items-center justify-center rounded-control bg-nasa-blue px-4 py-2 text-sm font-semibold text-white hover:bg-deep-space disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
              >
                {submissionLoading ? 'Registrando revisión…' : 'Registrar revisión y encolar respuesta'}
              </button>
            </form>
          )}
        </section>
      </section>
    </article>
  )
}
