import { Activity, ArrowLeftRight, PanelLeftClose, Radio, Stethoscope, X } from 'lucide-react'
import { environmentConfig, type ShellEnvironment } from './navigation'

interface SidebarProps {
  environment: ShellEnvironment
  activePath: string
  expanded: boolean
  mobile?: boolean
  onClose?: () => void
  onToggleExpanded?: () => void
  onChangeEnvironment?: () => void
}

export function Sidebar({
  environment,
  activePath,
  expanded,
  mobile = false,
  onClose,
  onToggleExpanded,
  onChangeEnvironment,
}: SidebarProps) {
  const config = environmentConfig[environment]
  const showLabels = mobile || expanded
  const homePath =
    environment === 'earth' ? '/medical' : environment === 'mission-control' ? '/mission-control' : '/astronaut'

  return (
    <div className="flex h-full flex-col bg-deep-space text-white">
      <div
        className={`flex min-h-20 items-center border-b border-white/10 px-4 ${
          showLabels ? 'justify-between' : 'justify-center'
        }`}
      >
        {showLabels ? (
          <a
            href={homePath}
            onClick={mobile ? onClose : undefined}
            className="flex min-h-11 items-center gap-3 rounded-control focus-visible:outline-offset-4"
            aria-label={`SilverPulse, ir a ${config.label}`}
          >
            <BrandMark />
            <span className="block text-left">
              <span className="block text-base font-semibold tracking-tight">SilverPulse</span>
              <span className="block text-[11px] tracking-wide text-slate-300">Mission Health</span>
            </span>
          </a>
        ) : (
          <button
            type="button"
            onClick={onToggleExpanded}
            className="flex min-h-11 items-center justify-center rounded-control focus-visible:outline-offset-4"
            aria-label="Expandir menú de SilverPulse"
            aria-expanded="false"
            title="Expandir menú"
          >
            <BrandMark />
          </button>
        )}

        {!mobile && expanded && (
          <button
            type="button"
            onClick={onToggleExpanded}
            className="grid size-11 shrink-0 place-items-center rounded-control text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Contraer menú de SilverPulse"
            aria-expanded="true"
            title="Contraer menú"
          >
            <PanelLeftClose aria-hidden="true" className="size-5" />
          </button>
        )}

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

      <div className="px-3 py-4">
        <div
          className={`sidebar-label flex min-h-11 items-center gap-2 rounded-control border border-data/35 bg-midnight-surface px-3 font-medium text-slate-100 ${
            showLabels ? 'justify-start' : 'justify-center'
          }`}
          title={config.label}
        >
          <SatelliteEnvironmentIcon environment={environment} />
          {showLabels && <span>{config.label}</span>}
        </div>
      </div>

      <nav aria-label={`Navegación de ${config.label}`} className="flex-1 overflow-y-auto px-3 pb-4">
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
                  className={`sidebar-label flex min-h-11 items-center gap-3 rounded-control px-3 font-medium transition-colors ${
                    showLabels ? 'justify-start' : 'justify-center'
                  } ${
                    isActive
                      ? 'bg-nasa-blue text-white'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon aria-hidden="true" className="size-5 shrink-0" />
                  {showLabels && <span>{label}</span>}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          onClick={onChangeEnvironment}
          className={`sidebar-label flex min-h-11 w-full items-center gap-3 rounded-control px-3 font-normal text-slate-300 transition-colors hover:bg-white/10 hover:text-white ${
            showLabels ? 'justify-start' : 'justify-center'
          }`}
          title="Cambiar entorno demo"
        >
          <ArrowLeftRight aria-hidden="true" className="size-5 shrink-0" />
          {showLabels && <span>Cambiar entorno demo</span>}
        </button>
        {showLabels && (
          <p className="mt-3 text-[11px] leading-4 text-slate-400">
            Prototipo independiente
            <br />
            NASA Space Apps Challenge 2026
          </p>
        )}
      </div>
    </div>
  )
}

function SatelliteEnvironmentIcon({ environment }: { environment: ShellEnvironment }) {
  const Icon = environment === 'earth' ? Stethoscope : environment === 'ship' ? Activity : Radio

  return <Icon aria-hidden="true" className="size-5 shrink-0 text-data" />
}

function BrandMark() {
  return (
    <span
      aria-hidden="true"
      className="grid size-11 shrink-0 place-items-center rounded-full border border-data font-semibold text-data transition-colors hover:bg-data/10"
    >
      SP
    </span>
  )
}
