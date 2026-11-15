import {
  Activity,
  ChartNoAxesCombined,
  ClipboardCheck,
  FileText,
  FlaskConical,
  House,
  Inbox,
  Radio,
  Satellite,
  Upload,
  type LucideIcon,
} from 'lucide-react'

export type ShellEnvironment = 'ship' | 'earth' | 'mission-control'

export interface NavigationItem {
  label: string
  href: string
  icon: LucideIcon
}

interface EnvironmentConfig {
  label: string
  role: string
  profile: string
  navigation: NavigationItem[]
}

const sharedNavigation: NavigationItem[] = [
  { label: 'Evidencia', href: '/evidence', icon: FlaskConical },
]

export const environmentConfig: Record<ShellEnvironment, EnvironmentConfig> = {
  ship: {
    label: 'Entorno nave',
    role: 'Astronauta',
    profile: 'Astronauta Demo 01 · AST-001',
    navigation: [
      { label: 'Resumen', href: '/astronaut', icon: House },
      { label: 'Importar datos', href: '/astronaut/import', icon: Upload },
      { label: 'Tendencias', href: '/astronaut/trends', icon: ChartNoAxesCombined },
      { label: 'Preparación de retorno', href: '/astronaut/return', icon: ClipboardCheck },
      { label: 'Informes', href: '/astronaut#ship-reports', icon: FileText },
      { label: 'Comunicaciones', href: '/mission-control', icon: Radio },
      ...sharedNavigation,
    ],
  },
  earth: {
    label: 'Entorno Tierra',
    role: 'Médico de vuelo',
    profile: 'Médico Demo · CMO-DEMO',
    navigation: [
      { label: 'Bandeja médica', href: '/medical', icon: Inbox },
      ...sharedNavigation,
    ],
  },
  'mission-control': {
    label: 'Simulador local',
    role: 'Operador demo',
    profile: 'Mission Control · DEMO',
    navigation: [
      { label: 'Control de enlace', href: '/mission-control', icon: Satellite },
      { label: 'Resumen de nave', href: '/astronaut', icon: Activity },
      ...sharedNavigation,
    ],
  },
}
