import { useState } from 'react'
import { AppShell } from './components/layout/AppShell'
import { PageHeader } from './components/layout/PageHeader'
import type { ShellEnvironment } from './components/layout/navigation'

const environmentOrder: ShellEnvironment[] = ['ship', 'earth', 'mission-control']

function getInitialEnvironment(): ShellEnvironment {
  const path = window.location.pathname
  if (path.startsWith('/medical')) return 'earth'
  if (path.startsWith('/mission-control')) return 'mission-control'
  return 'ship'
}

const previewContent: Record<
  ShellEnvironment,
  { path: string; title: string; eyebrow: string; description: string; breadcrumb: string[] }
> = {
  ship: {
    path: '/astronaut',
    title: 'Panel del astronauta',
    eyebrow: 'Entorno nave',
    description: 'Observaciones registradas localmente en nave. Los módulos funcionales se implementarán en los siguientes epics.',
    breadcrumb: ['SilverPulse', 'Nave', 'Resumen'],
  },
  earth: {
    path: '/medical',
    title: 'Bandeja médica',
    eyebrow: 'Entorno Tierra',
    description: 'Este entorno mostrará únicamente informes entregados y guardados en Tierra, nunca datos locales pendientes en nave.',
    breadcrumb: ['SilverPulse', 'Tierra', 'Bandeja médica'],
  },
  'mission-control': {
    path: '/mission-control',
    title: 'SilverPulse Sync · Mission Control',
    eyebrow: 'Simulador de comunicación',
    description: 'Simulación local de enlace diferido. No representa una red espacial real ni un estado médico.',
    breadcrumb: ['SilverPulse', 'Mission Control'],
  },
}

function App() {
  const [environment, setEnvironment] = useState<ShellEnvironment>(getInitialEnvironment)
  const current = previewContent[environment]
  const activePath = window.location.pathname === '/' ? current.path : window.location.pathname

  const changeEnvironment = () => {
    const currentIndex = environmentOrder.indexOf(environment)
    const nextEnvironment = environmentOrder[(currentIndex + 1) % environmentOrder.length]
    window.history.replaceState(null, '', previewContent[nextEnvironment].path)
    setEnvironment(nextEnvironment)
  }

  return (
    <AppShell
      environment={environment}
      activePath={activePath}
      title={current.title}
      breadcrumb={current.breadcrumb}
      onChangeEnvironment={changeEnvironment}
    >
      <PageHeader
        eyebrow={current.eyebrow}
        title={current.title}
        description={current.description}
        badge={
          <span className="rounded-full border border-notice/30 bg-notice/10 px-3 py-1 text-xs font-semibold text-ink">
            DATOS SINTÉTICOS · DEMO
          </span>
        }
      />

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Vista previa del layout">
        <article className="rounded-card border border-line bg-card p-5 shadow-card">
          <p className="text-sm font-semibold text-nasa-blue">Navegación contextual</p>
          <h2 className="mt-2 text-lg font-semibold">Entorno siempre visible</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            El menú cambia según nave, Tierra o control de misión y conserva Evidencia como sección compartida.
          </p>
        </article>
        <article className="rounded-card border border-line bg-card p-5 shadow-card">
          <p className="text-sm font-semibold text-nasa-blue">Responsive</p>
          <h2 className="mt-2 text-lg font-semibold">Tres modos de navegación</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Sidebar completa en desktop, barra compacta en tablet y drawer accesible en móvil.
          </p>
        </article>
        <article className="rounded-card border border-line bg-card p-5 shadow-card md:col-span-2 xl:col-span-1">
          <p className="text-sm font-semibold text-nasa-blue">Separación operativa</p>
          <h2 className="mt-2 text-lg font-semibold">Nave y Tierra no se mezclan</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            El estado offline describe el enlace de comunicación y no comunica peligro o condición clínica.
          </p>
        </article>
      </section>

      <div className="mt-6 rounded-card border border-data/30 bg-data/5 p-5">
        <p className="text-sm font-semibold text-ink">Vista técnica FE-05</p>
        <p className="mt-1 text-sm leading-6 text-muted">
          Usa «Cambiar entorno demo» al final del menú para revisar las variantes. Las páginas finales reemplazarán este contenido al configurar React Router en FE-07.
        </p>
      </div>
    </AppShell>
  )
}

export default App
