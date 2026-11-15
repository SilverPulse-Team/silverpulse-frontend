import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import type { ShellEnvironment } from './navigation'

interface AppShellProps {
  environment: ShellEnvironment
  activePath: string
  title: string
  breadcrumb: string[]
  children: ReactNode
  onChangeEnvironment?: () => void
}

export function AppShell({
  environment,
  activePath,
  title,
  breadcrumb,
  children,
  onChangeEnvironment,
}: AppShellProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

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
    <div className="min-h-screen bg-canvas text-ink">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-20 md:block lg:w-60">
        <Sidebar
          environment={environment}
          activePath={activePath}
          onChangeEnvironment={onChangeEnvironment}
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
              environment={environment}
              activePath={activePath}
              onClose={() => setIsMenuOpen(false)}
              onChangeEnvironment={() => {
                setIsMenuOpen(false)
                onChangeEnvironment?.()
              }}
            />
          </aside>
        </div>
      )}

      <div className="min-w-0 md:pl-20 lg:pl-60">
        <Topbar
          environment={environment}
          title={title}
          breadcrumb={breadcrumb}
          onOpenMenu={() => setIsMenuOpen(true)}
          menuButtonRef={menuButtonRef}
        />
        <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  )
}
