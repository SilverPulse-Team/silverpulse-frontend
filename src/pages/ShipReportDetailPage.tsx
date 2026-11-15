import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { CommunicationTimeline } from '../components/reports/CommunicationTimeline'
import { explainReasonCode, labelEvidenceCode } from '../components/reports/reportPresentation'
import { PageHeader } from '../components/layout/PageHeader'
import {
  DataSourceBadge,
  EmptyState,
  ErrorState,
  LoadingSkeleton,
  QualityBadge,
  TimeStamp,
} from '../components/ui'
import { ApiClientError, getDataProvider, type ResearchSource, type ShipInboxMessage } from '../services'
import type { Report } from '../types'

type ReportState =
  | { status: 'loading' }
  | { status: 'error'; message: string; notFound: boolean }
  | { status: 'ready'; data: Report }

type InboxState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: ShipInboxMessage[] }

type SourcesState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: ResearchSource[] }

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado al consultar el informe.'
}

function isNotFound(error: unknown) {
  if (error instanceof ApiClientError) return error.kind === 'not-found'
  return typeof error === 'object' && error !== null && 'status' in error && error.status === 404
}

function phaseLabel(phase: string) {
  if (phase === 'preflight') return 'Pre-vuelo'
  if (phase === 'inflight') return 'Durante el vuelo'
  if (phase === 'postflight') return 'Post-vuelo'
  return phase
}

function ObservationTable({ observations }: { observations: Report['observations'] }) {
  if (observations.length === 0) {
    return <EmptyState title="Sin observaciones" description="El informe no incluye observaciones fuente." />
  }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-control border border-line lg:block">
        <table className="w-full min-w-[850px] border-collapse text-left text-sm">
          <thead className="bg-canvas text-xs uppercase tracking-wide text-muted">
            <tr>
              <th scope="col" className="p-3">Métrica</th>
              <th scope="col" className="p-3">Valor</th>
              <th scope="col" className="p-3">Observado en UTC</th>
              <th scope="col" className="p-3">Fuente</th>
              <th scope="col" className="p-3">Calidad</th>
              <th scope="col" className="p-3">Fase</th>
              <th scope="col" className="p-3">Dato sintético</th>
            </tr>
          </thead>
          <tbody>
            {observations.map((observation) => (
              <tr key={observation.id} className="border-t border-line align-top">
                <th scope="row" className="p-3 font-medium text-ink">{observation.metric_code}</th>
                <td className="p-3 text-ink">{observation.value} {observation.unit}</td>
                <td className="p-3"><TimeStamp value={observation.observed_at_utc} /></td>
                <td className="p-3"><DataSourceBadge source={observation.source_kind} /></td>
                <td className="p-3"><QualityBadge quality={observation.quality} /></td>
                <td className="p-3">{phaseLabel(observation.phase)}</td>
                <td className="p-3">{observation.is_synthetic ? 'Sí' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="space-y-3 lg:hidden">
        {observations.map((observation) => (
          <li key={observation.id} className="rounded-control border border-line bg-canvas p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-ink">{observation.metric_code}</h3>
                <p className="mt-1 text-lg font-semibold text-ink">{observation.value} {observation.unit}</p>
              </div>
              <QualityBadge quality={observation.quality} />
            </div>
            <TimeStamp value={observation.observed_at_utc} className="mt-3 block" />
            <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-line pt-3 text-sm">
              <div><dt className="text-muted">Fuente</dt><dd className="mt-1"><DataSourceBadge source={observation.source_kind} /></dd></div>
              <div><dt className="text-muted">Fase</dt><dd className="mt-1 text-ink">{phaseLabel(observation.phase)}</dd></div>
              <div><dt className="text-muted">Sintético</dt><dd className="mt-1 text-ink">{observation.is_synthetic ? 'Sí' : 'No'}</dd></div>
              <div><dt className="text-muted">ID fuente</dt><dd className="mt-1 break-all font-mono text-xs text-ink">{observation.source_id}</dd></div>
            </dl>
          </li>
        ))}
      </ul>
    </>
  )
}

export function ShipReportDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [reportState, setReportState] = useState<ReportState>({ status: 'loading' })
  const [reportRequestVersion, setReportRequestVersion] = useState(0)
  const [inboxState, setInboxState] = useState<InboxState>({ status: 'loading' })
  const [inboxRequestVersion, setInboxRequestVersion] = useState(0)
  const [sourcesState, setSourcesState] = useState<SourcesState>({ status: 'loading' })

  const retryReport = useCallback(() => {
    setReportState({ status: 'loading' })
    setReportRequestVersion((version) => version + 1)
  }, [])
  const retryInbox = useCallback(() => {
    setInboxState({ status: 'loading' })
    setInboxRequestVersion((version) => version + 1)
  }, [])

  useEffect(() => {
    let isCurrent = true
    if (!id) {
      return () => { isCurrent = false }
    }

    getDataProvider()
      .getShipReport(id)
      .then((report) => {
        if (isCurrent) setReportState({ status: 'ready', data: report })
      })
      .catch((error: unknown) => {
        if (isCurrent) setReportState({ status: 'error', message: getErrorMessage(error), notFound: isNotFound(error) })
      })

    return () => { isCurrent = false }
  }, [id, reportRequestVersion])

  useEffect(() => {
    let isCurrent = true
    getDataProvider()
      .getShipInbox()
      .then((inbox) => {
        if (isCurrent) setInboxState({ status: 'ready', data: inbox.items })
      })
      .catch((error: unknown) => {
        if (isCurrent) setInboxState({ status: 'error', message: getErrorMessage(error) })
      })

    return () => { isCurrent = false }
  }, [inboxRequestVersion])

  useEffect(() => {
    let isCurrent = true
    getDataProvider()
      .getResearchSources()
      .then((sources) => {
        if (isCurrent) setSourcesState({ status: 'ready', data: sources })
      })
      .catch((error: unknown) => {
        if (isCurrent) setSourcesState({ status: 'error', message: getErrorMessage(error) })
      })

    return () => { isCurrent = false }
  }, [])

  const backLink = (
    <Link
      to="/astronaut#ship-reports"
      className="inline-flex min-h-11 items-center justify-center rounded-control border border-line bg-card px-4 py-2 text-sm font-semibold text-ink hover:border-nasa-blue hover:text-nasa-blue"
    >
      Volver a informes
    </Link>
  )

  if (!id) {
    return (
      <div className="space-y-5">
        <PageHeader eyebrow="ORBIT VERIFY" title="Informe no disponible" />
        <ErrorState message="No se especificó un identificador de informe." />
        {backLink}
      </div>
    )
  }

  if (reportState.status === 'loading') {
    return (
      <div className="space-y-5">
        <PageHeader eyebrow="ORBIT VERIFY" title="Informe de observación" description="Consultando el informe original de nave." />
        <LoadingSkeleton rows={8} label="Cargando detalle del informe" />
      </div>
    )
  }

  if (reportState.status === 'error') {
    return (
      <div className="space-y-5">
        <PageHeader eyebrow="ORBIT VERIFY" title={reportState.notFound ? 'Informe no disponible' : 'No fue posible consultar el informe'} />
        <ErrorState message={reportState.message} onRetry={retryReport} />
        {backLink}
      </div>
    )
  }

  const report = reportState.data
  const returnedMessages =
    inboxState.status === 'ready'
      ? inboxState.data
          .filter((message) => message.report_id === report.report_id)
          .sort((left, right) => right.received_at_utc.localeCompare(left.received_at_utc))
      : []
  const sourceById = new Map(
    (sourcesState.status === 'ready' ? sourcesState.data : []).map((source) => [source.id, source]),
  )

  return (
    <article className="mx-auto max-w-6xl space-y-5">
      <PageHeader
        eyebrow="ORBIT VERIFY · Informe de observación"
        title={report.report_id}
        description={`${report.astronaut_id} · ${report.phase}`}
        badge={
          <div className="flex flex-wrap gap-2">
            {report.is_demo && <span className="rounded-full border border-notice/40 bg-notice/10 px-3 py-1 text-xs font-semibold text-ink">DATOS SINTÉTICOS · DEMO</span>}
            <span className="rounded-full border border-line bg-canvas px-3 py-1 text-xs font-semibold text-ink">
              {report.analysis.clinically_validated ? 'Validación clínica indicada por el informe' : 'No clínicamente validado'}
            </span>
          </div>
        }
        actions={backLink}
      />

      <section aria-labelledby="report-summary-title" className="rounded-card border border-line bg-card p-5 shadow-card lg:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-nasa-blue">Resumen</p>
            <h2 id="report-summary-title" className="mt-1 text-lg font-semibold text-ink">Análisis emitido</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-line bg-canvas px-3 py-1 text-xs font-semibold text-ink">
              Fase: {phaseLabel(report.phase)}
            </span>
            <span className="rounded-full border border-line bg-canvas px-3 py-1 text-xs font-semibold text-ink">
              Estado de análisis: {report.analysis.status}
            </span>
          </div>
        </div>
        <p className="mt-4 max-w-4xl text-sm leading-6 text-ink">{report.analysis.explanation}</p>
        <dl className="mt-5 grid gap-4 border-t border-line pt-4 sm:grid-cols-2 lg:grid-cols-4">
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Creado en nave</dt><dd className="mt-1"><TimeStamp value={report.created_at_utc} label="Fecha de creación" /></dd></div>
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Método</dt><dd className="mt-1 text-sm text-ink">{report.analysis.method}</dd></div>
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Versión de algoritmo</dt><dd className="mt-1 font-mono text-sm text-ink">{report.analysis.algorithm_version}</dd></div>
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Observaciones fuente</dt><dd className="mt-1 text-sm text-ink">{report.observations.length}</dd></div>
        </dl>
      </section>

      <section aria-labelledby="observations-title" className="rounded-card border border-line bg-card p-5 shadow-card lg:p-6">
        <h2 id="observations-title" className="text-lg font-semibold text-ink">Observaciones utilizadas</h2>
        <p className="mt-1 text-sm leading-6 text-muted">Valores, fechas, fuente y calidad tal como los devuelve el informe. No se agregan señales crudas ni valores derivados.</p>
        <div className="mt-4"><ObservationTable observations={report.observations} /></div>
      </section>

      <section aria-labelledby="provenance-title" className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-card border border-line bg-card p-5 shadow-card">
          <h2 id="provenance-title" className="text-lg font-semibold text-ink">Calidad y procedencia</h2>
          <ul className="mt-4 space-y-3">
            {report.observations.map((observation) => (
              <li key={observation.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3 last:border-0 last:pb-0">
                <span className="text-sm font-medium text-ink">{observation.metric_code}</span>
                <span className="flex flex-wrap items-center gap-2">
                  <DataSourceBadge source={observation.source_kind} />
                  <QualityBadge quality={observation.quality} />
                  <span className="text-xs text-muted">{observation.is_synthetic ? 'Sintético' : 'No sintético'}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <section aria-labelledby="reasons-title" className="rounded-card border border-line bg-card p-5 shadow-card">
          <h2 id="reasons-title" className="text-lg font-semibold text-ink">Razones de análisis</h2>
          {report.analysis.reason_codes.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Sin razones reportadas.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {report.analysis.reason_codes.map((code, index) => (
                <li key={`${code}-${index}`} className="rounded-control border border-line bg-canvas p-3">
                  <code className="font-mono text-sm font-semibold text-ink">{code}</code>
                  <p className="mt-1 text-sm leading-6 text-muted">{explainReasonCode(code)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>

      <section aria-labelledby="missing-data-title" className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-card border border-line bg-card p-5 shadow-card">
          <h2 id="missing-data-title" className="text-lg font-semibold text-ink">Evidencia faltante</h2>
          {report.analysis.missing_data.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Sin faltantes reportados.</p>
          ) : (
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink">
              {report.analysis.missing_data.map((code, index) => (
                <li key={`${code}-${index}`}><span>{labelEvidenceCode(code)}</span> <code className="font-mono text-xs text-muted">({code})</code></li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-card border border-notice/40 bg-notice/5 p-5">
          <h2 className="text-lg font-semibold text-ink">Limitaciones</h2>
          <p className="mt-3 text-sm leading-6 text-ink">
            {report.analysis.clinically_validated
              ? 'El informe indica validación clínica; esta interfaz no amplía ni reinterpreta ese estado.'
              : 'Este informe no está clínicamente validado. No es diagnóstico, prescripción ni autorización de retorno.'}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted">
            El contrato v0.2.0 no incluye una lista independiente de limitaciones por informe; se conserva el análisis recibido sin agregar conclusiones.
          </p>
        </div>
      </section>

      <section aria-labelledby="sources-title" className="rounded-card border border-line bg-card p-5 shadow-card">
        <h2 id="sources-title" className="text-lg font-semibold text-ink">Fuentes científicas</h2>
        {report.scientific_sources.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Sin fuentes incluidas en el informe.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {report.scientific_sources.map((sourceId) => {
              const source = sourceById.get(sourceId)
              return (
                <li key={sourceId} className="rounded-control border border-line bg-canvas p-3">
                  <p className="font-mono text-sm font-semibold text-ink">{sourceId}</p>
                  {source ? (
                    <>
                      <p className="mt-1 text-sm text-ink">{source.title}</p>
                      <p className="mt-1 text-sm text-muted">{source.relevance}</p>
                      <a className="mt-2 inline-flex min-h-11 items-center break-all text-sm font-semibold text-nasa-blue hover:text-deep-space" href={source.url} target="_blank" rel="noreferrer">
                        Consultar referencia
                      </a>
                    </>
                  ) : (
                    <p className="mt-1 text-sm text-muted">
                      {sourcesState.status === 'loading'
                        ? 'Consultando metadatos para esta referencia.'
                        : 'El informe conserva este identificador; no se recibieron metadatos adicionales para él.'}
                    </p>
                  )}
                </li>
              )
            })}
          </ul>
        )}
        {sourcesState.status === 'error' && (
          <p role="status" className="mt-3 text-sm text-muted">
            No se pudieron consultar metadatos complementarios: {sourcesState.message}. Se conservan los identificadores originales del informe.
          </p>
        )}
      </section>

      <CommunicationTimeline
        report={report}
        returnedMessages={returnedMessages}
        inboxLoading={inboxState.status === 'loading'}
        inboxError={inboxState.status === 'error' ? inboxState.message : undefined}
        onRetryInbox={retryInbox}
      />
    </article>
  )
}
