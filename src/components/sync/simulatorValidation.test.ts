import { describe, expect, it } from 'vitest'
import { parseSimulatedSeconds, parseSimulatorConfigNumbers } from './simulatorValidation'

describe('validación de controles del simulador', () => {
  it('acepta latencia cero y aceleración positiva', () => {
    expect(parseSimulatorConfigNumbers('0', '0.5')).toEqual({
      ok: true,
      one_way_latency_simulated_s: 0,
      time_acceleration: 0.5,
    })
  })

  it.each([
    ['', '1'],
    ['-1', '1'],
    ['1.5', '1'],
    ['0', '0'],
    ['0', '-1'],
    ['0', 'Infinity'],
  ])('rechaza latencia/aceleración inválidas: %s / %s', (latency, acceleration) => {
    expect(parseSimulatorConfigNumbers(latency, acceleration).ok).toBe(false)
  })

  it.each([
    ['1', true],
    ['86400', true],
    ['0', false],
    ['86401', false],
    ['1.5', false],
    ['', false],
  ])('valida el paso de reloj %s', (value, valid) => {
    expect(parseSimulatedSeconds(value).ok).toBe(valid)
  })
})
