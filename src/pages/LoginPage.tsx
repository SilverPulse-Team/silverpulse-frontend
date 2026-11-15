import { ArrowRight, LockKeyhole, Rocket, Stethoscope } from 'lucide-react'
import { useNavigate } from 'react-router'
import { environmentHome, storeEnvironment } from '../app/demoEnvironment'
import type { ShellEnvironment } from '../components/layout/navigation'

interface RoleCardProps {
  environment: Extract<ShellEnvironment, 'ship' | 'earth'>
  icon: typeof Rocket
  title: string
  context: string
  description: string
  features: string[]
  buttonLabel: string
  onSelect: (environment: Extract<ShellEnvironment, 'ship' | 'earth'>) => void
}

export function LoginPage() {
  const navigate = useNavigate()

  const selectRole = (environment: Extract<ShellEnvironment, 'ship' | 'earth'>) => {
    storeEnvironment(environment)
    navigate(environmentHome[environment], { replace: true })
  }

  return (
    <main className="construction-space relative h-dvh overflow-hidden bg-deep-space px-4 py-3 sm:px-6 sm:py-5 lg:px-8">
      <div className="relative z-10 mx-auto flex h-full min-h-0 w-full max-w-5xl flex-col justify-center">
        <div className="mb-3 flex items-center justify-center gap-3 text-white sm:mb-5">
          <span aria-hidden="true" className="grid size-11 place-items-center rounded-full border border-data font-semibold text-data">
            SP
          </span>
          <div>
            <p className="text-lg font-semibold tracking-tight">SilverPulse 2.0</p>
            <p className="text-xs text-slate-300">Mission Health Monitoring</p>
          </div>
        </div>

        <section className="rounded-card border border-white/15 bg-card/95 p-4 shadow-2xl backdrop-blur sm:p-7 lg:p-9" aria-labelledby="login-title">
          <header className="mx-auto max-w-2xl text-center">
            <span className="inline-flex rounded-full border border-data/30 bg-data/10 px-3 py-1 text-xs font-semibold text-nasa-blue">
              ACCESO DEMOSTRATIVO
            </span>
            <h1 id="login-title" className="mt-3 text-xl font-semibold tracking-tight text-ink sm:mt-4 sm:text-3xl">
              Selecciona un entorno de trabajo
            </h1>
            <p className="mt-2 text-sm leading-5 text-muted sm:mt-3 sm:text-base sm:leading-6">
              Monitoreo fisiológico y seguimiento de misión con perfiles completamente ficticios.
            </p>
            <p className="mt-2 text-sm font-semibold text-nasa-blue">Acceso demostrativo con perfiles ficticios</p>
          </header>

          <div className="mt-4 grid gap-3 sm:mt-7 sm:gap-4 md:grid-cols-2">
            <RoleCard
              environment="ship"
              icon={Rocket}
              title="Astronauta"
              context="Entorno nave"
              description="Consulta observaciones locales, tendencias e informes antes de su sincronización."
              features={['Observaciones y tendencias', 'Preparación de retorno', 'Informes y comunicaciones']}
              buttonLabel="Entrar como Astronauta"
              onSelect={selectRole}
            />
            <RoleCard
              environment="earth"
              icon={Stethoscope}
              title="Médico de vuelo"
              context="Entorno Tierra"
              description="Revisa únicamente informes recibidos y confirmados en el entorno Tierra."
              features={['Bandeja médica', 'Revisión de informes', 'Respuestas en cola']}
              buttonLabel="Entrar como Médico de vuelo"
              onSelect={selectRole}
            />
          </div>

          <div className="mt-4 flex flex-col items-center justify-between gap-2 border-t border-line pt-4 text-center sm:mt-6 sm:flex-row sm:gap-4 sm:pt-5 sm:text-left">
            <div className="flex items-center gap-2 text-sm text-muted">
              <LockKeyhole aria-hidden="true" className="size-4" />
              <span>Acceso por credenciales: futuro, no implementado</span>
            </div>
            <p className="text-xs text-muted">Prototipo independiente · NASA Space Apps Challenge 2026</p>
          </div>
        </section>

        <p className="mt-3 text-center text-xs text-slate-400 sm:mt-4">
          La selección de rol cambia el contexto visual; no constituye autenticación ni autorización.
        </p>
      </div>
    </main>
  )
}

function RoleCard({
  environment,
  icon: Icon,
  title,
  context,
  description,
  features,
  buttonLabel,
  onSelect,
}: RoleCardProps) {
  return (
    <article className="group flex flex-col rounded-card border border-line bg-card p-4 transition-[border-color,transform,box-shadow] hover:-translate-y-1 hover:border-data/50 hover:shadow-card sm:p-6">
      <span className="grid size-11 place-items-center rounded-control bg-data/10 text-data">
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-nasa-blue">{context}</p>
      <h2 className="mt-1 text-xl font-semibold text-ink">{title}</h2>
      <p className="mt-1 text-sm leading-5 text-muted sm:mt-2 sm:leading-6">{description}</p>
      <ul className="mt-4 hidden flex-1 space-y-2 text-sm text-ink sm:block">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-coverage" />
            {feature}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => onSelect(environment)}
        className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-control bg-nasa-blue px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-deep-space sm:mt-6"
      >
        {buttonLabel}
        <ArrowRight aria-hidden="true" className="size-4" />
      </button>
    </article>
  )
}
