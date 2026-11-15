import { Braces, FileSpreadsheet, FlaskConical, type LucideIcon } from 'lucide-react'

export type ImportSourceType = 'csv' | 'json' | 'synthetic'

interface SourceOption {
  value: ImportSourceType
  title: string
  description: string
  icon: LucideIcon
}

const sourceOptions: SourceOption[] = [
  {
    value: 'csv',
    title: 'Archivo CSV',
    description: 'Se convertirá localmente a observaciones JSON; nunca se enviará como multipart.',
    icon: FileSpreadsheet,
  },
  {
    value: 'json',
    title: 'Archivo JSON',
    description: 'Registro local que será validado contra el contrato canónico v0.2.0.',
    icon: Braces,
  },
  {
    value: 'synthetic',
    title: 'Escenario sintético demo',
    description: 'Datos ficticios, visibles y reproducibles para demostrar el flujo sin un sensor conectado.',
    icon: FlaskConical,
  },
]

interface SourceSelectorProps {
  value: ImportSourceType | null
  onChange: (value: ImportSourceType) => void
}

export function SourceSelector({ value, onChange }: SourceSelectorProps) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-ink">Tipo de entrada</legend>
      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        {sourceOptions.map((option) => {
          const Icon = option.icon
          const selected = option.value === value

          return (
            <label
              key={option.value}
              className={`flex min-h-32 cursor-pointer gap-3 rounded-card border p-4 transition-colors focus-within:outline focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-data ${
                selected
                  ? 'border-nasa-blue bg-nasa-blue/5 shadow-card'
                  : 'border-line bg-card hover:border-data'
              }`}
            >
              <input
                type="radio"
                name="import-source"
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <span className={`grid size-10 shrink-0 place-items-center rounded-control ${selected ? 'bg-nasa-blue text-white' : 'bg-canvas text-data'}`}>
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-ink">{option.title}</span>
                <span className="mt-1 block text-xs leading-5 text-muted">{option.description}</span>
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
