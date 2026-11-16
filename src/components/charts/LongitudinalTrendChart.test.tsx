// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { trendsFixture } from '../../mocks/fixtures'

import { LongitudinalTrendChart } from './LongitudinalTrendChart'

afterEach(cleanup)

describe('LongitudinalTrendChart', () => {
  it('muestra una sola observación como punto, sin línea, y conserva n del baseline', () => {
    render(
      <LongitudinalTrendChart
        points={trendsFixture.points}
        baseline={trendsFixture.baseline}
        unit={trendsFixture.unit}
      />,
    )

    expect(screen.getByRole('img', {
      name: 'Gráfico de 1 observación en bpm; observaciones como puntos, sin línea de tendencia',
    })).not.toBeNull()
    expect(screen.getByText('Baseline demo: mediana 65 bpm · n=12')).not.toBeNull()
  })
})
