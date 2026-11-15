import { describe, expect, it } from 'vitest'
import { ApiClientError, type ApiErrorKind } from './apiClient'
import { describeImportFailure } from './importErrors'

describe('describeImportFailure', () => {
  const cases: Array<[number, ApiErrorKind, string]> = [
    [400, 'bad-request', 'formato o una unidad'],
    [409, 'conflict', 'conflicto'],
    [422, 'validation', 'esquema'],
  ]

  it.each(cases)('mantiene el estado HTTP %i y permite corregir filas', (status, kind, titlePart) => {
    const failure = describeImportFailure(new ApiClientError({
      status,
      kind,
      message: 'Mensaje del backend',
      detail: 'Detalle real del backend',
    }))

    expect(failure.status).toBe(status)
    expect(failure.title).toContain(titlePart)
    expect(failure.message).toBe('Detalle real del backend')
    expect(failure.canCorrectRows).toBe(true)
  })

  it('no presenta un error de red como validación de filas', () => {
    const failure = describeImportFailure(new ApiClientError({ kind: 'network', message: 'Sin conexión' }))
    expect(failure.status).toBeNull()
    expect(failure.canCorrectRows).toBe(false)
    expect(failure.message).toBe('Sin conexión')
  })
})
