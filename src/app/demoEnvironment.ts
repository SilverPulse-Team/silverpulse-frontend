import type { ShellEnvironment } from '../components/layout/navigation'

export const environmentOrder: ShellEnvironment[] = ['ship', 'earth', 'mission-control']
export const environmentStorageKey = 'silverpulse-demo-environment'

export const environmentHome: Record<ShellEnvironment, string> = {
  ship: '/astronaut',
  earth: '/medical',
  'mission-control': '/mission-control',
}

export function getStoredEnvironment(): ShellEnvironment {
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

export function storeEnvironment(environment: ShellEnvironment) {
  try {
    window.sessionStorage.setItem(environmentStorageKey, environment)
  } catch {
    // The visual context can still change for the current page without storage.
  }
}
