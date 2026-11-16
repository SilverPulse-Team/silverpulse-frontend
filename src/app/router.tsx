import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router'
import { AppShell } from '../components/layout/AppShell'
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
import { AnalysisPage } from '../pages/AnalysisPage'
import { resolveShipAssistantEnabled } from '../services'
import {
  endDemoSession,
  environmentHome,
  getStoredDemoSession,
} from './demoEnvironment'

const TrendsPage = lazy(() =>
  import('../pages/TrendsPage').then((module) => ({ default: module.TrendsPage })),
)
const EvidencePage = lazy(() =>
  import('../pages/EvidencePage').then((module) => ({ default: module.EvidencePage })),
)

interface RouteInfo {
  fitViewport: boolean
}

function resolveRouteInfo(path: string, environment: ShellEnvironment): RouteInfo {
  if (path === '/' || path === '/astronaut') {
    const isShipOverview = environment === 'ship'
    return { fitViewport: !isShipOverview }
  }

  return { fitViewport: !['/astronaut/trends', '/astronaut/import', '/astronaut/analysis', '/astronaut/return'].includes(path) }
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/*" element={<ShellRouter />} />
    </Routes>
  )
}

function LoginRoute() {
  const demoSession = getStoredDemoSession()
  return demoSession
    ? <Navigate to={environmentHome[demoSession]} replace />
    : <LoginPage />
}

function ShellRouter() {
  const demoSession = getStoredDemoSession()
  const location = useLocation()
  const navigate = useNavigate()

  if (!demoSession) {
    return <Navigate to="/login" replace />
  }

  const environment = demoSession
  const routeInfo = resolveRouteInfo(location.pathname, environment)
  const activePath = location.pathname === '/' ? '/astronaut' : `${location.pathname}${location.hash}`

  const logout = () => {
    endDemoSession()
    navigate('/login', { replace: true })
  }

  return (
    <AppShell
      environment={environment}
      activePath={activePath}
      fitViewport={routeInfo.fitViewport}
      onLogout={logout}
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
          path="/astronaut/analysis"
          element={resolveShipAssistantEnabled() ? <AnalysisPage /> : <Navigate to="/astronaut" replace />}
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
        <Route path="/mission-control" element={<MissionControlPage environment={environment} />} />
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
