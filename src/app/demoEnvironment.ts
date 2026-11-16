import type { ShellEnvironment } from '../components/layout/navigation'

export const environmentOrder: ShellEnvironment[] = ['ship', 'earth', 'mission-control']
export const environmentStorageKey = 'silverpulse-demo-environment'
export const demoSessionStorageKey = 'silverpulse-demo-session'

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

export function getStoredDemoSession(): ShellEnvironment | null {
  try {
    const storedSession = window.sessionStorage.getItem(demoSessionStorageKey)
    return environmentOrder.includes(storedSession as ShellEnvironment)
      ? (storedSession as ShellEnvironment)
      : null
  } catch {
    return null
  }
}

export function startDemoSession(environment: ShellEnvironment) {
  window.sessionStorage.setItem(environmentStorageKey, environment)
  window.sessionStorage.setItem(demoSessionStorageKey, environment)
}

export function endDemoSession() {
  window.sessionStorage.removeItem(demoSessionStorageKey)
  window.sessionStorage.removeItem(environmentStorageKey)
}
