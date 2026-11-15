import type { ShipInboxMessage } from '../../services'
import type { Report } from '../../types'
import type { TimelineEvent } from '../ui'

const reasonExplanations: Record<string, string> = {
  SLEEP_TREND:
    'Se observaron cambios descriptivos en la tendencia de sueño. Esto no constituye un diagnóstico.',
  MISSING_STRENGTH_TEST:
    'No hay una prueba de fuerza muscular disponible para este informe.',
}

const evidenceLabels: Record<string, string> = {
  muscle_strength: 'Fuerza muscular',
  balance_assessment: 'Evaluación de equilibrio',
}

export function explainReasonCode(code: string) {
  return reasonExplanations[code] ?? 'El contrato no proporciona una explicación para este código.'
}

export function labelEvidenceCode(code: string) {
  return evidenceLabels[code] ?? code
}

export function buildCommunicationTimeline(
  report: Report,
  returnedMessage?: ShipInboxMessage,
): TimelineEvent[] {
  const { communication } = report
  const deliveryConfirmed = communication.status === 'delivered'
  const reviewConfirmed = report.review_status === 'reviewed' || Boolean(returnedMessage)
  const returnConfirmed = Boolean(returnedMessage)

  let currentStage: 'queued' | 'delivered' | 'reviewed' | 'returned'
  if (communication.status === 'queued' || communication.status === 'failed_retryable') {
    currentStage = 'queued'
  } else if (communication.status === 'transmitting') {
    currentStage = 'delivered'
  } else if (!reviewConfirmed) {
    currentStage = 'reviewed'
  } else {
    currentStage = 'returned'
  }

  const stageStatus = (
    stage: 'queued' | 'delivered' | 'reviewed' | 'returned',
    confirmed: boolean,
  ): TimelineEvent['status'] => {
    if (confirmed) return 'complete'
    return currentStage === stage ? 'current' : 'pending'
  }

  const queuedDescription =
    communication.priority === 'priority'
      ? 'Prioridad de transporte priority; es logística, no prioridad de emergencia.'
      : 'Prioridad de transporte routine; es logística, no prioridad de emergencia.'

  return [
    {
      id: 'generated',
      label: 'Generado en nave',
      status: 'complete',
      timestamp: report.created_at_utc,
      description: 'Fecha de creación original del informe.',
    },
    {
      id: 'queued',
      label: 'En cola para sincronización',
      status: stageStatus('queued', communication.status !== 'queued' && communication.status !== 'failed_retryable'),
      description: queuedDescription,
    },
    {
      id: 'delivered',
      label: 'Entregado a Tierra',
      status: stageStatus('delivered', deliveryConfirmed),
      timestamp: communication.delivered_at_utc,
      description:
        communication.status === 'transmitting'
          ? 'En tránsito; todavía no está confirmado como entregado.'
          : deliveryConfirmed
            ? 'Estado de entrega confirmado por el informe.'
            : communication.status === 'failed_retryable'
              ? 'Entrega no confirmada; el mensaje requiere reintento.'
              : 'No se marca como entregado hasta recibir confirmación.',
    },
    {
      id: 'reviewed',
      label: 'Revisado en Tierra',
      status: stageStatus('reviewed', reviewConfirmed),
      description: reviewConfirmed
        ? 'La revisión está confirmada por el estado del informe o por la respuesta recibida.'
        : 'No se muestra una revisión como completada sin confirmación.',
    },
    {
      id: 'returned',
      label: 'Respuesta recibida en nave',
      status: stageStatus('returned', returnConfirmed),
      timestamp: returnedMessage?.received_at_utc,
      description: returnConfirmed
        ? 'Respuesta confirmada en /ship/inbox.'
        : 'La nota de Tierra solo se muestra después de aparecer en /ship/inbox.',
    },
  ]
}
