import { describe, expect, it } from 'vitest'
import type { ImportDraftRow } from './importTypes'
import { reconcileRejectedRows } from './reconcileImportResult'

const rows: ImportDraftRow[] = [
  {
    row: 2,
    metric_code: 'heart_rate',
    value: '71',
    unit: 'bpm',
    observed_at_utc: '2026-11-14T15:00:00Z',
    phase: 'inflight',
    quality: 'adequate',
    activity_context: 'rest',
    original: {},
  },
  {
    row: 3,
    metric_code: 'sleep_duration',
    value: '372',
    unit: 'min',
    observed_at_utc: '2026-11-14T06:00:00Z',
    phase: 'inflight',
    quality: 'unknown',
    activity_context: 'sleep',
    original: {},
  },
]

describe('reconcileRejectedRows', () => {
  it('mapea el índice cero-based del backend a la fila fuente rechazada', () => {
    const reconciled = reconcileRejectedRows(rows, {
      accepted: 1,
      rejected: 1,
      observation_ids: ['OBS-1'],
      errors: [{ row: 0, code: 'UNIT', detail: 'Unidad incompatible' }],
    })

    expect(reconciled.rows.map((row) => row.row)).toEqual([2])
    expect(reconciled.errors).toEqual([expect.objectContaining({ row: 2, field: 'row', code: 'UNIT' })])
  })

  it('conserva el índice cero-based para la segunda observación de la solicitud', () => {
    const reconciled = reconcileRejectedRows(rows, {
      accepted: 1,
      rejected: 1,
      observation_ids: ['OBS-1'],
      errors: [{ row: 1, code: 'DUPLICATE', detail: 'Registro duplicado' }],
    })

    expect(reconciled.rows.map((row) => row.row)).toEqual([3])
    expect(reconciled.errors[0].row).toBe(3)
  })
})
