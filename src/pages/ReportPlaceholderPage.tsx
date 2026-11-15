import { useParams } from 'react-router'
import { ConstructionState } from '../components/states/ConstructionState'

interface ReportPlaceholderPageProps {
  context: 'ship' | 'earth'
}

export function ReportPlaceholderPage({ context }: ReportPlaceholderPageProps) {
  const { id } = useParams<{ id: string }>()
  const reportId = id ?? 'Sin identificador'
  const isShip = context === 'ship'

  return (
    <ConstructionState
      viewName={`${isShip ? 'Informe' : 'Revisión'} ${reportId}`}
      description={
        isShip
          ? 'Contendrá el informe descriptivo, sus observaciones fuente, procedencia, calidad y estado real de sincronización.'
          : 'Contendrá el informe recibido en Tierra, su trazabilidad y el formulario de revisión del médico de vuelo ficticio.'
      }
    />
  )
}
