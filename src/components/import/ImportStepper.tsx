import { Check } from 'lucide-react'

const importSteps = [
  'Seleccionar origen',
  'Revisar y mapear',
  'Validar',
  'Confirmar importación',
] as const

interface ImportStepperProps {
  currentStep: number
}

export function ImportStepper({ currentStep }: ImportStepperProps) {
  return (
    <nav aria-label="Progreso de importación">
      <ol className="grid grid-cols-4 gap-1 sm:gap-3">
        {importSteps.map((label, index) => {
          const step = index + 1
          const isCurrent = step === currentStep
          const isComplete = step < currentStep

          return (
            <li
              key={label}
              aria-current={isCurrent ? 'step' : undefined}
              className="relative flex min-w-0 flex-col items-center gap-2 text-center sm:flex-row sm:text-left"
            >
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className={`absolute right-1/2 top-4 -z-0 h-px w-full sm:hidden ${
                    isComplete || isCurrent ? 'bg-nasa-blue' : 'bg-line'
                  }`}
                />
              )}
              <span
                className={`relative z-10 grid size-8 shrink-0 place-items-center rounded-full border text-xs font-bold ${
                  isComplete
                    ? 'border-coverage bg-coverage text-white'
                    : isCurrent
                      ? 'border-nasa-blue bg-nasa-blue text-white'
                      : 'border-line bg-card text-muted'
                }`}
              >
                {isComplete ? <Check aria-hidden="true" className="size-4" /> : step}
                <span className="sr-only">{isComplete ? 'Completado' : isCurrent ? 'Paso actual' : 'Pendiente'}</span>
              </span>
              <span
                className={`hidden min-w-0 text-xs font-semibold leading-4 sm:block lg:text-sm ${
                  isCurrent ? 'text-nasa-blue' : isComplete ? 'text-coverage' : 'text-muted'
                }`}
              >
                {label}
              </span>
              <span className={`text-[0.65rem] font-semibold leading-3 sm:hidden ${isCurrent ? 'text-nasa-blue' : 'text-muted'}`}>
                {index === 0 ? 'Origen' : index === 1 ? 'Mapear' : index === 2 ? 'Validar' : 'Confirmar'}
              </span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
