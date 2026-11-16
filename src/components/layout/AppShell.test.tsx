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
  it('no renderiza breadcrumbs ni título duplicado en el navbar reutilizable', () => {
    render(
      <MemoryRouter>
        <AppShell environment="ship" activePath="/astronaut">
          <div>Contenido del resumen</div>
        </AppShell>
      </MemoryRouter>,
    )

    expect(screen.queryByRole('navigation', { name: 'Migas de pan' })).toBeNull()
    expect(screen.queryByText('Panel del astronauta')).toBeNull()
    expect(screen.queryByRole('link', { name: 'Informes' })).toBeNull()
    expect(screen.getByText('Astronauta Demo 01 · AST-001')).toBeTruthy()
    expect(screen.queryByText('Prototipo independiente')).toBeNull()
    expect(screen.queryByText('NASA Space Apps Challenge 2026')).toBeNull()
  })

  it('permite scroll vertical en vistas altas que ocupan el viewport', () => {
    render(
      <MemoryRouter>
        <AppShell
          environment="ship"
          activePath="/astronaut/reports/RPT-1"
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

  it('muestra la identidad médica encima de cerrar sesión en el sidebar', () => {
    render(
      <MemoryRouter>
        <AppShell environment="earth" activePath="/medical"><div>Bandeja</div></AppShell>
      </MemoryRouter>,
    )

    const profile = screen.getByText('Médico Demo · CMO-DEMO')
    const logout = screen.getByRole('button', { name: 'Cerrar sesión' })
    expect(profile.compareDocumentPosition(logout) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})
