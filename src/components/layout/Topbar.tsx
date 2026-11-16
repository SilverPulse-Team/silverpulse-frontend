import { Menu } from 'lucide-react'
import type { RefObject } from 'react'
import { environmentConfig, type ShellEnvironment } from './navigation'

interface TopbarProps {
  environment: ShellEnvironment
  onOpenMenu: () => void
  menuButtonRef: RefObject<HTMLButtonElement | null>
}

export function Topbar({ environment, onOpenMenu, menuButtonRef }: TopbarProps) {
  const config = environmentConfig[environment]
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-card/95 backdrop-blur">
      <div className="flex min-h-20 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          ref={menuButtonRef}
          type="button"
          onClick={onOpenMenu}
          className="grid size-11 shrink-0 place-items-center rounded-control border border-line text-ink hover:border-nasa-blue hover:text-nasa-blue md:hidden"
          aria-label="Abrir menú"
        >
          <Menu aria-hidden="true" className="size-5" />
        </button>

        <div className="min-w-0 flex-1" />

        <div className="hidden items-center gap-3 border-l border-line pl-4 sm:flex">
          <div className="hidden text-right lg:block">
            <p className="text-sm font-semibold text-ink">{config.role}</p>
            <p className="max-w-52 truncate text-xs text-muted">{config.profile}</p>
          </div>
          <span
            aria-hidden="true"
            className="grid size-10 place-items-center rounded-full bg-nasa-blue text-sm font-semibold text-white"
          >
            {environment === 'earth' ? 'MD' : environment === 'ship' ? 'A1' : 'MC'}
          </span>
        </div>
      </div>
    </header>
  )
}
