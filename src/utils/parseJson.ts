import type { DataSource, DataSourceKind } from '../types'
import type { ImportParseError, ParsedImportData, ParsedImportRow } from './importTypes'

const sourceKinds: ReadonlySet<DataSourceKind> = new Set<DataSourceKind>([
  'wearable', 'clinical_assessment', 'public_dataset', 'synthetic', 'manual', 'mission_context',
])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isOptionalText(value: unknown) {
  return value === undefined || value === null || typeof value === 'string'
}

function optionalText(value: unknown) {
  return typeof value === 'string' ? value : null
}

/**
 * Lee `source` de un ImportRequest canónico. Una fuente presente pero inválida es un error:
 * ignorarla en silencio permitiría reetiquetar datos sintéticos como no sintéticos.
 */
function parseSource(value: unknown): { source?: DataSource; error?: ImportParseError } {
  if (value === undefined) return {}
  const invalid = (detail: string) => ({ error: { row: 1, code: 'INVALID_SOURCE', detail } })
  if (!isRecord(value)) return invalid('La propiedad source debe ser un objeto.')
  const { id, kind, provider, is_synthetic: isSynthetic } = value
  if (typeof id !== 'string' || id.trim().length === 0) return invalid('source.id debe ser un texto no vacío.')
  if (typeof provider !== 'string' || provider.trim().length === 0) return invalid('source.provider debe ser un texto no vacío.')
  if (typeof kind !== 'string' || !sourceKinds.has(kind as DataSourceKind)) return invalid('source.kind no es un tipo de fuente admitido.')
  if (typeof isSynthetic !== 'boolean') return invalid('source.is_synthetic debe ser booleano.')
  if (kind === 'synthetic' && !isSynthetic) return invalid('Una fuente synthetic debe declarar is_synthetic=true.')
  if (!isOptionalText(value.device_model) || !isOptionalText(value.license) || !isOptionalText(value.citation)) {
    return invalid('source.device_model, source.license y source.citation deben ser texto o null.')
  }
  return {
    source: {
      id: id.trim(),
      kind: kind as DataSourceKind,
      provider: provider.trim(),
      device_model: optionalText(value.device_model),
      license: optionalText(value.license),
      citation: optionalText(value.citation),
      is_synthetic: isSynthetic,
    },
  }
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
  const parsedSource = isRecord(value) ? parseSource(value.source) : {}
  if (parsedSource.error) errors.push(parsedSource.error)
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
  return parsedSource.source ? { columns, rows, errors, source: parsedSource.source } : { columns, rows, errors }
}
