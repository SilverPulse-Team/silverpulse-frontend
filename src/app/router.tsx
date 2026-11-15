import { lazy, Suspense, useState } from 'react'
import { Navigate, Route, Routes, matchPath, useLocation, useNavigate } from 'react-router'
import { AppShell } from '../components/layout/AppShell'
import type { BreadcrumbItem } from '../components/layout/Topbar'
import type { ShellEnvironment } from '../components/layout/navigation'
import { LoadingSkeleton } from '../components/ui'
import { AstronautOverviewPage } from '../pages/AstronautOverviewPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { PlaceholderPage } from '../pages/PlaceholderPage'
import { ShipReportDetailPage } from '../pages/ShipReportDetailPage'
import { MissionControlPage } from '../pages/MissionControlPage'
import { EarthReportsPage } from '../pages/EarthReportsPage'
import { EarthReportReviewPage } from '../pages/EarthReportReviewPage'
import { LoginPage } from '../pages/LoginPage'
import { ImportPage } from '../pages/ImportPage'
import { ReturnReadinessPage } from '../pages/ReturnReadinessPage'
import { environmentHome, environmentOrder, getStoredEnvironment, storeEnvironment } from './demoEnvironment'

const TrendsPage = lazy(() =>
  import('../pages/TrendsPage').then((module) => ({ default: module.TrendsPage })),
)
const EvidencePage = lazy(() =>
  import('../pages/EvidencePage').then((module) => ({ default: module.EvidencePage })),
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
      fitViewport: path !== '/astronaut/trends' && path !== '/astronaut/import' && path !== '/astronaut/return',
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
          element={<ReturnReadinessPage />}
        />
        <Route path="/mission-control" element={<MissionControlPage />} />
        <Route path="/medical" element={<EarthReportsPage />} />
        <Route path="/medical/reports/:id" element={<EarthReportReviewPage />} />
        <Route path="/astronaut/reports/:id" element={<ShipReportDetailPage />} />
        <Route
          path="/evidence"
          element={
            <Suspense fallback={<LoadingSkeleton rows={6} label="Cargando evidencia científica" />}>
              <EvidencePage />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFoundPage homePath={environmentHome[environment]} />} />
      </Routes>
    </AppShell>
  )
}
