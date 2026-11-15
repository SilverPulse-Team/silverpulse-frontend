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
  it('prepara datos sintéticos preflight e inflight en el escenario demo', async () => {
    setDataProvider(createMockDataProvider())
    render(
      <MemoryRouter>
        <ImportPage />
      </MemoryRouter>,
    )

    fireEvent.click(await screen.findByRole('radio', { name: /Escenario sintético demo/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }))

    expect(await screen.findByLabelText('Fase de la fila 1')).toHaveProperty('value', 'preflight')
    expect(screen.getByLabelText('Fase de la fila 2')).toHaveProperty('value', 'inflight')
  })
})
