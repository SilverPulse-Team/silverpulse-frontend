// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AppShell } from './AppShell'

beforeEach(() => {
  window.matchMedia = (media) => ({
    matches: true,
    media,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => true,
  })
})

afterEach(cleanup)

describe('AppShell', () => {
  it('permite scroll vertical en vistas altas que ocupan el viewport', () => {
    render(
      <MemoryRouter>
        <AppShell
          environment="ship"
          activePath="/astronaut/reports/RPT-1"
          title="SilverPulse"
          breadcrumb={[]}
          fitViewport
        >
          <div>Informe extenso</div>
        </AppShell>
      </MemoryRouter>,
    )

    const main = screen.getByRole('main')
    expect(main.className).toContain('overflow-y-auto')
    expect(main.className).not.toContain('overflow-hidden')
  })
})
