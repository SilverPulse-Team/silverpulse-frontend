export type ParsedConfigNumbers =
  | { ok: true; one_way_latency_simulated_s: number; time_acceleration: number }
  | { ok: false; errors: { latency?: string; acceleration?: string } }

export function parseSimulatorConfigNumbers(
  latencyValue: string,
  accelerationValue: string,
): ParsedConfigNumbers {
  const latency = Number(latencyValue)
  const acceleration = Number(accelerationValue)
  const errors: { latency?: string; acceleration?: string } = {}

  if (!latencyValue.trim() || !Number.isInteger(latency) || latency < 0) {
    errors.latency = 'La latencia debe ser un entero mayor o igual a 0.'
  }
  if (!accelerationValue.trim() || !Number.isFinite(acceleration) || acceleration <= 0) {
    errors.acceleration = 'La aceleración debe ser un número mayor que 0.'
  }

  return Object.keys(errors).length > 0
    ? { ok: false, errors }
    : {
        ok: true,
        one_way_latency_simulated_s: latency,
        time_acceleration: acceleration,
      }
}

export function parseSimulatedSeconds(value: string) {
  const seconds = Number(value)
  if (!value.trim() || !Number.isInteger(seconds) || seconds < 1 || seconds > 86400) {
    return { ok: false as const, error: 'Ingresa un entero entre 1 y 86400 segundos.' }
  }
  return { ok: true as const, value: seconds }
}
