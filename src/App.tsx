import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { AppShell } from './components/layout/AppShell'
import { PageHeader } from './components/layout/PageHeader'
import type { ShellEnvironment } from './components/layout/navigation'
import { ConstructionState } from './components/states/ConstructionState'
import { ComponentLibraryPage } from './pages/ComponentLibraryPage'

const environmentOrder: ShellEnvironment[] = ['ship', 'earth', 'mission-control']
const environmentStorageKey = 'silverpulse-demo-environment'

interface ViewContent {
  title: string
  eyebrow: string
  description: string
  breadcrumb: string[]
  implemented: boolean
}

function getInitialEnvironment(): ShellEnvironment {
  try {
    const storedEnvironment = window.sessionStorage.getItem(environmentStorageKey)
    if (environmentOrder.includes(storedEnvironment as ShellEnvironment)) {
      return storedEnvironment as ShellEnvironment
    }
  } catch {
    // Session storage may be unavailable; ship remains the safe demo default.
  }

  return 'ship'
}

const previewContent: Record<
  ShellEnvironment,
  ViewContent & { path: string }
> = {
  ship: {
    path: '/astronaut',
    title: 'Panel del astronauta',
    eyebrow: 'Entorno nave',
    description: 'Observaciones registradas localmente en nave. Los módulos funcionales se implementarán en los siguientes epics.',
    breadcrumb: ['SilverPulse', 'Nave', 'Resumen'],
    implemented: true,
  },
  earth: {
    path: '/medical',
    title: 'Bandeja médica',
    eyebrow: 'Entorno Tierra',
    description: 'Este entorno mostrará únicamente informes entregados y guardados en Tierra, nunca datos locales pendientes en nave.',
    breadcrumb: ['SilverPulse', 'Tierra', 'Bandeja médica'],
    implemented: false,
  },
  'mission-control': {
    path: '/mission-control',
    title: 'SilverPulse Sync · Mission Control',
    eyebrow: 'Simulador de comunicación',
    description: 'Simulación local de enlace diferido. No representa una red espacial real ni un estado médico.',
    breadcrumb: ['SilverPulse', 'Mission Control'],
    implemented: false,
  },
}

const pendingViews: Record<string, ViewContent> = {
  '/login': {
    title: 'Acceso demostrativo',
    eyebrow: 'Selección de rol',
    description: 'Entrada opcional para perfiles ficticios de nave y Tierra.',
    breadcrumb: ['SilverPulse', 'Acceso demo'],
    implemented: false,
  },
  '/astronaut/import': {
    title: 'Importar observaciones',
    eyebrow: 'Entorno nave',
    description: 'Importación guiada de observaciones con procedencia conocida.',
    breadcrumb: ['SilverPulse', 'Nave', 'Importar datos'],
    implemented: false,
  },
  '/astronaut/trends': {
    title: 'Tendencias fisiológicas',
    eyebrow: 'Entorno nave',
    description: 'Comparación longitudinal por fase, fuente, calidad y contexto.',
    breadcrumb: ['SilverPulse', 'Nave', 'Tendencias'],
    implemented: false,
  },
  '/astronaut/return': {
    title: 'Preparación de retorno',
    eyebrow: 'Entorno nave',
    description: 'Resumen de cobertura de evidencia; no constituye una autorización médica.',
    breadcrumb: ['SilverPulse', 'Nave', 'Preparación de retorno'],
    implemented: false,
  },
  '/mission-control': previewContent['mission-control'],
  '/medical': previewContent.earth,
  '/evidence': {
    title: 'Evidencia y metodología',
    eyebrow: 'Sección compartida',
    description: 'Fuentes públicas, escenarios de prueba y limitaciones del prototipo.',
    breadcrumb: ['SilverPulse', 'Evidencia'],
    implemented: false,
  },
}

function resolveView(path: string, environment: ShellEnvironment): ViewContent {
  if (path === '/' || path === '/astronaut') {
    if (environment === 'mission-control') {
      return {
        title: 'Resumen de nave',
        eyebrow: 'Simulador local',
        description: 'Vista resumida del entorno nave disponible desde Mission Control.',
        breadcrumb: ['SilverPulse', 'Mission Control', 'Resumen de nave'],
        implemented: false,
      }
    }

    return previewContent.ship
  }

  if (path === '/mission-control') {
    if (environment === 'ship') {
      return {
        title: 'Comunicaciones',
        eyebrow: 'Entorno nave',
        description: 'Mensajes y estados de sincronización entre la nave y Tierra.',
        breadcrumb: ['SilverPulse', 'Nave', 'Comunicaciones'],
        implemented: false,
      }
    }

    return previewContent['mission-control']
  }

  if (pendingViews[path]) return pendingViews[path]

  if (path.startsWith('/astronaut/reports/')) {
    return {
      title: 'Informe de observación',
      eyebrow: 'ORBIT VERIFY · Entorno nave',
      description: 'Detalle trazable de un informe generado localmente en nave.',
      breadcrumb: ['SilverPulse', 'Nave', 'Informes'],
      implemented: false,
    }
  }

  if (path.startsWith('/medical/reports/')) {
    return {
      title: 'Revisión de informe',
      eyebrow: 'Entorno Tierra',
      description: 'Detalle de un informe recibido y su revisión por un perfil médico ficticio.',
      breadcrumb: ['SilverPulse', 'Tierra', 'Revisiones'],
      implemented: false,
    }
  }

  return previewContent[environment]
}

function App() {
  const [environment, setEnvironment] = useState<ShellEnvironment>(getInitialEnvironment)
  const location = useLocation()
  const navigate = useNavigate()
  const path = location.pathname
  const current = resolveView(path, environment)
  const activePath = path === '/' ? previewContent.ship.path : path

  const changeEnvironment = () => {
    const currentIndex = environmentOrder.indexOf(environment)
    const nextEnvironment = environmentOrder[(currentIndex + 1) % environmentOrder.length]
    try {
      window.sessionStorage.setItem(environmentStorageKey, nextEnvironment)
    } catch {
      // Navigation still works for this page even when storage is unavailable.
    }
    navigate(previewContent[nextEnvironment].path, { replace: true })
    setEnvironment(nextEnvironment)
  }

  return (
    <AppShell
      environment={environment}
      activePath={activePath}
      title={current.implemented ? current.title : 'SilverPulse'}
      breadcrumb={current.implemented ? current.breadcrumb : ['SilverPulse']}
      fitViewport={!current.implemented}
      onChangeEnvironment={changeEnvironment}
    >
      {current.implemented ? (
        <>
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
          <div className="mt-6">
            <ComponentLibraryPage />
          </div>
        </>
      ) : (
        <ConstructionState viewName={current.title} description={current.description} />
      )}
    </AppShell>
  )
}

export default App
