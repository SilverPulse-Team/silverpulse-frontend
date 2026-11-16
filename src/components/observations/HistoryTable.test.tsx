// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createMockDataProvider } from '../../mocks/mockApi'
import { setDataProvider, resetDataProvider } from '../../services'
import { metricCatalogFixture } from '../../mocks/fixtures'
import { HistoryTable } from './HistoryTable'

beforeEach(() => {
  setDataProvider(createMockDataProvider())
})

afterEach(() => {
  cleanup()
  resetDataProvider()
})

describe('HistoryTable', () => {
  it('etiqueta registros sintéticos recibidos en el historial', async () => {
    render(<HistoryTable astronautId="AST-001" metrics={metricCatalogFixture} />)

    expect((await screen.findAllByText('Sintético · DEMO')).length).toBeGreaterThan(0)
  })
})
