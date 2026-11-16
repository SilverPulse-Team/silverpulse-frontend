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
  it('muestra un inicio accionable cuando todavía no hay comunicaciones en Nave', async () => {
    const baseProvider = createMockDataProvider()
    setDataProvider({
      ...baseProvider,
      getShipReports: vi.fn(async () => ({ items: [], total: 0, limit: 25, offset: 0 })),
      getEarthReports: vi.fn(async () => ({ items: [], total: 0, limit: 25, offset: 0 })),
      getShipInbox: vi.fn(async () => ({ items: [] })),
    })
    render(<MemoryRouter><MissionControlPage environment="ship" /></MemoryRouter>)

    expect(await screen.findByRole('heading', { name: 'Comunicaciones' })).toBeTruthy()
    expect(await screen.findByText('Todavía no hay comunicaciones')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Ir a informes de nave' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Importar observaciones' })).toBeTruthy()
  })

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
