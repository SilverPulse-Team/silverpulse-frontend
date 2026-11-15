import { lazy, Suspense, useState } from 'react'
import { Navigate, Route, Routes, matchPath, useLocation, useNavigate } from 'react-router'
import { AppShell } from '../components/layout/AppShell'
import type { BreadcrumbItem } from '../components/layout/Topbar'
import type { ShellEnvironment } from '../components/layout/navigation'
import { LoadingSkeleton } from '../components/ui'
import { AstronautOverviewPage } from '../pages/AstronautOverviewPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { PlaceholderPage } from '../pages/PlaceholderPage'
import { ReportPlaceholderPage } from '../pages/ReportPlaceholderPage'
import { LoginPage } from '../pages/LoginPage'
import { ImportPage } from '../pages/ImportPage'
import { environmentHome, environmentOrder, getStoredEnvironment, storeEnvironment } from './demoEnvironment'

const TrendsPage = lazy(() =>
  import('../pages/TrendsPage').then((module) => ({ default: module.TrendsPage })),
)

interface RouteInfo {
  title: string
  breadcrumb: BreadcrumbItem[]
  fitViewport: boolean
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
    return {
      title: 'SilverPulse',
      breadcrumb: breadcrumbFor(environment, route.label, route.section),
      fitViewport: path !== '/astronaut/trends' && path !== '/astronaut/import',
    }
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
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/*" element={<ShellRouter />} />
    </Routes>
  )
}

function ShellRouter() {
  const [environment, setEnvironment] = useState<ShellEnvironment>(getStoredEnvironment)
  const location = useLocation()
  const navigate = useNavigate()
  const routeInfo = resolveRouteInfo(location.pathname, environment)
  const activePath = location.pathname === '/' ? '/astronaut' : location.pathname

  const changeEnvironment = () => {
    const currentIndex = environmentOrder.indexOf(environment)
    const nextEnvironment = environmentOrder[(currentIndex + 1) % environmentOrder.length]

    storeEnvironment(nextEnvironment)
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
          element={<ImportPage />}
        />
        <Route
          path="/astronaut/trends"
          element={
            <Suspense fallback={<LoadingSkeleton rows={7} label="Cargando módulo de tendencias" />}>
              <TrendsPage />
            </Suspense>
          }
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
