import { describe, expect, it } from 'vitest'
import type { DataSource, MetricDefinition } from '../types'
import { buildImportRequest, mapObservations, parseCsv, parseJson, validateImportRows } from './import'

const metrics: MetricDefinition[] = [
  {
    code: 'heart_rate',
    label: 'Frecuencia cardíaca',
    unit: 'bpm',
    supported_source_kinds: ['wearable', 'public_dataset', 'synthetic'],
    clinical_note: 'Interpretar según método y contexto',
  },
  {
    code: 'sleep_duration',
    label: 'Duración de sueño',
    unit: 'min',
    supported_source_kinds: ['wearable', 'public_dataset', 'synthetic'],
    clinical_note: 'Estimación no equivalente a polisomnografía',
  },
]

const syntheticSource: DataSource = {
  id: 'SCENARIO-001',
  kind: 'synthetic',
  provider: 'SilverPulse demo',
  device_model: null,
  license: null,
  citation: null,
  is_synthetic: true,
}

const defaults = { phase: 'inflight', quality: 'unknown', activity_context: 'rest' }

describe('parseCsv', () => {
  it('convierte filas CSV y respeta valores entre comillas', () => {
    const parsed = parseCsv([
      'metric_code,value,unit,observed_at_utc,phase,quality,activity_context,note',
      'heart_rate,71,bpm,2026-11-14T15:00:00Z,inflight,adequate,rest,"demo, local"',
    ].join('\n'))

    expect(parsed.errors).toEqual([])
    expect(parsed.rows).toHaveLength(1)
    expect(parsed.rows[0].row).toBe(2)
    expect(parsed.rows[0].values.note).toBe('demo, local')
  })

  it('reporta encabezados duplicados y filas con distinta cantidad de columnas', () => {
    const duplicated = parseCsv('metric_code,metric_code\nheart_rate,heart_rate')
    expect(duplicated.errors[0].code).toBe('DUPLICATE_COLUMN')

    const uneven = parseCsv('metric_code,value,unit\nheart_rate,71')
    expect(uneven.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ row: 2, code: 'COLUMN_COUNT' }),
    ]))
  })
})

describe('parseJson', () => {
  it('acepta un ImportRequest de ejemplo y extrae observations', () => {
    const parsed = parseJson(JSON.stringify({
      astronaut_id: 'AST-001',
      source: syntheticSource,
      observations: [{
        metric_code: 'heart_rate',
        value: 71,
        unit: 'bpm',
        observed_at_utc: '2026-11-14T15:00:00Z',
        phase: 'inflight',
        quality: 'adequate',
        activity_context: 'rest',
      }],
    }))

    expect(parsed.errors).toEqual([])
    expect(parsed.rows).toHaveLength(1)
    expect(parsed.columns).toContain('metric_code')
  })

  it('rechaza JSON inválido y formas sin arreglo de observaciones', () => {
    expect(parseJson('{').errors[0].code).toBe('INVALID_JSON')
    expect(parseJson('{"metric_code":"heart_rate"}').errors[0].code).toBe('INVALID_JSON_SHAPE')
  })
})

describe('mapeo y validación canónica', () => {
  it('construye un ImportRequest JSON compatible y preserva el registro original', () => {
    const parsed = parseJson(JSON.stringify([
      {
        metric_code: 'heart_rate',
        value: 71,
        unit: 'bpm',
        observed_at_utc: '2026-11-14T15:00:00Z',
        phase: 'inflight',
        quality: 'adequate',
        activity_context: 'rest',
      },
      {
        metric_code: 'sleep_duration',
        value: 372,
        unit: 'min',
        observed_at_utc: '2026-11-14T06:00:00Z',
        phase: 'inflight',
        quality: 'unknown',
        activity_context: 'sleep',
      },
    ]))
    const rows = mapObservations(parsed.rows, defaults)
    const result = buildImportRequest({ astronautId: 'AST-001', source: syntheticSource, rows, metrics })

    expect(result.validation.errors).toEqual([])
    expect(result.request).toMatchObject({
      astronaut_id: 'AST-001',
      source: syntheticSource,
      observations: [
        { metric_code: 'heart_rate', value: 71, unit: 'bpm' },
        { metric_code: 'sleep_duration', value: 372, unit: 'min' },
      ],
    })
    expect(result.request?.observations[0].context).toMatchObject({
      import_row: 1,
      original_record: { metric_code: 'heart_rate', value: 71 },
    })
  })

  it('muestra fila y causa para fecha, unidad y campos requeridos inválidos', () => {
    const rows = mapObservations(parseCsv([
      'metric_code,value,unit,observed_at_utc,phase,quality',
      'heart_rate,71,mmHg,no-es-fecha,inflight,adequate',
      'sleep_duration,,min,2026-11-14T06:00:00Z,inflight,unknown',
    ].join('\n')).rows, defaults)

    const result = validateImportRows(rows, metrics, 'wearable')
    expect(result.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ row: 2, field: 'unit', code: 'UNSUPPORTED_UNIT' }),
      expect.objectContaining({ row: 2, field: 'observed_at_utc', code: 'INVALID_DATE' }),
      expect.objectContaining({ row: 3, field: 'value', code: 'REQUIRED' }),
    ]))
  })

  it('rechaza fechas ISO con un día calendario imposible', () => {
    const rows = mapObservations(parseJson(JSON.stringify([{
      metric_code: 'heart_rate',
      value: 71,
      unit: 'bpm',
      observed_at_utc: '2026-02-31T15:00:00Z',
      phase: 'inflight',
      quality: 'adequate',
    }])).rows, defaults)

    expect(validateImportRows(rows, metrics, 'wearable').errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ field: 'observed_at_utc', code: 'INVALID_DATE' }),
    ]))
  })

  it('rechaza valores JSON con tipos incompatibles en vez de convertir objetos', () => {
    const rows = mapObservations(parseJson(JSON.stringify([{
      metric_code: 'heart_rate',
      value: { raw: 71 },
      unit: 'bpm',
      observed_at_utc: '2026-11-14T15:00:00Z',
      phase: 'inflight',
      quality: 'adequate',
    }])).rows, defaults)

    expect(validateImportRows(rows, metrics, 'wearable').errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ field: 'value', code: 'REQUIRED' }),
    ]))
  })

  it('no convierte PPG/MAX30102 en presión arterial no soportada', () => {
    const rows = mapObservations(parseJson(JSON.stringify([{
      metric_code: 'blood_pressure',
      value: '120/80',
      unit: 'mmHg',
      observed_at_utc: '2026-11-14T15:00:00Z',
      phase: 'inflight',
      quality: 'unknown',
      device_model: 'MAX30102',
    }])).rows, defaults)

    const result = validateImportRows(rows, metrics, 'wearable')
    expect(result.validRows).toEqual([])
    expect(result.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ field: 'metric_code', code: 'UNSUPPORTED_METRIC' }),
    ]))
  })

  it('permite corregir una fila y volver a validarla', () => {
    const [row] = mapObservations(parseJson(JSON.stringify([{
      metric_code: 'heart_rate',
      value: 71,
      unit: 'mmHg',
      observed_at_utc: '2026-11-14T15:00:00Z',
      phase: 'inflight',
      quality: 'adequate',
    }])).rows, defaults)

    expect(validateImportRows([row], metrics, 'wearable').errors).toHaveLength(1)
    const corrected = { ...row, unit: 'bpm' }
    expect(validateImportRows([corrected], metrics, 'wearable').errors).toEqual([])
  })
})
