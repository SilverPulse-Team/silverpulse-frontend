import { describe, expect, it, vi } from 'vitest'
import { validateCountermeasureLog } from '../components/return/countermeasureValidation'
import { createMockDataProvider } from '../mocks/mockApi'
import type { CountermeasureLogInput } from '../types'
import { createHttpDataProvider } from './httpDataProvider'

const validInput = {
  plan_id: 'CM-001',
  completed_at_utc: '2026-11-15T14:00:00.000Z',
  duration_min: 30,
  self_reported: true,
  notes: 'Registro de prueba',
} satisfies CountermeasureLogInput

describe('registro de contramedidas autorizadas', () => {
  it('envía el schema exacto al plan del astronauta', async () => {
    const fetchImplementation = vi.fn<typeof fetch>(async () => new Response(
      JSON.stringify({ id: 'CMLOG-001', status: 'recorded' }),
      { status: 201, headers: { 'Content-Type': 'application/json' } },
    ))
    const provider = createHttpDataProvider({ baseUrl: 'http://localhost:8000/api/v1', fetchImplementation })

    const result = await provider.logCountermeasure('AST-001', validInput)

    expect(result).toEqual({ id: 'CMLOG-001', status: 'recorded' })
    const [url, options] = fetchImplementation.mock.calls[0]
    expect(String(url)).toBe('http://localhost:8000/api/v1/ship/astronauts/AST-001/countermeasures/logs')
    expect(options?.method).toBe('POST')
    expect(JSON.parse(String(options?.body))).toEqual(validInput)
  })

  it('actualiza el conteo mock únicamente después de registrar con éxito', async () => {
    const provider = createMockDataProvider()
    const before = await provider.getCountermeasures('AST-001')
    await provider.logCountermeasure('AST-001', validInput)
    const after = await provider.getCountermeasures('AST-001')

    expect(after[0].logs_completed).toBe(before[0].logs_completed + 1)
  })

  it('rechaza duración no positiva, fecha inválida y plan ausente antes del POST', () => {
    const values = { completedAt: '2026-11-15T14:00', duration: '0', selfReported: true, notes: '' }
    expect(validateCountermeasureLog('CM-001', values)).toBe('La duración debe ser mayor que cero.')
    expect(validateCountermeasureLog('CM-001', { ...values, completedAt: '', duration: '30' })).toBe('Ingresa una fecha y hora válidas.')
    expect(validateCountermeasureLog('', { ...values, duration: '30' })).toBe('El registro debe pertenecer a un plan existente.')
  })
})
