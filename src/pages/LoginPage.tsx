import { ArrowRight, CircleCheck, LockKeyhole, MousePointerClick, Radio, Rocket, Stethoscope } from 'lucide-react'
import { useNavigate } from 'react-router'
import { environmentHome, startDemoSession } from '../app/demoEnvironment'
import type { ShellEnvironment } from '../components/layout/navigation'

interface RoleCardProps {
  environment: Extract<ShellEnvironment, 'ship' | 'earth'>
  icon: typeof Rocket
  title: string
  context: string
  description: string
  features: string[]
  buttonLabel: string
  tone: 'ship' | 'earth'
  onSelect: (environment: Extract<ShellEnvironment, 'ship' | 'earth'>) => void
}

export function LoginPage() {
  const navigate = useNavigate()

  const selectRole = (environment: Extract<ShellEnvironment, 'ship' | 'earth'>) => {
    startDemoSession(environment)
    navigate(environmentHome[environment], { replace: true })
  }

  return (
    <main className="construction-space relative h-dvh overflow-hidden bg-deep-space px-4 py-3 sm:px-6 sm:py-5 lg:px-8">
      <div className="relative z-10 mx-auto flex h-full min-h-0 w-full max-w-5xl flex-col justify-center">
        <div className="mb-2 flex items-center justify-center gap-2.5 text-white sm:mb-3">
          <span aria-hidden="true" className="grid size-10 place-items-center rounded-full border border-data text-sm font-semibold text-data">
            SP
          </span>
          <div>
            <p className="text-base font-semibold tracking-tight">SilverPulse 2.0</p>
            <p className="text-[10px] text-slate-300">Mission Health Monitoring</p>
          </div>
        </div>

        <section className="rounded-card border border-white/15 bg-card/95 p-3 shadow-2xl backdrop-blur sm:p-5 lg:p-6" aria-labelledby="login-title">
          <header className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-data/30 bg-data/10 px-2.5 py-1 text-[10px] font-semibold text-nasa-blue">
              <Radio aria-hidden="true" className="size-3.5" />
              DEMO INTERACTIVA · SIN CREDENCIALES
            </span>
            <h1 id="login-title" className="mt-2 text-lg font-semibold tracking-tight text-ink sm:text-2xl">
              ¿Desde qué entorno quieres explorar SilverPulse?
            </h1>
            <p className="mt-1.5 text-xs leading-4 text-muted sm:mt-2 sm:text-sm sm:leading-5">
              Elige un perfil ficticio para iniciar una sesión demo. Cierra sesión desde el menú para elegir otro entorno.
            </p>
          </header>

          <div className="mx-auto mt-3 hidden max-w-2xl items-center justify-center gap-2 rounded-control border border-line bg-canvas px-3 py-2 text-xs text-muted sm:flex">
            <MousePointerClick aria-hidden="true" className="size-4 shrink-0 text-data" />
            <span><strong className="font-semibold text-ink">Selecciona un rol.</strong> No se solicitarán datos personales ni credenciales.</span>
          </div>

          <div className="mt-3 grid gap-2.5 sm:mt-4 sm:gap-3 md:grid-cols-2">
            <RoleCard
              environment="ship"
              icon={Rocket}
              title="Astronauta"
              context="Entorno nave"
              description="Explora observaciones, tendencias e informes locales."
              features={['Observaciones y tendencias', 'Preparación de retorno', 'Informes y comunicaciones']}
              buttonLabel="Entrar como Astronauta"
              tone="ship"
              onSelect={selectRole}
            />
            <RoleCard
              environment="earth"
              icon={Stethoscope}
              title="Médico de vuelo"
              context="Entorno Tierra"
              description="Revisa informes recibidos y confirmados en Tierra."
              features={['Bandeja médica', 'Revisión de informes', 'Respuestas en cola']}
              buttonLabel="Entrar como Médico de vuelo"
              tone="earth"
              onSelect={selectRole}
            />
          </div>

          <div className="mt-3 flex flex-col items-center justify-between gap-1.5 border-t border-line pt-3 text-center sm:flex-row sm:gap-3 sm:text-left">
            <div className="flex items-center gap-1.5 rounded-full bg-canvas px-2.5 py-1.5 text-[10px] text-muted sm:text-xs">
              <LockKeyhole aria-hidden="true" className="size-3.5" />
              <span>Acceso por credenciales: futuro, no implementado</span>
            </div>
            <div className="text-[10px] leading-4 text-muted sm:text-right">
              <p className="font-semibold text-nasa-blue">Acceso demostrativo con perfiles ficticios</p>
              <p className="mt-0.5">Prototipo independiente · NASA Space Apps Challenge 2026</p>
            </div>
          </div>

          <p className="mt-2 text-center text-[10px] leading-4 text-muted">
            La sesión es demostrativa; no constituye autenticación ni autorización real.
          </p>
        </section>
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
  tone,
  onSelect,
}: RoleCardProps) {
  const toneClasses = {
    ship: {
      icon: 'bg-data/10 text-data',
      badge: 'border-data/30 bg-data/10 text-nasa-blue',
    },
    earth: {
      icon: 'bg-coverage/10 text-coverage',
      badge: 'border-coverage/30 bg-coverage/10 text-coverage',
    },
  }[tone]

  return (
    <article className="group flex flex-col rounded-card border border-line bg-card p-3 transition-[border-color,transform,box-shadow] hover:-translate-y-1 hover:border-data/50 hover:shadow-card focus-within:border-data focus-within:ring-2 focus-within:ring-data/20 sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <span className={`grid size-9 place-items-center rounded-control ${toneClasses.icon}`}>
          <Icon aria-hidden="true" className="size-4.5" />
        </span>
        <span className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${toneClasses.badge}`}>{context}</span>
      </div>
      <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.12em] text-muted">Perfil ficticio</p>
      <h2 className="mt-0.5 text-base font-semibold text-ink sm:text-lg">{title}</h2>
      <p className="mt-1 text-xs leading-4 text-muted sm:text-sm sm:leading-5">{description}</p>
      <ul className="mt-3 hidden flex-1 space-y-1.5 text-xs text-ink sm:block">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2">
            <CircleCheck aria-hidden="true" className="size-4 shrink-0 text-coverage" />
            {feature}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => onSelect(environment)}
        className="mt-2.5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-control bg-nasa-blue px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-deep-space sm:mt-4"
      >
        {buttonLabel}
        <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" />
      </button>
    </article>
  )
}
