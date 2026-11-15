import type { ParsedImportData, ParsedImportRow } from './importTypes'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function parseJson(content: string): ParsedImportData {
  if (content.trim().length === 0) {
    return {
      columns: [],
      rows: [],
      errors: [{ row: 1, code: 'EMPTY_FILE', detail: 'El archivo JSON está vacío.' }],
    }
  }

  let value: unknown
  try {
    value = JSON.parse(content)
  } catch {
    return {
      columns: [],
      rows: [],
      errors: [{ row: 1, code: 'INVALID_JSON', detail: 'El contenido no es JSON válido.' }],
    }
  }

  const candidates = Array.isArray(value)
    ? value
    : isRecord(value) && Array.isArray(value.observations)
      ? value.observations
      : null

  if (!candidates) {
    return {
      columns: [],
      rows: [],
      errors: [{
        row: 1,
        code: 'INVALID_JSON_SHAPE',
        detail: 'El JSON debe ser un arreglo de observaciones o un objeto con la propiedad observations.',
      }],
    }
  }

  const errors: ParsedImportData['errors'] = []
  const rows = candidates.flatMap<ParsedImportRow>((candidate, index) => {
    if (!isRecord(candidate)) {
      errors.push({ row: index + 1, code: 'INVALID_ROW', detail: 'La fila JSON debe ser un objeto.' })
      return []
    }
    return [{ row: index + 1, values: candidate }]
  })

  if (rows.length === 0 && errors.length === 0) {
    errors.push({ row: 1, code: 'EMPTY_FILE', detail: 'El JSON no contiene observaciones.' })
  }

  const columns = [...new Set(rows.flatMap((row) => Object.keys(row.values)))]
  return { columns, rows, errors }
}
