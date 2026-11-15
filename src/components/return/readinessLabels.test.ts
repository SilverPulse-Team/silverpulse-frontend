import { describe, expect, it } from 'vitest'
import { readinessFixture } from '../../mocks/fixtures'
import { coverageLabels, domainLabels, getEvidenceLabel, getTrendLabel } from './readinessLabels'

describe('etiquetas de preparación de retorno', () => {
  it('mantiene los cuatro dominios y coberturas del fixture v0.2.0', () => {
    expect(readinessFixture.domains.map(({ code, coverage }) => ({ code, coverage }))).toEqual([
      { code: 'cardiovascular', coverage: 'partial' },
      { code: 'musculoskeletal', coverage: 'insufficient' },
      { code: 'sleep', coverage: 'available' },
      { code: 'sensorimotor', coverage: 'insufficient' },
    ])

    expect(readinessFixture.domains.map((domain) => ({
      domain: domainLabels[domain.code],
      coverage: coverageLabels[domain.coverage],
    }))).toEqual([
      { domain: 'Cardiovascular', coverage: 'Parcial' },
      { domain: 'Musculoesquelético', coverage: 'Insuficiente' },
      { domain: 'Sueño', coverage: 'Disponible' },
      { domain: 'Sensorimotor', coverage: 'Insuficiente' },
    ])
  })

  it('traduce la evidencia y tendencias conocidas sin agregar mediciones', () => {
    expect(getEvidenceLabel('heart_rate')).toBe('Frecuencia cardíaca')
    expect(getEvidenceLabel('orthostatic_assessment')).toBe('Evaluación ortostática')
    expect(getTrendLabel('review_needed')).toBe('Requiere revisión')
  })

  it('conserva exactamente las pruebas faltantes declaradas por la respuesta', () => {
    expect(readinessFixture.domains.flatMap((domain) => domain.missing)).toEqual([
      'orthostatic_assessment',
      'muscle_strength',
      'bone_density',
      'balance_assessment',
    ])
  })

  it('conserva códigos desconocidos para no inventar su significado', () => {
    expect(getEvidenceLabel('future_contract_code')).toBe('future_contract_code')
    expect(getTrendLabel('future_trend')).toBe('future_trend')
  })
})
