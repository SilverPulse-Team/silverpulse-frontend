import { Menu } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import type { ShellEnvironment } from './navigation'
import { AssistantWidget } from '../assistant'

interface AppShellProps {
  environment: ShellEnvironment
  activePath: string
  children: ReactNode
  fitViewport?: boolean
  onLogout?: () => void
}

export function AppShell({
  environment,
  activePath,
  children,
  fitViewport = false,
  onLogout,
}: AppShellProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(() =>
    window.matchMedia('(min-width: 1024px)').matches,
  )
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 1024px)')
    const syncSidebarWithViewport = (event: MediaQueryListEvent) => {
      setIsSidebarExpanded(event.matches)
    }

    desktopQuery.addEventListener('change', syncSidebarWithViewport)
    return () => desktopQuery.removeEventListener('change', syncSidebarWithViewport)
  }, [])

  useEffect(() => {
    if (!isMenuOpen) return

    const previousOverflow = document.body.style.overflow
    const menuButton = menuButtonRef.current
    document.body.style.overflow = 'hidden'

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
      menuButton?.focus()
    }
  }, [isMenuOpen])

  return (
    <div className={`${fitViewport ? 'h-dvh overflow-hidden' : 'min-h-screen'} bg-canvas text-ink`}>
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden transition-[width] duration-200 md:block ${
          isSidebarExpanded ? 'w-[240px]' : 'w-20'
        }`}
      >
        <Sidebar
          environment={environment}
          activePath={activePath}
          expanded={isSidebarExpanded}
          onToggleExpanded={() => setIsSidebarExpanded((current) => !current)}
          onLogout={onLogout}
        />
      </aside>

      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-deep-space/70"
            aria-label="Cerrar menú"
            onClick={() => setIsMenuOpen(false)}
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Menú principal"
            className="relative h-full w-[min(19rem,86vw)] shadow-2xl"
          >
            <Sidebar
              mobile
              expanded
              environment={environment}
              activePath={activePath}
              onClose={() => setIsMenuOpen(false)}
              onLogout={() => {
                setIsMenuOpen(false)
                onLogout?.()
              }}
            />
          </aside>
        </div>
      )}

      <div
        className={`min-w-0 transition-[padding] duration-200 ${fitViewport ? 'h-dvh overflow-hidden' : ''} ${
          isSidebarExpanded ? 'md:pl-[240px]' : 'md:pl-20'
        }`}
      >
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setIsMenuOpen(true)}
          className="fixed left-3 top-3 z-20 grid size-11 place-items-center rounded-control border border-line bg-card/95 text-ink shadow-card backdrop-blur hover:border-nasa-blue hover:text-nasa-blue md:hidden"
          aria-label="Abrir menú"
        >
          <Menu aria-hidden="true" className="size-5" />
        </button>
        <main
          className={`mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 ${
            fitViewport
              ? 'h-dvh overflow-x-hidden overflow-y-auto overscroll-contain pb-4 pt-20 md:py-4'
              : 'pb-6 pt-20 md:py-6 lg:py-8'
          }`}
        >
          {children}
        </main>
      </div>
      <AssistantWidget environment={environment} />
    </div>
  )
}
