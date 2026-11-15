import type { ImportResult } from '../types'
import type { ImportDraftRow, ImportRowError } from './importTypes'

export function reconcileRejectedRows(rows: ImportDraftRow[], result: ImportResult): {
  rows: ImportDraftRow[]
  errors: ImportRowError[]
} {
  const matchedRows = result.errors.map((error) => (
    rows.find((row) => error.row === row.row) ?? rows[error.row - 1]
  ))
  const failedRowNumbers = new Set(matchedRows.flatMap((row) => row ? [row.row] : []))
  const failedRows = rows.filter((row) => failedRowNumbers.has(row.row))
  const rowsToCorrect = result.accepted > 0 && failedRows.length > 0 ? failedRows : rows

  const errors: ImportRowError[] = result.errors.flatMap((error) => {
    const matchedRow = rows.find((row) => error.row === row.row) ?? rows[error.row - 1]
    const rowNumber = matchedRow?.row ?? error.row
    if (!rowsToCorrect.some((row) => row.row === rowNumber)) return []
    return [{
      row: rowNumber,
      field: 'row',
      code: error.code,
      detail: error.detail,
    }]
  })

  return { rows: rowsToCorrect, errors }
}
