import { Menu, WifiOff } from 'lucide-react'
import type { RefObject } from 'react'
import { environmentConfig, type ShellEnvironment } from './navigation'

interface TopbarProps {
  environment: ShellEnvironment
  title: string
  breadcrumb: string[]
  onOpenMenu: () => void
  menuButtonRef: RefObject<HTMLButtonElement | null>
}

export function Topbar({ environment, title, breadcrumb, onOpenMenu, menuButtonRef }: TopbarProps) {
  const config = environmentConfig[environment]
  const showOffline = environment !== 'earth'

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

        <div className="min-w-0 flex-1">
          <nav aria-label="Migas de pan" className="hidden sm:block">
            <ol className="flex items-center gap-2 text-xs text-muted">
              {breadcrumb.map((item, index) => (
                <li key={`${item}-${index}`} className="flex items-center gap-2">
                  {index > 0 && <span aria-hidden="true">/</span>}
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </nav>
          <p className="truncate text-base font-semibold text-ink sm:mt-1">{title}</p>
        </div>

        {showOffline && (
          <div
            className="hidden min-h-9 items-center gap-2 rounded-full border border-notice/35 bg-notice/10 px-3 text-xs font-semibold text-ink xl:flex"
            aria-label="Estado del enlace: sin conexión; no representa un estado médico"
          >
            <WifiOff aria-hidden="true" className="size-4 text-notice" />
            Enlace sin conexión
          </div>
        )}

        <div className="hidden items-center gap-3 border-l border-line pl-4 sm:flex">
          <div className="hidden text-right lg:block">
            <p className="text-xs font-semibold text-ink">{config.role}</p>
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
