// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMockDataProvider } from '../mocks/mockApi'
import { resetDataProvider, setDataProvider, type DataProvider } from '../services'
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

  it('conserva kind=synthetic e is_synthetic=true al importar un JSON canónico sintético', async () => {
    const base = createMockDataProvider()
    const importObservations = vi.fn(base.importObservations)
    setDataProvider({ ...base, importObservations } satisfies DataProvider)
    render(
      <MemoryRouter>
        <ImportPage />
      </MemoryRouter>,
    )

    const source = {
      id: 'SCENARIO-FLT-001', kind: 'synthetic', provider: 'SilverPulse demo (semilla 20261114)',
      device_model: null, license: null, citation: null, is_synthetic: true,
    }
    const content = JSON.stringify({
      astronaut_id: 'AST-001',
      source,
      observations: [{
        metric_code: 'heart_rate', value: 65, unit: 'bpm', observed_at_utc: '2026-11-04T07:00:00Z',
        phase: 'inflight', quality: 'adequate', activity_context: 'rest',
      }],
    })
    fireEvent.click(await screen.findByRole('radio', { name: /Archivo JSON/ }))
    // Valores manuales previos: la procedencia declarada en el archivo debe prevalecer.
    fireEvent.change(screen.getByLabelText('Proveedor u origen'), { target: { value: 'Proveedor manual' } })
    fireEvent.change(screen.getByLabelText('Identificador de fuente'), { target: { value: 'MANUAL-1' } })
    const file = new File([content], 'scenario_inflight.json', { type: 'application/json' })
    fireEvent.change(document.getElementById('import-file') as HTMLInputElement, { target: { files: [file] } })

    expect(await screen.findByText('Procedencia leída del archivo')).toBeTruthy()
    expect(screen.getByLabelText('Tipo de fuente')).toHaveProperty('value', 'synthetic')
    for (let step = 0; step < 3; step += 1) fireEvent.click(screen.getByRole('button', { name: 'Continuar' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Registrar 1 observación' }))

    await waitFor(() => expect(importObservations).toHaveBeenCalledTimes(1))
    expect(importObservations.mock.calls[0][0].source).toEqual(source)
  })

  it('ofrece la opción Sintético (demo) para archivos CSV y la envía como sintética', async () => {
    const base = createMockDataProvider()
    const importObservations = vi.fn(base.importObservations)
    setDataProvider({ ...base, importObservations } satisfies DataProvider)
    render(
      <MemoryRouter>
        <ImportPage />
      </MemoryRouter>,
    )

    fireEvent.click(await screen.findByRole('radio', { name: /Archivo CSV/ }))
    expect(screen.getByRole('option', { name: 'Sintético (demo)' })).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Proveedor u origen'), { target: { value: 'SilverPulse demo' } })
    fireEvent.change(screen.getByLabelText('Identificador de fuente'), { target: { value: 'CSV-DEMO-01' } })
    fireEvent.change(screen.getByLabelText('Tipo de fuente'), { target: { value: 'synthetic' } })
    const csv = 'metric_code,value,unit,observed_at_utc,phase,quality,activity_context\nheart_rate,66,bpm,2026-11-04T07:00:00Z,inflight,adequate,rest\n'
    fireEvent.change(document.getElementById('import-file') as HTMLInputElement, {
      target: { files: [new File([csv], 'demo.csv', { type: 'text/csv' })] },
    })
    expect(await screen.findByText(/demo\.csv/)).toBeTruthy()
    for (let step = 0; step < 3; step += 1) fireEvent.click(screen.getByRole('button', { name: 'Continuar' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Registrar 1 observación' }))

    await waitFor(() => expect(importObservations).toHaveBeenCalledTimes(1))
    expect(importObservations.mock.calls[0][0].source).toMatchObject({ id: 'CSV-DEMO-01', kind: 'synthetic', is_synthetic: true })
  })
})
