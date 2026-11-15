import { FilePlus2, FileText } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import type { ListReports, MissionPhase } from '../../types'
import { getDataProvider } from '../../services'
import {
  ConfirmationModal,
  EmptyState,
  ErrorState,
  LoadingSkeleton,
  SecondaryButton,
  SyncStatusBadge,
  TimeStamp,
} from '../ui'

type ReportsState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: ListReports }

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'No se pudo completar la operación de informes.'
}

function getCommunicationLabel(status: string) {
  if (status === 'queued') return <SyncStatusBadge status="queued" />
  if (status === 'transmitting') return <SyncStatusBadge status="in_transit" />
  if (status === 'delivered') return <SyncStatusBadge status="delivered_earth" />
  return (
    <span className="inline-flex min-h-7 items-center rounded-full border border-notice/40 bg-notice/10 px-3 text-xs font-semibold text-ink">
      Reintento pendiente
    </span>
  )
}

export function ShipReportsPanel({
  astronautId,
  phase,
}: {
  astronautId: string
  phase: MissionPhase
}) {
  const [reportsState, setReportsState] = useState<ReportsState>({ status: 'loading' })
  const [requestVersion, setRequestVersion] = useState(0)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string>()
  const [generationMessage, setGenerationMessage] = useState<string>()

  const retryReports = useCallback(() => {
    setReportsState({ status: 'loading' })
    setRequestVersion((version) => version + 1)
  }, [])

  useEffect(() => {
    let isCurrent = true
    getDataProvider()
      .getShipReports()
      .then((reports) => {
        if (isCurrent) setReportsState({ status: 'ready', data: reports })
      })
      .catch((error: unknown) => {
        if (isCurrent) setReportsState({ status: 'error', message: getErrorMessage(error) })
      })

    return () => {
      isCurrent = false
    }
  }, [requestVersion])

  const generateReport = async () => {
    setIsGenerating(true)
    setGenerationError(undefined)
    setGenerationMessage(undefined)

    try {
      const report = await getDataProvider().generateReport({
        astronaut_id: astronautId,
        phase,
        include_return_summary: true,
      })
      setConfirmOpen(false)
      setGenerationMessage(`Informe ${report.report_id} generado por el proveedor. La entrega a Tierra no se presume.`)
      retryReports()
    } catch (error) {
      setGenerationError(getErrorMessage(error))
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <section id="ship-reports" aria-labelledby="ship-reports-title" className="rounded-card border border-line bg-card p-5 shadow-card lg:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-nasa-blue">ORBIT VERIFY · Informes de nave</p>
          <h2 id="ship-reports-title" className="mt-1 text-xl font-semibold text-ink">Informes locales</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
            Informes deterministas devueltos por el proveedor. Generado, en cola y entregado son estados distintos.
          </p>
        </div>
        <SecondaryButton type="button" onClick={() => { setGenerationError(undefined); setConfirmOpen(true) }}>
          <FilePlus2 aria-hidden="true" className="size-4" />
          Generar informe
        </SecondaryButton>
      </div>

      {generationMessage && (
        <p role="status" className="mt-4 rounded-control border border-coverage/30 bg-coverage/5 p-3 text-sm text-ink">
          {generationMessage}
        </p>
      )}
      {generationError && (
        <p role="alert" className="mt-4 rounded-control border border-nasa-red/30 bg-nasa-red/5 p-3 text-sm text-ink">
          No se generó ningún informe: {generationError}
        </p>
      )}

      <div className="mt-5">
        {reportsState.status === 'loading' ? (
          <LoadingSkeleton rows={3} label="Cargando informes locales de nave" />
        ) : reportsState.status === 'error' ? (
          <ErrorState title="No fue posible consultar los informes" message={reportsState.message} onRetry={retryReports} />
        ) : reportsState.data.items.length === 0 ? (
          <EmptyState
            title="Sin informes locales"
            description="El proveedor no devolvió informes. No se crean informes de muestra desde la interfaz."
            icon={FileText}
            action={<SecondaryButton type="button" onClick={() => setConfirmOpen(true)}>Generar informe</SecondaryButton>}
          />
        ) : (
          <ul className="space-y-3">
            {reportsState.data.items.map((report) => (
              <li key={report.report_id} className="rounded-control border border-line bg-canvas p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-semibold text-ink">{report.report_id}</p>
                    <p className="mt-1 text-sm text-muted">{report.astronaut_id} · {report.phase}</p>
                    <TimeStamp value={report.created_at_utc} label="Generado en nave" className="mt-2 block text-xs" />
                  </div>
                  {getCommunicationLabel(report.communication.status)}
                </div>
                <p className="mt-3 text-sm leading-6 text-ink">{report.analysis.explanation}</p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {report.is_demo && <span className="rounded-full border border-notice/40 bg-notice/10 px-3 py-1 text-xs font-semibold text-ink">DEMO · SINTÉTICO</span>}
                    <span className="rounded-full border border-line bg-card px-3 py-1 text-xs font-semibold text-ink">
                      Fase: {report.phase}
                    </span>
                    <span className="text-xs text-muted">
                      {report.communication.priority} · prioridad logística, no de emergencia
                    </span>
                  </div>
                  <Link
                    to={`/astronaut/reports/${encodeURIComponent(report.report_id)}`}
                    className="inline-flex min-h-11 items-center font-semibold text-nasa-blue hover:text-deep-space"
                  >
                    Abrir detalle
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmationModal
        open={confirmOpen}
        title="Generar informe local"
        description={`Se solicitará al proveedor un informe determinista para ${astronautId} en fase ${phase}. No se usa un modelo de lenguaje ni se declara que el informe haya sido entregado a Tierra.`}
        confirmLabel="Generar informe"
        isSubmitting={isGenerating}
        onConfirm={() => { void generateReport() }}
        onClose={() => setConfirmOpen(false)}
      />
    </section>
  )
}
