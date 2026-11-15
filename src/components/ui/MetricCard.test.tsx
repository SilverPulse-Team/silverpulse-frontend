// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MetricCard } from './MetricCard'

afterEach(cleanup)

describe('MetricCard', () => {
  it('representa un valor nulo como Sin datos y omite metadatos no disponibles', () => {
    render(<MetricCard label="Fuerza muscular" value={null} helperText="Evidencia insuficiente" />)

    expect(screen.getByText('Sin datos')).not.toBeNull()
    expect(screen.getByText('Evidencia insuficiente')).not.toBeNull()
    expect(screen.queryByText(/Fuente:/)).toBeNull()
  })

  it('mantiene visible la procedencia sintética del valor', () => {
    render(
      <MetricCard
        label="Frecuencia cardíaca"
        value={71}
        unit="bpm"
        source="synthetic"
        quality="adequate"
        phase="inflight"
        observedAt="2026-11-14T15:00:00Z"
      />,
    )

    expect(screen.getByText('Fuente: Sintético')).not.toBeNull()
  })
})
