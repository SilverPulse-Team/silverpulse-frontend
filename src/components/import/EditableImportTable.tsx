import type { ImportDraftField, ImportDraftRow, ImportRowError } from '../../utils/import'
import type { MetricDefinition, MissionPhase, ObservationQuality } from '../../types'

interface EditableImportTableProps {
  rows: ImportDraftRow[]
  metrics: MetricDefinition[]
  errors: ImportRowError[]
  onChange: (row: number, field: ImportDraftField, value: string) => void
}

const fieldClassName =
  'min-h-11 w-full min-w-28 rounded-control border border-line bg-card px-2.5 py-2 text-sm text-ink focus:border-nasa-blue'

const phases: Array<{ value: MissionPhase; label: string }> = [
  { value: 'preflight', label: 'Pre-vuelo' },
  { value: 'inflight', label: 'Durante vuelo' },
  { value: 'postflight', label: 'Post-vuelo' },
]

const qualities: Array<{ value: ObservationQuality; label: string }> = [
  { value: 'adequate', label: 'Adecuada' },
  { value: 'low', label: 'Baja' },
  { value: 'unknown', label: 'Desconocida' },
  { value: 'not_applicable', label: 'No aplica' },
]

function errorFor(errors: ImportRowError[], row: number, field: ImportDraftField) {
  return errors.find((error) => error.row === row && error.field === field)
}

function FieldError({ error }: { error: ImportRowError | undefined }) {
  if (!error) return null
  return <span className="mt-1 block text-[0.7rem] leading-4 text-nasa-red">{error.detail}</span>
}

export function EditableImportTable({ rows, metrics, errors, onChange }: EditableImportTableProps) {
  if (rows.length === 0) return null

  return (
    <section className="overflow-hidden rounded-card border border-line bg-card shadow-card" aria-labelledby="mapping-table-title">
      <div className="border-b border-line px-4 py-3">
        <h3 id="mapping-table-title" className="text-sm font-semibold text-ink">Mapeo de filas</h3>
        <p className="mt-1 text-xs leading-5 text-muted">Corrige los campos marcados antes de confirmar. No se aplican conversiones clínicas.</p>
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[1180px] border-collapse text-left">
          <caption className="sr-only">Filas importadas editables con validación por campo</caption>
          <thead className="bg-canvas text-xs uppercase tracking-wide text-muted">
            <tr>
              <th scope="col" className="border-b border-line px-3 py-3">Fila</th>
              <th scope="col" className="border-b border-line px-3 py-3">Métrica</th>
              <th scope="col" className="border-b border-line px-3 py-3">Valor</th>
              <th scope="col" className="border-b border-line px-3 py-3">Unidad</th>
              <th scope="col" className="border-b border-line px-3 py-3">Fecha UTC</th>
              <th scope="col" className="border-b border-line px-3 py-3">Fase</th>
              <th scope="col" className="border-b border-line px-3 py-3">Calidad</th>
              <th scope="col" className="border-b border-line px-3 py-3">Actividad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row) => (
              <tr key={row.row} className={errors.some((error) => error.row === row.row) ? 'bg-nasa-red/[0.025]' : ''}>
                <th scope="row" className="px-3 py-3 align-top font-mono text-xs text-muted">
                  {row.row}
                  <FieldError error={errors.find((error) => error.row === row.row && error.field === 'row')} />
                </th>
                <td className="px-3 py-3 align-top">
                  <select
                    aria-label={`Métrica de la fila ${row.row}`}
                    aria-invalid={Boolean(errorFor(errors, row.row, 'metric_code'))}
                    value={row.metric_code}
                    onChange={(event) => onChange(row.row, 'metric_code', event.target.value)}
                    className={`${fieldClassName} ${errorFor(errors, row.row, 'metric_code') ? 'border-nasa-red' : ''}`}
                  >
                    <option value="">Seleccionar</option>
                    {!metrics.some((metric) => metric.code === row.metric_code) && row.metric_code && (
                      <option value={row.metric_code}>{row.metric_code} · no admitida</option>
                    )}
                    {metrics.map((metric) => <option key={metric.code} value={metric.code}>{metric.label}</option>)}
                  </select>
                  <FieldError error={errorFor(errors, row.row, 'metric_code')} />
                </td>
                {(['value', 'unit', 'observed_at_utc'] as const).map((field) => {
                  const error = errorFor(errors, row.row, field)
                  return (
                    <td key={field} className="px-3 py-3 align-top">
                      <input
                        aria-label={`${field} de la fila ${row.row}`}
                        aria-invalid={Boolean(error)}
                        value={row[field]}
                        onChange={(event) => onChange(row.row, field, event.target.value)}
                        className={`${fieldClassName} ${field === 'observed_at_utc' ? 'min-w-52 font-mono' : ''} ${error ? 'border-nasa-red' : ''}`}
                      />
                      <FieldError error={error} />
                    </td>
                  )
                })}
                <td className="px-3 py-3 align-top">
                  <select aria-label={`Fase de la fila ${row.row}`} aria-invalid={Boolean(errorFor(errors, row.row, 'phase'))} value={row.phase} onChange={(event) => onChange(row.row, 'phase', event.target.value)} className={`${fieldClassName} ${errorFor(errors, row.row, 'phase') ? 'border-nasa-red' : ''}`}>
                    {!phases.some((phase) => phase.value === row.phase) && <option value={row.phase}>{row.phase || 'Seleccionar'}</option>}
                    {phases.map((phase) => <option key={phase.value} value={phase.value}>{phase.label}</option>)}
                  </select>
                  <FieldError error={errorFor(errors, row.row, 'phase')} />
                </td>
                <td className="px-3 py-3 align-top">
                  <select aria-label={`Calidad de la fila ${row.row}`} aria-invalid={Boolean(errorFor(errors, row.row, 'quality'))} value={row.quality} onChange={(event) => onChange(row.row, 'quality', event.target.value)} className={`${fieldClassName} ${errorFor(errors, row.row, 'quality') ? 'border-nasa-red' : ''}`}>
                    {!qualities.some((quality) => quality.value === row.quality) && <option value={row.quality}>{row.quality || 'Seleccionar'}</option>}
                    {qualities.map((quality) => <option key={quality.value} value={quality.value}>{quality.label}</option>)}
                  </select>
                  <FieldError error={errorFor(errors, row.row, 'quality')} />
                </td>
                <td className="px-3 py-3 align-top">
                  <input aria-label={`Actividad de la fila ${row.row}`} value={row.activity_context} onChange={(event) => onChange(row.row, 'activity_context', event.target.value)} className={fieldClassName} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-line lg:hidden">
        {rows.map((row) => (
          <article key={row.row} className="space-y-4 p-4" aria-label={`Fila importada ${row.row}`}>
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs font-semibold text-nasa-blue">FILA {row.row}</p>
              {errors.some((error) => error.row === row.row) && <span className="text-xs font-semibold text-nasa-red">Requiere corrección</span>}
            </div>
            <FieldError error={errors.find((error) => error.row === row.row && error.field === 'row')} />
            <div className="grid gap-3 sm:grid-cols-2">
              {([
                ['metric_code', 'Métrica'],
                ['value', 'Valor'],
                ['unit', 'Unidad'],
                ['observed_at_utc', 'Fecha UTC'],
                ['phase', 'Fase'],
                ['quality', 'Calidad'],
                ['activity_context', 'Actividad'],
              ] as Array<[ImportDraftField, string]>).map(([field, label]) => {
                const error = errorFor(errors, row.row, field)
                return (
                  <label key={field} className={`text-sm font-semibold text-ink ${field === 'observed_at_utc' ? 'sm:col-span-2' : ''}`}>
                    {label}
                    {field === 'metric_code' ? (
                      <select value={row[field]} aria-invalid={Boolean(error)} onChange={(event) => onChange(row.row, field, event.target.value)} className={`${fieldClassName} mt-1 ${error ? 'border-nasa-red' : ''}`}>
                        <option value="">Seleccionar</option>
                        {!metrics.some((metric) => metric.code === row[field]) && row[field] && <option value={row[field]}>{row[field]} · no admitida</option>}
                        {metrics.map((metric) => <option key={metric.code} value={metric.code}>{metric.label}</option>)}
                      </select>
                    ) : field === 'phase' ? (
                      <select value={row[field]} aria-invalid={Boolean(error)} onChange={(event) => onChange(row.row, field, event.target.value)} className={`${fieldClassName} mt-1 ${error ? 'border-nasa-red' : ''}`}>
                        {!phases.some((phase) => phase.value === row[field]) && <option value={row[field]}>{row[field] || 'Seleccionar'}</option>}
                        {phases.map((phase) => <option key={phase.value} value={phase.value}>{phase.label}</option>)}
                      </select>
                    ) : field === 'quality' ? (
                      <select value={row[field]} aria-invalid={Boolean(error)} onChange={(event) => onChange(row.row, field, event.target.value)} className={`${fieldClassName} mt-1 ${error ? 'border-nasa-red' : ''}`}>
                        {!qualities.some((quality) => quality.value === row[field]) && <option value={row[field]}>{row[field] || 'Seleccionar'}</option>}
                        {qualities.map((quality) => <option key={quality.value} value={quality.value}>{quality.label}</option>)}
                      </select>
                    ) : (
                      <input value={row[field]} aria-invalid={Boolean(error)} onChange={(event) => onChange(row.row, field, event.target.value)} className={`${fieldClassName} mt-1 ${error ? 'border-nasa-red' : ''}`} />
                    )}
                    <FieldError error={error} />
                  </label>
                )
              })}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
