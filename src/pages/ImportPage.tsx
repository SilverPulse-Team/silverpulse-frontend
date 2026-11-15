import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  FileUp,
  FlaskConical,
  RotateCcw,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react'
import {
  ImportStepper,
  PreviewTable,
  SourceSelector,
  type ImportPreviewRow,
  type ImportSourceType,
} from '../components/import'
import { PageHeader } from '../components/layout/PageHeader'
import {
  AlertNotice,
  EmptyState,
  ErrorState,
  LoadingSkeleton,
  PrimaryButton,
  SecondaryButton,
} from '../components/ui'
import { getDataProvider } from '../services'
import type { Astronaut, DataSourceKind, MetricDefinition, MissionPhase } from '../types'

interface ImportContext {
  astronauts: Astronaut[]
  metrics: MetricDefinition[]
}

type ContextState =
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: ImportContext }

type PreviewState = 'idle' | 'loading' | 'ready'

interface FormState {
  provider: string
  sourceId: string
  astronautId: string
  phase: MissionPhase
  activity: string
  sourceKind: DataSourceKind
}

type FormErrors = Partial<Record<'source' | 'provider' | 'sourceId' | 'astronautId' | 'activity' | 'file', string>>

const fieldClassName =
  'sp-field mt-1.5 w-full rounded-control border border-line bg-card px-3 text-sm text-ink transition-colors hover:border-slate-400 focus:border-nasa-blue'

const defaultForm: FormState = {
  provider: '',
  sourceId: '',
  astronautId: '',
  phase: 'inflight',
  activity: 'rest',
  sourceKind: 'wearable',
}

const phaseOptions: Array<{ value: MissionPhase; label: string }> = [
  { value: 'preflight', label: 'Pre-vuelo' },
  { value: 'inflight', label: 'Durante vuelo' },
  { value: 'postflight', label: 'Post-vuelo' },
]

const sourceKindOptions: Array<{ value: DataSourceKind; label: string }> = [
  { value: 'wearable', label: 'Wearable' },
  { value: 'public_dataset', label: 'Dataset público' },
  { value: 'clinical_assessment', label: 'Evaluación clínica' },
  { value: 'manual', label: 'Registro manual' },
]

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'No fue posible cargar el catálogo de importación.'
}

function extensionFor(source: ImportSourceType | null) {
  return source === 'csv' ? '.csv' : source === 'json' ? '.json' : ''
}

function buildSyntheticPreview(metrics: MetricDefinition[]): ImportPreviewRow[] {
  const rows = [
    {
      row: 1,
      metricCode: 'heart_rate',
      value: 71,
      observedAtUtc: '2026-11-14T15:00:00Z',
      quality: 'adequate' as const,
    },
    {
      row: 2,
      metricCode: 'sleep_duration',
      value: 372,
      observedAtUtc: '2026-11-14T06:00:00Z',
      quality: 'unknown' as const,
    },
  ]

  return rows.flatMap((row) => {
    const metric = metrics.find((candidate) => candidate.code === row.metricCode)
    if (!metric) return []

    return [{ ...row, metricLabel: metric.label, unit: metric.unit, sourceKind: 'synthetic' as const }]
  })
}

export function ImportPage() {
  const [contextState, setContextState] = useState<ContextState>({ status: 'loading' })
  const [contextVersion, setContextVersion] = useState(0)
  const [currentStep, setCurrentStep] = useState(1)
  const [sourceType, setSourceType] = useState<ImportSourceType | null>(null)
  const [form, setForm] = useState<FormState>(defaultForm)
  const [file, setFile] = useState<File | null>(null)
  const [previewState, setPreviewState] = useState<PreviewState>('idle')
  const [errors, setErrors] = useState<FormErrors>({})
  const [notice, setNotice] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let current = true
    const provider = getDataProvider()

    Promise.all([provider.getShipAstronauts(), provider.getMetricCatalog()])
      .then(([astronauts, metrics]) => {
        if (!current) return
        if (astronauts.length === 0 || metrics.length === 0) {
          setContextState({ status: 'empty' })
          return
        }

        setContextState({ status: 'ready', data: { astronauts, metrics } })
        setForm((previous) => ({
          ...previous,
          astronautId: astronauts.some((astronaut) => astronaut.id === previous.astronautId)
            ? previous.astronautId
            : astronauts[0].id,
        }))
      })
      .catch((error: unknown) => {
        if (current) setContextState({ status: 'error', message: getErrorMessage(error) })
      })

    return () => {
      current = false
    }
  }, [contextVersion])

  const previewRows = useMemo(
    () => (
      sourceType === 'synthetic' && contextState.status === 'ready'
        ? buildSyntheticPreview(contextState.data.metrics)
        : []
    ),
    [contextState, sourceType],
  )

  const resetFlow = useCallback(() => {
    const firstAstronaut = contextState.status === 'ready' ? contextState.data.astronauts[0]?.id ?? '' : ''
    setCurrentStep(1)
    setSourceType(null)
    setForm({ ...defaultForm, astronautId: firstAstronaut })
    setFile(null)
    setPreviewState('idle')
    setErrors({})
    setNotice('Importación cancelada. No se registraron ni enviaron datos.')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [contextState])

  const selectSource = (nextSource: ImportSourceType) => {
    setSourceType(nextSource)
    setErrors({})
    setNotice('')
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''

    if (nextSource === 'synthetic') {
      setForm((previous) => ({
        ...previous,
        provider: 'SilverPulse demo',
        sourceId: 'SCENARIO-001',
        sourceKind: 'synthetic',
      }))
      setPreviewState('ready')
      return
    }

    setForm((previous) => ({
      ...previous,
      provider: previous.sourceKind === 'synthetic' ? '' : previous.provider,
      sourceId: previous.sourceKind === 'synthetic' ? '' : previous.sourceId,
      sourceKind: previous.sourceKind === 'synthetic' ? 'wearable' : previous.sourceKind,
    }))
    setPreviewState('idle')
  }

  const acceptFile = async (candidate: File | undefined) => {
    if (!candidate || sourceType === 'synthetic' || sourceType === null) return

    const requiredExtension = extensionFor(sourceType)
    if (!candidate.name.toLowerCase().endsWith(requiredExtension)) {
      setFile(null)
      setPreviewState('idle')
      setErrors((previous) => ({
        ...previous,
        file: `El archivo debe tener extensión ${requiredExtension}.`,
      }))
      return
    }

    if (candidate.size === 0) {
      setFile(null)
      setPreviewState('idle')
      setErrors((previous) => ({ ...previous, file: 'El archivo está vacío.' }))
      return
    }

    setErrors((previous) => ({ ...previous, file: undefined }))
    setFile(candidate)
    setPreviewState('loading')
    try {
      await candidate.text()
      setPreviewState('ready')
    } catch {
      setFile(null)
      setPreviewState('idle')
      setErrors((previous) => ({ ...previous, file: 'No fue posible leer el archivo local.' }))
    }
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    void acceptFile(event.target.files?.[0])
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    void acceptFile(event.dataTransfer.files?.[0])
  }

  const validateSelection = () => {
    const nextErrors: FormErrors = {}
    if (!sourceType) nextErrors.source = 'Selecciona un origen de importación.'
    if (!form.provider.trim()) nextErrors.provider = 'Indica el proveedor u origen.'
    if (!form.sourceId.trim()) nextErrors.sourceId = 'Indica un identificador de fuente.'
    if (!form.astronautId) nextErrors.astronautId = 'Selecciona un astronauta ficticio.'
    if (!form.activity.trim()) nextErrors.activity = 'Indica el contexto de actividad.'
    if ((sourceType === 'csv' || sourceType === 'json') && !file) {
      nextErrors.file = `Selecciona un archivo ${extensionFor(sourceType)} válido.`
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const advance = () => {
    if (currentStep === 1 && !validateSelection()) return
    setNotice('')
    setCurrentStep((step) => Math.min(4, step + 1))
  }

  const goBack = () => {
    setNotice('')
    setCurrentStep((step) => Math.max(1, step - 1))
  }

  if (contextState.status === 'loading') {
    return <LoadingSkeleton rows={8} label="Cargando catálogo y opciones de importación" />
  }

  if (contextState.status === 'error') {
    return (
      <ErrorState
        message={contextState.message}
        onRetry={() => {
          setContextState({ status: 'loading' })
          setContextVersion((version) => version + 1)
        }}
      />
    )
  }

  if (contextState.status === 'empty') {
    return (
      <EmptyState
        title="Importación no disponible"
        description="Se necesita al menos un astronauta ficticio y una métrica del catálogo para preparar una importación."
      />
    )
  }

  const isSynthetic = sourceType === 'synthetic'

  return (
    <div className="space-y-6 pb-24 sm:pb-6">
      <section className="rounded-card border border-line bg-card p-5 shadow-card lg:p-6">
        <PageHeader
          eyebrow="Entorno nave · Registro multifuente"
          title="Importar observaciones"
          description="Agrega registros de origen conocido y conserva la procedencia por observación."
          badge={
            <span className="rounded-full border border-notice/30 bg-notice/10 px-3 py-1 text-xs font-semibold text-ink">
              PROTOTIPO · DATOS DE PRUEBA
            </span>
          }
        />
        <div className="mt-6">
          <ImportStepper currentStep={currentStep} />
        </div>
      </section>

      <p className="sr-only" aria-live="polite">{notice}</p>
      {notice && (
        <AlertNotice title="Flujo reiniciado">
          <p>{notice}</p>
        </AlertNotice>
      )}

      {currentStep === 1 && (
        <section className="space-y-6 rounded-card border border-line bg-card p-5 shadow-card lg:p-6" aria-labelledby="source-heading">
          <div>
            <h2 id="source-heading" className="text-lg font-semibold text-ink">1. Selecciona el origen</h2>
            <p className="mt-1 text-sm leading-6 text-muted">No se detectan dispositivos ni se establece conexión con un wearable.</p>
          </div>

          <SourceSelector value={sourceType} onChange={selectSource} />
          {errors.source && <p role="alert" className="text-sm font-medium text-nasa-red">{errors.source}</p>}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="text-sm font-medium text-ink">
              Proveedor u origen
              <input
                value={form.provider}
                readOnly={isSynthetic}
                aria-invalid={Boolean(errors.provider)}
                aria-describedby={errors.provider ? 'provider-error' : undefined}
                onChange={(event) => setForm((previous) => ({ ...previous, provider: event.target.value }))}
                placeholder="Ej. proveedor del archivo"
                className={`${fieldClassName} ${errors.provider ? 'border-nasa-red' : ''}`}
              />
              {errors.provider && <span id="provider-error" className="mt-1 block text-xs text-nasa-red">{errors.provider}</span>}
            </label>

            <label className="text-sm font-medium text-ink">
              Identificador de fuente
              <input
                value={form.sourceId}
                readOnly={isSynthetic}
                aria-invalid={Boolean(errors.sourceId)}
                aria-describedby={errors.sourceId ? 'source-id-error' : undefined}
                onChange={(event) => setForm((previous) => ({ ...previous, sourceId: event.target.value }))}
                placeholder="Ej. DEVICE-001"
                className={`${fieldClassName} ${errors.sourceId ? 'border-nasa-red' : ''}`}
              />
              {errors.sourceId && <span id="source-id-error" className="mt-1 block text-xs text-nasa-red">{errors.sourceId}</span>}
            </label>

            <label className="text-sm font-medium text-ink">
              Tipo de fuente
              <select
                value={form.sourceKind}
                disabled={isSynthetic}
                onChange={(event) => setForm((previous) => ({ ...previous, sourceKind: event.target.value as DataSourceKind }))}
                className={fieldClassName}
              >
                {isSynthetic && <option value="synthetic">Sintético</option>}
                {!isSynthetic && sourceKindOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>

            <label className="text-sm font-medium text-ink">
              Astronauta
              <select
                value={form.astronautId}
                aria-invalid={Boolean(errors.astronautId)}
                onChange={(event) => setForm((previous) => ({ ...previous, astronautId: event.target.value }))}
                className={`${fieldClassName} ${errors.astronautId ? 'border-nasa-red' : ''}`}
              >
                {contextState.data.astronauts.map((astronaut) => (
                  <option key={astronaut.id} value={astronaut.id}>{astronaut.display_name} · {astronaut.id}</option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-ink">
              Fase
              <select
                value={form.phase}
                onChange={(event) => setForm((previous) => ({ ...previous, phase: event.target.value as MissionPhase }))}
                className={fieldClassName}
              >
                {phaseOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>

            <label className="text-sm font-medium text-ink">
              Contexto de actividad
              <input
                value={form.activity}
                aria-invalid={Boolean(errors.activity)}
                onChange={(event) => setForm((previous) => ({ ...previous, activity: event.target.value }))}
                placeholder="Ej. rest, sleep, exercise"
                className={`${fieldClassName} ${errors.activity ? 'border-nasa-red' : ''}`}
              />
              {errors.activity && <span className="mt-1 block text-xs text-nasa-red">{errors.activity}</span>}
            </label>
          </div>

          {sourceType && sourceType !== 'synthetic' && (
            <div>
              <p className="text-sm font-semibold text-ink">Archivo local</p>
              <div
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDrop}
                className={`mt-2 rounded-card border-2 border-dashed p-6 text-center transition-colors ${errors.file ? 'border-nasa-red/50 bg-nasa-red/5' : 'border-line bg-canvas hover:border-data'}`}
              >
                <FileUp aria-hidden="true" className="mx-auto size-7 text-data" />
                <p className="mt-3 text-sm font-semibold text-ink">Arrastra un archivo {extensionFor(sourceType)} o selecciónalo</p>
                <p className="mt-1 text-xs leading-5 text-muted">El archivo se lee localmente. No se carga como multipart ni se publica en este paso.</p>
                <input
                  ref={fileInputRef}
                  id="import-file"
                  type="file"
                  accept={extensionFor(sourceType)}
                  onChange={handleFileChange}
                  className="sr-only"
                />
                <label htmlFor="import-file" className="mt-4 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-control border border-line bg-card px-4 text-sm font-semibold text-ink hover:border-nasa-blue hover:text-nasa-blue">
                  Seleccionar archivo
                </label>
                {file && (
                  <p className="mt-3 flex items-center justify-center gap-2 text-sm text-coverage">
                    <FileCheck2 aria-hidden="true" className="size-4" />
                    {file.name} · {(file.size / 1024).toFixed(1)} KB
                  </p>
                )}
                {errors.file && <p role="alert" className="mt-3 text-sm font-medium text-nasa-red">{errors.file}</p>}
              </div>
            </div>
          )}

          {isSynthetic && (
            <AlertNotice title="Escenario sintético seleccionado" tone="notice">
              <p>SCENARIO-001 contiene registros ficticios del mock v0.2.0. No representa datos médicos reales ni una conexión activa con sensores.</p>
            </AlertNotice>
          )}
        </section>
      )}

      {currentStep === 2 && (
        <section className="space-y-5" aria-labelledby="preview-heading">
          <div className="rounded-card border border-line bg-card p-5 shadow-card lg:p-6">
            <h2 id="preview-heading" className="text-lg font-semibold text-ink">2. Revisa y mapea</h2>
            <p className="mt-1 text-sm leading-6 text-muted">Las unidades reconocidas proceden de GET /catalog/metrics.</p>
            <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Origen', isSynthetic ? 'Sintético · DEMO' : `Archivo ${sourceType?.toUpperCase()}`],
                ['Proveedor', form.provider],
                ['Astronauta', form.astronautId],
                ['Fase / actividad', `${form.phase} · ${form.activity}`],
              ].map(([term, value]) => (
                <div key={term} className="rounded-control border border-line bg-canvas p-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{term}</dt>
                  <dd className="mt-1 text-sm font-semibold text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {previewState === 'loading' ? (
            <LoadingSkeleton rows={4} label="Preparando vista previa del archivo" />
          ) : isSynthetic ? (
            <PreviewTable rows={previewRows} />
          ) : (
            <section className="rounded-card border border-line bg-card p-6 shadow-card">
              <EmptyState
                title="Archivo preparado para mapeo"
                description={`${file?.name ?? 'El archivo'} superó la revisión de extensión y contenido vacío. FE-17 incorporará el parser y mostrará aquí cada fila real; todavía no se deducen ni inventan observaciones.`}
              />
            </section>
          )}

          <AlertNotice title="Mapeo canónico previsto">
            <p><span className="font-mono">metric_code, value, unit, observed_at_utc, phase, quality</span> y <span className="font-mono">activity_context</span>. El parsing y los errores por fila se implementarán en FE-17.</p>
          </AlertNotice>
        </section>
      )}

      {currentStep === 3 && (
        <section className="space-y-5 rounded-card border border-line bg-card p-5 shadow-card lg:p-6" aria-labelledby="validation-heading">
          <div>
            <h2 id="validation-heading" className="text-lg font-semibold text-ink">3. Validación local</h2>
            <p className="mt-1 text-sm leading-6 text-muted">Esta etapa aún no envía datos al backend.</p>
          </div>
          {isSynthetic ? (
            <div className="rounded-card border border-coverage/30 bg-coverage/5 p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-coverage" />
                <div>
                  <h3 className="font-semibold text-ink">{previewRows.length} filas listas · 0 errores locales</h3>
                  <p className="mt-1 text-sm leading-6 text-muted">Las métricas y unidades coinciden con el catálogo cargado. Esto no es todavía una respuesta de FastAPI.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-card border border-notice/35 bg-notice/10 p-5">
              <div className="flex items-start gap-3">
                <TriangleAlert aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-notice" />
                <div>
                  <h3 className="font-semibold text-ink">Validación de filas pendiente de FE-17</h3>
                  <p className="mt-1 text-sm leading-6 text-muted">El archivo es legible y tiene la extensión correcta. No se afirmará que sus filas son válidas hasta implementar el parser canónico.</p>
                </div>
              </div>
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-control border border-line p-4"><ShieldCheck className="size-5 text-data" aria-hidden="true" /><p className="mt-2 text-sm font-semibold">Sin multipart</p><p className="mt-1 text-xs leading-5 text-muted">El archivo no se envía al endpoint.</p></div>
            <div className="rounded-control border border-line p-4"><FlaskConical className="size-5 text-data" aria-hidden="true" /><p className="mt-2 text-sm font-semibold">Procedencia visible</p><p className="mt-1 text-xs leading-5 text-muted">Fuente y etiqueta sintética se conservan.</p></div>
            <div className="rounded-control border border-line p-4"><FileCheck2 className="size-5 text-data" aria-hidden="true" /><p className="mt-2 text-sm font-semibold">Catálogo v0.2.0</p><p className="mt-1 text-xs leading-5 text-muted">Códigos y unidades reconocidos por API.</p></div>
          </div>
        </section>
      )}

      {currentStep === 4 && (
        <section className="space-y-5 rounded-card border border-line bg-card p-5 shadow-card lg:p-6" aria-labelledby="confirmation-heading">
          <div>
            <h2 id="confirmation-heading" className="text-lg font-semibold text-ink">4. Confirma la preparación</h2>
            <p className="mt-1 text-sm leading-6 text-muted">Revisa el origen antes de habilitar el registro en FE-18.</p>
          </div>
          {isSynthetic && (
            <div className="flex items-start gap-3 rounded-card border border-notice/40 bg-notice/10 p-5">
              <FlaskConical aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-notice" />
              <div>
                <p className="font-semibold text-ink">ESCENARIO SINTÉTICO · SCENARIO-001</p>
                <p className="mt-1 text-sm leading-6 text-muted">{previewRows.length} registros ficticios de SilverPulse demo para {form.astronautId}. No son datos médicos reales.</p>
              </div>
            </div>
          )}
          {!isSynthetic && (
            <div className="rounded-card border border-line bg-canvas p-5">
              <p className="text-sm font-semibold text-ink">Archivo local · {file?.name}</p>
              <p className="mt-1 text-sm leading-6 text-muted">Proveedor {form.provider}; fuente {form.sourceId}. El archivo aún no fue convertido ni enviado.</p>
            </div>
          )}
          <AlertNotice title="Publicación todavía deshabilitada">
            <p>FE-16 termina en una confirmación revisable. FE-17 producirá el JSON canónico y FE-18 conectará el envío con protección contra doble clic.</p>
          </AlertNotice>
          <PrimaryButton type="button" disabled className="w-full sm:w-auto">
            Validar y registrar
          </PrimaryButton>
        </section>
      )}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-card/95 p-3 shadow-[0_-8px_24px_rgb(8_24_46/8%)] backdrop-blur sm:static sm:flex sm:items-center sm:justify-between sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
        <SecondaryButton type="button" onClick={resetFlow} className="hidden sm:inline-flex">
          <RotateCcw aria-hidden="true" className="size-4" />
          Cancelar
        </SecondaryButton>
        <div className="flex gap-2 sm:ml-auto">
          {currentStep > 1 && (
            <SecondaryButton type="button" onClick={goBack} className="flex-1 sm:flex-none">
              <ArrowLeft aria-hidden="true" className="size-4" />
              Atrás
            </SecondaryButton>
          )}
          {currentStep < 4 && (
            <PrimaryButton type="button" onClick={advance} disabled={previewState === 'loading'} className="flex-1 sm:flex-none">
              Continuar
              <ArrowRight aria-hidden="true" className="size-4" />
            </PrimaryButton>
          )}
          {currentStep === 4 && (
            <SecondaryButton type="button" onClick={resetFlow} className="flex-1 sm:hidden">
              Cancelar sin publicar
            </SecondaryButton>
          )}
        </div>
      </div>
    </div>
  )
}
