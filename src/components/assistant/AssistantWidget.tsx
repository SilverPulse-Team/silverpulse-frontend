import { useRef, useState } from 'react'
import { useLocation } from 'react-router'
import type { ShellEnvironment } from '../layout/navigation'
import { AssistantLauncher } from './AssistantLauncher'
import { EarthAssistant } from './EarthAssistant'
import { ShipAssistant } from './ShipAssistant'

export function AssistantWidget({ environment }: { environment: ShellEnvironment }) {
  const location = useLocation()
  const launcherRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const variant = environment === 'ship' ? 'ship' : environment === 'earth' ? 'earth' : null
  const clearsStickyActions = location.pathname === '/astronaut/import'

  if (!variant) return null
  const close = () => { setOpen(false); requestAnimationFrame(() => launcherRef.current?.focus()) }
  return (
    <>
      {!open && <AssistantLauncher ref={launcherRef} variant={variant} elevated={clearsStickyActions} onOpen={() => setOpen(true)} />}
      {variant === 'ship'
        ? <ShipAssistant open={open} onClose={close} />
        : <EarthAssistant open={open} onClose={close} />}
    </>
  )
}
