import { CheckCircle2, CircleAlert, Database, FlaskConical, ListChecks } from 'lucide-react'
import { Link } from 'react-router'
import type { ImportResult as ImportResultData } from '../../types'
import { AlertNotice, SecondaryButton } from '../ui'

interface ImportResultProps {
  result: ImportResultData
  simulated: boolean
  operation: 'bulk' | 'single'
  historyTotal: number | null
  refreshError: string | null
  onCorrectRows: () => void
}

export function ImportResult({
  result,
  simulated,
  operation,
  historyTotal,
  refreshError,
  onCorrectRows,
}: ImportResultProps) {
  const hasAccepted = result.accepted > 0
  const hasRejected = result.rejected > 0 || result.errors.length > 0

  return (
    <section className="space-y-5" aria-labelledby="import-result-heading">
      <div
        role="status"
        className={`rounded-card border p-5 ${
          hasRejected ? 'border-notice/35 bg-notice/10' : 'border-coverage/30 bg-coverage/5'
        }`}
      >
        <div className="flex items-start gap-3">
          {hasRejected
            ? <CircleAlert aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-notice" />
            : <CheckCircle2 aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-coverage" />}
          <div>
            <h3 id="import-result-heading" className="font-semibold text-ink">
              {hasRejected
                ? 'Importación procesada con filas rechazadas'
                : operation === 'single' ? 'Observación registrada' : 'Importación procesada'}
            </h3>
            <p className="mt-1 text-sm leading-6 text-muted">
              El conteo mostrado procede de la respuesta del provider; no se recalculó en la interfaz.
            </p>
          </div>
        </div>
      </div>

      {simulated && (
        <AlertNotice title="Resultado simulado · no persistido" tone="notice">
          <p>El provider mock actualizó únicamente su memoria local. Esto no confirma una escritura en FastAPI ni en SQLite.</p>
        </AlertNotice>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-card border border-coverage/30 bg-card p-5 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Aceptadas</p>
          <p className="mt-2 text-3xl font-semibold text-coverage">{result.accepted}</p>
        </div>
        <div className="rounded-card border border-notice/30 bg-card p-5 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Rechazadas</p>
          <p className="mt-2 text-3xl font-semibold text-notice">{result.rejected}</p>
        </div>
      </div>

      {result.observation_ids.length > 0 && (
        <div className="rounded-card border border-line bg-card p-5 shadow-card">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Database aria-hidden="true" className="size-4 text-data" />
            IDs devueltos por el provider
          </h4>
          <ul className="mt-3 flex flex-wrap gap-2">
            {result.observation_ids.map((id) => (
              <li key={id} className="rounded-control bg-canvas px-3 py-2 font-mono text-xs text-nasa-blue">{id}</li>
            ))}
          </ul>
        </div>
      )}

      {result.errors.length > 0 && (
        <div className="rounded-card border border-nasa-red/25 bg-card p-5 shadow-card">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-ink">
            <CircleAlert aria-hidden="true" className="size-4 text-nasa-red" />
            Filas rechazadas por el provider
          </h4>
          <ul className="mt-3 space-y-3">
            {result.errors.map((error, index) => (
              <li key={`${error.row}-${error.code}-${index}`} className="rounded-control bg-nasa-red/5 p-3 text-sm text-muted">
                <span className="font-semibold text-nasa-red">Fila API {error.row} (índice desde 0) · {error.code}</span>
                <span className="mt-1 block">{error.detail}</span>
              </li>
            ))}
          </ul>
          <SecondaryButton type="button" onClick={onCorrectRows} className="mt-4">
            Corregir filas rechazadas
          </SecondaryButton>
        </div>
      )}

      <div className="rounded-card border border-line bg-card p-5 shadow-card">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-ink">
          <ListChecks aria-hidden="true" className="size-4 text-data" />
          Actualización del historial
        </h4>
        {refreshError ? (
          <p className="mt-2 text-sm leading-6 text-nasa-red">La importación respondió, pero no fue posible refrescar el historial: {refreshError}</p>
        ) : (
          <p className="mt-2 text-sm leading-6 text-muted">
            Consulta completada después del registro{historyTotal === null ? '.' : ` · ${historyTotal} observaciones disponibles para el astronauta.`}
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/astronaut/trends" className="inline-flex min-h-11 items-center justify-center rounded-control bg-nasa-blue px-4 py-2 text-sm font-semibold text-white hover:bg-deep-space">
            Ver historial y tendencias
          </Link>
          <Link to="/astronaut" className="inline-flex min-h-11 items-center justify-center rounded-control border border-line bg-card px-4 py-2 text-sm font-semibold text-ink hover:border-nasa-blue hover:text-nasa-blue">
            Volver al panel
          </Link>
        </div>
      </div>

      {!simulated && hasAccepted && (
        <p className="flex items-center gap-2 text-xs text-muted">
          <FlaskConical aria-hidden="true" className="size-4" />
          Resultado recibido del provider HTTP configurado.
        </p>
      )}
    </section>
  )
}
