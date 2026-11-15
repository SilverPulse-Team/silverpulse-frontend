import { PageHeader } from '../components/layout/PageHeader'
import { ComponentLibraryPage } from './ComponentLibraryPage'

export function AstronautOverviewPage() {
  return (
    <>
      <PageHeader
        eyebrow="Entorno nave"
        title="Panel del astronauta"
        description="Observaciones registradas localmente en nave. Los módulos funcionales se implementarán en los siguientes epics."
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
  )
}
