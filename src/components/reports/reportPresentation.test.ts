import { describe, expect, it } from 'vitest'
import {
  shipReportAfterDeliveryFixture,
  shipReportAfterReturnFixture,
  shipReportFixture,
  shipInboxAfterReturnFixture,
} from '../../mocks/fixtures'
import { buildCommunicationTimeline, explainReasonCode, labelEvidenceCode } from './reportPresentation'

describe('trazabilidad de informes ORBIT VERIFY', () => {
  it('mantiene entrega y revisión pendientes cuando el informe solo está en cola', () => {
    const events = buildCommunicationTimeline(shipReportFixture)

    expect(events.map(({ id, status }) => [id, status])).toEqual([
      ['generated', 'complete'],
      ['queued', 'current'],
      ['delivered', 'pending'],
      ['reviewed', 'pending'],
      ['returned', 'pending'],
    ])
    expect(events[1].description).toContain('no prioridad de emergencia')
  })

  it('distingue la entrega confirmada de una revisión que aún no ha regresado', () => {
    const events = buildCommunicationTimeline(shipReportAfterDeliveryFixture)

    expect(events.find(({ id }) => id === 'delivered')).toMatchObject({ status: 'complete' })
    expect(events.find(({ id }) => id === 'reviewed')).toMatchObject({ status: 'current' })
    expect(events.find(({ id }) => id === 'returned')).toMatchObject({ status: 'pending' })
  })

  it('marca el retorno solo con la respuesta presente en el inbox de nave', () => {
    const returnedMessage = shipInboxAfterReturnFixture.items[0]
    const events = buildCommunicationTimeline(shipReportAfterReturnFixture, returnedMessage)

    expect(events.find(({ id }) => id === 'reviewed')).toMatchObject({ status: 'complete' })
    expect(events.find(({ id }) => id === 'returned')).toMatchObject({
      status: 'complete',
      timestamp: returnedMessage.received_at_utc,
    })
  })

  it('preserva códigos originales y no inventa explicaciones para códigos desconocidos', () => {
    expect(explainReasonCode('SLEEP_TREND')).toContain('cambios descriptivos')
    expect(explainReasonCode('UNLISTED_CODE')).toContain('no proporciona una explicación')
    expect(labelEvidenceCode('muscle_strength')).toBe('Fuerza muscular')
    expect(labelEvidenceCode('unlisted_evidence')).toBe('unlisted_evidence')
  })
})
