import { Link } from 'react-router'
import { AlertNotice, PrimaryButton } from '../ui'
import type { GuidedQuestion } from '../../types'

interface Props {
  questions: GuidedQuestion[]
  answers: Record<string, string>
  disabled?: boolean
  saving?: boolean
  analysisId: string
  onChange: (questionId: string, answer: string) => void
  onSave: () => void
}

export function GuidedQuestionsPanel({ questions, answers, disabled, saving, analysisId, onChange, onSave }: Props) {
  if (questions.length === 0) return null
  const complete = questions.every((question) => answers[question.id] !== undefined)
  const asksForRepeat = questions.some((question) => question.options.includes('Ya la repeti'))

  return (
    <section aria-labelledby="guided-title" className="rounded-card border border-line bg-card p-5 shadow-card sm:p-6">
      <h2 id="guided-title" className="text-lg font-semibold text-ink">Preguntas previas de Decision 1</h2>
      <p className="mt-1 text-sm leading-6 text-muted">Las opciones y sus identificadores provienen del backend.</p>
      {asksForRepeat && (
        <div className="mt-4">
          <AlertNotice title="Repetir exige una lectura nueva" tone="notice">
            “Ya la repetí” no vuelve confiable el dato anterior. Registra la nueva observación y después pulsa
            “Buscar lecturas nuevas”. <Link className="font-semibold text-nasa-blue underline" to={`/astronaut/import?analysis=${encodeURIComponent(analysisId)}`}>Ir a importar</Link>.
          </AlertNotice>
        </div>
      )}
      <div className="mt-5 space-y-5">
        {questions.map((question) => (
          <fieldset key={question.id} disabled={disabled} className="rounded-control border border-line p-4">
            <legend className="px-1 text-sm font-semibold text-ink">{question.text}</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {question.options.map((option) => (
                <label key={option} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-control border border-line px-3 text-sm hover:border-nasa-blue">
                  <input type="radio" name={question.id} value={option} checked={answers[question.id] === option}
                    onChange={() => onChange(question.id, option)} className="size-4 accent-nasa-blue" />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      <PrimaryButton type="button" disabled={!complete || disabled} isSubmitting={saving} onClick={onSave} className="mt-5 w-full sm:w-auto">
        Guardar respuestas
      </PrimaryButton>
    </section>
  )
}
