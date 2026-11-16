import { ConstructionState } from '../components/states/ConstructionState'

interface PlaceholderPageProps {
  viewName: string
  description: string
}

export function PlaceholderPage({ viewName, description }: PlaceholderPageProps) {
  return <ConstructionState viewName={viewName} description={description} />
}
