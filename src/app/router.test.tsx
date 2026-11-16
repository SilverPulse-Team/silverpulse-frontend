// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMockDataProvider } from '../mocks/mockApi'
import { resetDataProvider, setDataProvider } from '../services'
import { demoSessionStorageKey, environmentStorageKey, startDemoSession } from './demoEnvironment'
import { AppRouter } from './router'

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

afterEach(() => {
  cleanup()
  window.sessionStorage.clear()
  vi.unstubAllEnvs()
  resetDataProvider()
})

describe('AppRouter demo session', () => {
  it('clears the demo session and returns to login when signing out', async () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <AppRouter />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Entrar como Médico de vuelo' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Cerrar sesión' }))

    expect(await screen.findByRole('heading', { name: '¿Desde qué entorno quieres explorar SilverPulse?' })).not.toBeNull()
    expect(window.sessionStorage.getItem(demoSessionStorageKey)).toBeNull()
    expect(window.sessionStorage.getItem(environmentStorageKey)).toBeNull()
  })

  it('redirects protected routes to login without a demo session', async () => {
    render(
      <MemoryRouter initialEntries={['/medical']}>
        <AppRouter />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: '¿Desde qué entorno quieres explorar SilverPulse?' })).not.toBeNull()
    expect(screen.queryByRole('button', { name: 'Cerrar sesión' })).toBeNull()
  })
})

describe('AppRouter /astronaut/analysis', () => {
  it('redirige al panel del astronauta cuando el asistente de a bordo está desactivado', async () => {
    vi.stubEnv('VITE_ENABLE_SHIP_ASSISTANT', 'false')
    setDataProvider(createMockDataProvider())
    startDemoSession('ship')
    render(
      <MemoryRouter initialEntries={['/astronaut/analysis']}>
        <AppRouter />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Panel del astronauta' })).not.toBeNull()
    expect(screen.queryByRole('heading', { name: 'Análisis guiado' })).toBeNull()
  })

  it('mantiene la página de análisis cuando VITE_ENABLE_SHIP_ASSISTANT=true', async () => {
    vi.stubEnv('VITE_ENABLE_SHIP_ASSISTANT', 'true')
    setDataProvider(createMockDataProvider())
    startDemoSession('ship')
    render(
      <MemoryRouter initialEntries={['/astronaut/analysis']}>
        <AppRouter />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Análisis guiado' })).not.toBeNull()
  })
})
