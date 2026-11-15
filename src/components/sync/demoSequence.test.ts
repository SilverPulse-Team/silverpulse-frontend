import { describe, expect, it } from 'vitest'
import {
  earthReportsAfterDeliveryFixture,
  emptyShipInboxFixture,
  shipInboxAfterReturnFixture,
  shipReportAfterReturnFixture,
  shipReportsFixture,
  simulatorMetricsFixture,
  simulatorStatusFixture,
} from '../../mocks/fixtures'
import { buildDemoSequenceEvents } from './demoSequence'

describe('secuencia guiada SilverPulse Sync', () => {
  it('solo confirma generación y cola observables en el escenario offline', () => {
    const events = buildDemoSequenceEvents({
      status: simulatorStatusFixture,
      metrics: simulatorMetricsFixture,
      shipReports: shipReportsFixture.items,
      earthReports: [],
      inboxMessages: emptyShipInboxFixture.items,
    })

    expect(events.map(({ id, status }) => [id, status])).toEqual([
      ['generate', 'complete'],
      ['offline', 'complete'],
      ['queue', 'complete'],
      ['reconnect', 'current'],
      ['advance', 'pending'],
      ['receive', 'pending'],
      ['review', 'pending'],
      ['return', 'pending'],
    ])
    expect(events[4].description).toContain('has_run=false')
  })

  it('distingue recepción confirmada de retorno recibido', () => {
    const events = buildDemoSequenceEvents({
      status: simulatorStatusFixture,
      metrics: simulatorMetricsFixture,
      shipReports: [shipReportAfterReturnFixture],
      earthReports: earthReportsAfterDeliveryFixture.items,
      inboxMessages: shipInboxAfterReturnFixture.items,
    })

    expect(events.find(({ id }) => id === 'receive')?.status).toBe('complete')
    expect(events.find(({ id }) => id === 'return')?.status).toBe('complete')
    expect(events.find(({ id }) => id === 'review')?.status).toBe('pending')
  })
})
