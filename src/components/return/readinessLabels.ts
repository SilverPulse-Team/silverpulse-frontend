import type { EvidenceCoverage, ReadinessDomainCode } from '../../types'

export const domainLabels: Record<ReadinessDomainCode, string> = {
  cardiovascular: 'Cardiovascular',
  musculoskeletal: 'Musculoesquelético',
  sleep: 'Sueño',
  sensorimotor: 'Sensorimotor',
  other: 'Otro dominio',
}

export const coverageLabels: Record<EvidenceCoverage, string> = {
  available: 'Disponible',
  partial: 'Parcial',
  insufficient: 'Insuficiente',
}

const metricLabels: Record<string, string> = {
  heart_rate: 'Frecuencia cardíaca',
  exercise_duration: 'Actividad registrada',
  sleep_duration: 'Duración de sueño',
  orthostatic_assessment: 'Evaluación ortostática',
  muscle_strength: 'Prueba de fuerza muscular',
  bone_density: 'Densidad ósea',
  balance_assessment: 'Evaluación del equilibrio',
}

const trendLabels: Record<string, string> = {
  review_needed: 'Requiere revisión',
  not_assessable: 'No evaluable',
  below_personal_baseline: 'Bajo referencia personal',
}

export function getEvidenceLabel(code: string) {
  return metricLabels[code] ?? code
}

export function getTrendLabel(trend: string) {
  return trendLabels[trend] ?? trend
}
