import type { ParsedImportData } from './importTypes'

function parseCells(content: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index]

    if (quoted) {
      if (character === '"' && content[index + 1] === '"') {
        cell += '"'
        index += 1
      } else if (character === '"') {
        quoted = false
      } else {
        cell += character
      }
      continue
    }

    if (character === '"' && cell.length === 0) {
      quoted = true
    } else if (character === ',') {
      row.push(cell)
      cell = ''
    } else if (character === '\n') {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else if (character !== '\r') {
      cell += character
    }
  }

  if (quoted) throw new Error('El CSV contiene una comilla sin cerrar.')
  if (cell.length > 0 || row.length > 0) {
    row.push(cell)
    rows.push(row)
  }

  return rows
}

function isBlankRow(row: string[]) {
  return row.every((cell) => cell.trim().length === 0)
}

export function parseCsv(content: string): ParsedImportData {
  const normalizedContent = content.replace(/^\uFEFF/, '')
  if (normalizedContent.trim().length === 0) {
    return {
      columns: [],
      rows: [],
      errors: [{ row: 1, code: 'EMPTY_FILE', detail: 'El archivo CSV está vacío.' }],
    }
  }

  let matrix: string[][]
  try {
    matrix = parseCells(normalizedContent)
  } catch (error) {
    return {
      columns: [],
      rows: [],
      errors: [{
        row: 1,
        code: 'INVALID_CSV',
        detail: error instanceof Error ? error.message : 'El archivo CSV no tiene un formato válido.',
      }],
    }
  }

  const headerIndex = matrix.findIndex((row) => !isBlankRow(row))
  if (headerIndex < 0) {
    return {
      columns: [],
      rows: [],
      errors: [{ row: 1, code: 'EMPTY_FILE', detail: 'El archivo CSV no contiene encabezados.' }],
    }
  }

  const columns = matrix[headerIndex].map((column) => column.trim())
  const errors: ParsedImportData['errors'] = []
  const normalizedColumns = columns.map((column) => column.toLowerCase())

  columns.forEach((column, index) => {
    if (!column) {
      errors.push({ row: headerIndex + 1, code: 'EMPTY_COLUMN', detail: `La columna ${index + 1} no tiene nombre.` })
    } else if (normalizedColumns.indexOf(column.toLowerCase()) !== index) {
      errors.push({ row: headerIndex + 1, code: 'DUPLICATE_COLUMN', detail: `La columna "${column}" está repetida.` })
    }
  })

  if (errors.length > 0) return { columns, rows: [], errors }

  const rows = matrix
    .slice(headerIndex + 1)
    .map((cells, relativeIndex) => ({ cells, row: headerIndex + relativeIndex + 2 }))
    .filter(({ cells }) => !isBlankRow(cells))
    .flatMap(({ cells, row }) => {
      if (cells.length !== columns.length) {
        errors.push({
          row,
          code: 'COLUMN_COUNT',
          detail: `La fila contiene ${cells.length} valores y se esperaban ${columns.length}.`,
        })
        return []
      }

      return [{
        row,
        values: Object.fromEntries(columns.map((column, index) => [column, cells[index].trim()])),
      }]
    })

  if (rows.length === 0 && errors.length === 0) {
    errors.push({ row: headerIndex + 2, code: 'EMPTY_FILE', detail: 'El CSV no contiene filas de datos.' })
  }

  return { columns, rows, errors }
}
