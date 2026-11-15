import type { CountermeasureLogInput } from '../../types'

export interface CountermeasureLogFormValues {
  completedAt: string
  duration: string
  selfReported: boolean
  notes: string
}

export function validateCountermeasureLog(
  planId: string,
  values: CountermeasureLogFormValues,
): CountermeasureLogInput | string {
  const completedAt = new Date(values.completedAt)
  const duration = Number(values.duration)

  if (!planId) return 'El registro debe pertenecer a un plan existente.'
  if (!values.completedAt || Number.isNaN(completedAt.getTime())) return 'Ingresa una fecha y hora válidas.'
  if (!Number.isFinite(duration) || duration <= 0) return 'La duración debe ser mayor que cero.'

  return {
    plan_id: planId,
    completed_at_utc: completedAt.toISOString(),
    duration_min: duration,
    self_reported: values.selfReported,
    notes: values.notes.trim() || null,
  }
}
