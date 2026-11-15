// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMockDataProvider } from '../mocks/mockApi'
import { simulatorStatusFixture } from '../mocks/fixtures'
import { resetDataProvider, setDataProvider, type DataProvider } from '../services'
import type { SimulatorStatus } from '../types'
import { MissionControlPage } from './MissionControlPage'

afterEach(() => {
  cleanup()
  resetDataProvider()
})

describe('MissionControlPage', () => {
  it('deshabilita las acciones mientras una configuración HTTP sigue pendiente', async () => {
    let finishConfiguration!: (status: SimulatorStatus) => void
    const baseProvider = createMockDataProvider()
    const configureSimulator = vi.fn<DataProvider['configureSimulator']>(
      () => new Promise((resolve) => { finishConfiguration = resolve }),
    )
    const provider: DataProvider = {
      ...baseProvider,
      metadata: {
        ...baseProvider.metadata,
        mode: 'http',
        persistence: 'backend',
        acknowledgements: 'backend',
      },
      configureSimulator,
    }
    setDataProvider(provider)
    render(
      <MemoryRouter>
        <MissionControlPage />
      </MemoryRouter>,
    )

    const configureButton = await screen.findByRole('button', { name: 'Aplicar configuración' })
    fireEvent.change(screen.getByLabelText('Modo del enlace'), { target: { value: 'delayed' } })
    fireEvent.click(configureButton)

    await waitFor(() => expect(configureButton).toHaveProperty('disabled', true))
    expect(screen.getByRole('button', { name: 'Avanzar simulación' })).toHaveProperty('disabled', true)

    finishConfiguration({ ...simulatorStatusFixture, mode: 'delayed' })
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Aplicar configuración' })).toHaveProperty('disabled', false),
    )
  })
})
