import { Activity, ArrowLeftRight, Radio, Stethoscope, X } from 'lucide-react'
import { environmentConfig, type ShellEnvironment } from './navigation'

interface SidebarProps {
  environment: ShellEnvironment
  activePath: string
  mobile?: boolean
  onClose?: () => void
  onChangeEnvironment?: () => void
}

export function Sidebar({
  environment,
  activePath,
  mobile = false,
  onClose,
  onChangeEnvironment,
}: SidebarProps) {
  const config = environmentConfig[environment]

  return (
    <div className="flex h-full flex-col bg-deep-space text-white">
      <div className="flex min-h-20 items-center justify-between border-b border-white/10 px-4 lg:px-6">
        <a
          href="/astronaut"
          className="flex min-h-11 items-center gap-3 rounded-control focus-visible:outline-offset-4"
          aria-label="SilverPulse, ir al resumen"
        >
          <span
            aria-hidden="true"
            className="grid size-10 shrink-0 place-items-center rounded-full border border-data font-semibold text-data"
          >
            SP
          </span>
          <span className={mobile ? 'block' : 'hidden lg:block'}>
            <span className="block text-lg font-semibold tracking-tight">SilverPulse</span>
            <span className="block text-xs text-slate-300">Mission Health</span>
          </span>
        </a>

        {mobile && (
          <button
            ref={(element) => element?.focus()}
            type="button"
            onClick={onClose}
            className="grid size-11 place-items-center rounded-control text-slate-200 hover:bg-white/10 hover:text-white"
            aria-label="Cerrar menú"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        )}
      </div>

      <div className="px-3 py-4 lg:px-4">
        <div
          className="flex min-h-11 items-center justify-center gap-2 rounded-control border border-data/35 bg-midnight-surface px-3 text-sm font-semibold text-slate-100 lg:justify-start"
          title={config.label}
        >
          <SatelliteEnvironmentIcon environment={environment} />
          <span className={mobile ? 'inline' : 'hidden lg:inline'}>{config.label}</span>
        </div>
      </div>

      <nav aria-label={`Navegación de ${config.label}`} className="flex-1 overflow-y-auto px-3 pb-4 lg:px-4">
        <ul className="space-y-1">
          {config.navigation.map(({ label, href, icon: Icon }) => {
            const isActive = activePath === href

            return (
              <li key={href}>
                <a
                  href={href}
                  onClick={onClose}
                  aria-current={isActive ? 'page' : undefined}
                  title={label}
                  className={`flex min-h-11 items-center justify-center gap-3 rounded-control px-3 text-sm font-medium transition-colors lg:justify-start ${
                    isActive
                      ? 'bg-nasa-blue text-white'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon aria-hidden="true" className="size-5 shrink-0" />
                  <span className={mobile ? 'inline' : 'hidden lg:inline'}>{label}</span>
                </a>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-3 lg:p-4">
        <button
          type="button"
          onClick={onChangeEnvironment}
          className="flex min-h-11 w-full items-center justify-center gap-3 rounded-control px-3 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white lg:justify-start"
          title="Cambiar entorno demo"
        >
          <ArrowLeftRight aria-hidden="true" className="size-5 shrink-0" />
          <span className={mobile ? 'inline' : 'hidden lg:inline'}>Cambiar entorno demo</span>
        </button>
        <p className={`mt-3 text-xs leading-5 text-slate-400 ${mobile ? 'block' : 'hidden lg:block'}`}>
          Prototipo independiente
          <br />
          NASA Space Apps Challenge 2026
        </p>
      </div>
    </div>
  )
}

function SatelliteEnvironmentIcon({ environment }: { environment: ShellEnvironment }) {
  const Icon = environment === 'earth' ? Stethoscope : environment === 'ship' ? Activity : Radio

  return <Icon aria-hidden="true" className="size-5 shrink-0 text-data" />
}
