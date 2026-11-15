import { useState } from 'react'
import { Navigate, Route, Routes, matchPath, useLocation, useNavigate } from 'react-router'
import { AppShell } from '../components/layout/AppShell'
import type { BreadcrumbItem } from '../components/layout/Topbar'
import type { ShellEnvironment } from '../components/layout/navigation'
import { AstronautOverviewPage } from '../pages/AstronautOverviewPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { PlaceholderPage } from '../pages/PlaceholderPage'
import { ReportPlaceholderPage } from '../pages/ReportPlaceholderPage'

const environmentOrder: ShellEnvironment[] = ['ship', 'earth', 'mission-control']
const environmentStorageKey = 'silverpulse-demo-environment'

const environmentHome: Record<ShellEnvironment, string> = {
  ship: '/astronaut',
  earth: '/medical',
  'mission-control': '/mission-control',
}

interface RouteInfo {
  title: string
  breadcrumb: BreadcrumbItem[]
  fitViewport: boolean
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

function breadcrumbFor(environment: ShellEnvironment, currentLabel: string, sectionLabel?: string): BreadcrumbItem[] {
  const home = environmentHome[environment]
  const items: BreadcrumbItem[] = [{ label: 'SilverPulse', href: home }]

  if (sectionLabel) {
    items.push({ label: sectionLabel, href: home })
  }

  items.push({ label: currentLabel })
  return items
}

function resolveRouteInfo(path: string, environment: ShellEnvironment): RouteInfo {
  if (path === '/' || path === '/astronaut') {
    const isShipOverview = environment === 'ship'
    return {
      title: isShipOverview ? 'Panel del astronauta' : 'SilverPulse',
      breadcrumb: breadcrumbFor(environment, environment === 'mission-control' ? 'Resumen de nave' : 'Resumen', environment === 'ship' ? 'Nave' : undefined),
      fitViewport: !isShipOverview,
    }
  }

  const exactRoutes: Record<string, { label: string; section?: string }> = {
    '/login': { label: 'Acceso demo' },
    '/astronaut/import': { label: 'Importar datos', section: 'Nave' },
    '/astronaut/trends': { label: 'Tendencias', section: 'Nave' },
    '/astronaut/return': { label: 'Preparación de retorno', section: 'Nave' },
    '/medical': { label: 'Bandeja médica', section: 'Tierra' },
    '/evidence': { label: 'Evidencia' },
  }

  if (exactRoutes[path]) {
    const route = exactRoutes[path]
    return { title: 'SilverPulse', breadcrumb: breadcrumbFor(environment, route.label, route.section), fitViewport: true }
  }

  if (path === '/mission-control') {
    const label = environment === 'ship' ? 'Comunicaciones' : 'Control de enlace'
    const section = environment === 'ship' ? 'Nave' : 'Mission Control'
    return { title: 'SilverPulse', breadcrumb: breadcrumbFor(environment, label, section), fitViewport: true }
  }

  const shipReport = matchPath('/astronaut/reports/:id', path)
  if (shipReport) {
    return {
      title: 'SilverPulse',
      breadcrumb: breadcrumbFor(environment, shipReport.params.id ?? 'Informe', 'Informes'),
      fitViewport: true,
    }
  }

  const earthReport = matchPath('/medical/reports/:id', path)
  if (earthReport) {
    return {
      title: 'SilverPulse',
      breadcrumb: breadcrumbFor(environment, earthReport.params.id ?? 'Revisión', 'Revisiones'),
      fitViewport: true,
    }
  }

  return {
    title: 'Página no encontrada',
    breadcrumb: breadcrumbFor(environment, 'Error 404'),
    fitViewport: true,
  }
}

export function AppRouter() {
  const [environment, setEnvironment] = useState<ShellEnvironment>(getInitialEnvironment)
  const location = useLocation()
  const navigate = useNavigate()
  const routeInfo = resolveRouteInfo(location.pathname, environment)
  const activePath = location.pathname === '/' ? '/astronaut' : location.pathname

  const changeEnvironment = () => {
    const currentIndex = environmentOrder.indexOf(environment)
    const nextEnvironment = environmentOrder[(currentIndex + 1) % environmentOrder.length]

    try {
      window.sessionStorage.setItem(environmentStorageKey, nextEnvironment)
    } catch {
      // The environment still changes for this page if storage is unavailable.
    }

    setEnvironment(nextEnvironment)
    navigate(environmentHome[nextEnvironment], { replace: true })
  }

  return (
    <AppShell
      environment={environment}
      activePath={activePath}
      title={routeInfo.title}
      breadcrumb={routeInfo.breadcrumb}
      fitViewport={routeInfo.fitViewport}
      onChangeEnvironment={changeEnvironment}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/astronaut" replace />} />
        <Route
          path="/login"
          element={<PlaceholderPage viewName="Acceso demostrativo" description="Permitirá elegir un perfil ficticio de nave o Tierra sin presentar una autenticación clínica inexistente." />}
        />
        <Route
          path="/astronaut"
          element={
            environment === 'ship' ? (
              <AstronautOverviewPage />
            ) : (
              <PlaceholderPage viewName="Resumen de nave" description="Contendrá una vista resumida del entorno nave sin cambiar el entorno demo seleccionado." />
            )
          }
        />
        <Route
          path="/astronaut/import"
          element={<PlaceholderPage viewName="Importar observaciones" description="Contendrá la importación guiada de registros con procedencia, unidad, calidad, fase y fecha conocidas." />}
        />
        <Route
          path="/astronaut/trends"
          element={<PlaceholderPage viewName="Tendencias fisiológicas" description="Contendrá comparaciones longitudinales por fase, fuente, calidad y contexto de actividad." />}
        />
        <Route
          path="/astronaut/return"
          element={<PlaceholderPage viewName="Preparación de retorno" description="Contendrá la cobertura de evidencia disponible y faltante sin calcular una aptitud clínica automática." />}
        />
        <Route
          path="/mission-control"
          element={
            <PlaceholderPage
              viewName={environment === 'ship' ? 'Comunicaciones' : 'SilverPulse Sync · Mission Control'}
              description={environment === 'ship' ? 'Contendrá mensajes y estados de sincronización entre la nave y Tierra.' : 'Contendrá el simulador local de enlace diferido; no representa una red espacial real.'}
            />
          }
        />
        <Route
          path="/medical"
          element={<PlaceholderPage viewName="Bandeja médica" description="Contendrá únicamente informes entregados y guardados en Tierra, nunca datos locales pendientes en nave." />}
        />
        <Route path="/medical/reports/:id" element={<ReportPlaceholderPage context="earth" />} />
        <Route path="/astronaut/reports/:id" element={<ReportPlaceholderPage context="ship" />} />
        <Route
          path="/evidence"
          element={<PlaceholderPage viewName="Evidencia y metodología" description="Contendrá fuentes públicas, metodología reproducible, resultados ejecutados y limitaciones del prototipo." />}
        />
        <Route path="*" element={<NotFoundPage homePath={environmentHome[environment]} />} />
      </Routes>
    </AppShell>
  )
}
