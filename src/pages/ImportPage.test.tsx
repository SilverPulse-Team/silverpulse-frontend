// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'
import { createMockDataProvider } from '../mocks/mockApi'
import { resetDataProvider, setDataProvider } from '../services'
import { ImportPage } from './ImportPage'

afterEach(() => {
  cleanup()
  resetDataProvider()
})

describe('ImportPage', () => {
  it('conserva los valores y fases del fixture oficial en el escenario demo', async () => {
    setDataProvider(createMockDataProvider())
    render(
      <MemoryRouter>
        <ImportPage />
      </MemoryRouter>,
    )

    fireEvent.click(await screen.findByRole('radio', { name: /Escenario sintético demo/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }))

    expect(await screen.findByLabelText('Métrica de la fila 1')).toHaveProperty('value', 'heart_rate')
    expect(screen.getByLabelText('value de la fila 1')).toHaveProperty('value', '71')
    expect(screen.getByLabelText('Fase de la fila 1')).toHaveProperty('value', 'inflight')
    expect(screen.getByLabelText('Métrica de la fila 2')).toHaveProperty('value', 'sleep_duration')
    expect(screen.getByLabelText('value de la fila 2')).toHaveProperty('value', '372')
    expect(screen.getByLabelText('Fase de la fila 2')).toHaveProperty('value', 'inflight')
  })
})
