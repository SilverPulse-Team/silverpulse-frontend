import type { ShipInboxMessage } from '../../services'
import type { Report, SimulatorMetrics, SimulatorMode, SimulatorStatus } from '../../types'
import type { TimelineEvent } from '../ui'

export type ConfirmedDemoStage = 'offline' | 'queue-held' | 'reconnect'

export function buildDemoSequenceEvents({
  status,
  metrics,
  shipReports,
  earthReports,
  inboxMessages,
  confirmedStages = [],
}: {
  status: SimulatorStatus
  metrics: SimulatorMetrics
  shipReports: Report[]
  earthReports: Report[]
  inboxMessages: ShipInboxMessage[]
  confirmedStages?: ConfirmedDemoStage[]
}): TimelineEvent[] {
  const shipReportIds = new Set([
    ...shipReports.map((report) => report.report_id),
    ...earthReports.map((report) => report.report_id),
  ])
  const deliveredEarthReports = earthReports.filter(
    (report) =>
      report.communication.status === 'delivered' && report.communication.delivered_at_utc !== null,
  )
  const generated = shipReports.length > 0
  const offline = status.mode === 'offline' || confirmedStages.includes('offline')
  const queued =
    (status.mode === 'offline' && status.queued_ship_to_earth > 0) ||
    confirmedStages.includes('queue-held')
  const reconnected =
    status.mode === 'online' ||
    status.mode === 'delayed' ||
    confirmedStages.includes('reconnect')
  const received = deliveredEarthReports.length > 0
  const reviewed = deliveredEarthReports.some((report) => report.review_status === 'reviewed')
  const returned = inboxMessages.some((message) => shipReportIds.has(message.report_id))

  const evidence = [
    generated,
    offline,
    queued,
    reconnected,
    metrics.has_run,
    received,
    reviewed,
    returned,
  ]
  const currentIndex = evidence.findIndex((confirmed) => !confirmed)
  const stateAt = (index: number): TimelineEvent['status'] =>
    evidence[index] ? 'complete' : index === currentIndex ? 'current' : 'pending'

  const knownReport = shipReports[0]
  const deliveredReport = deliveredEarthReports[0]
  const returnedMessage = inboxMessages.find((message) => shipReportIds.has(message.report_id))

  return [
    {
      id: 'generate',
      label: 'Generar informe local',
      status: stateAt(0),
      timestamp: knownReport?.created_at_utc,
      description: generated
        ? `Informe visible en /ship/reports: ${knownReport.report_id}.`
        : 'Pendiente de confirmación por el listado local de informes.',
    },
    {
      id: 'offline',
      label: 'Desconectar Tierra (modo offline)',
      status: stateAt(1),
      description: offline
        ? `Modo offline observado${status.mode === 'offline' ? ' en el estado actual' : ' en la respuesta de configuración'}.`
        : 'Se confirma solo cuando la respuesta de configuración indica offline.',
    },
    {
      id: 'queue',
      label: 'Mantener mensajes en cola',
      status: stateAt(2),
      description: queued
        ? 'La respuesta del simulador informó mensajes nave → Tierra en cola.'
        : 'Pendiente de una cuenta de cola mayor que cero observada con el enlace offline.',
    },
    {
      id: 'reconnect',
      label: 'Reconectar (online o delayed)',
      status: stateAt(3),
      description: reconnected
        ? `Modo ${status.mode} observado en el estado del simulador.`
        : 'Se confirma solo con una respuesta online o delayed.',
    },
    {
      id: 'advance',
      label: 'Avanzar reloj y consultar resultados',
      status: stateAt(4),
      description: metrics.has_run
        ? `La API de métricas reporta una ejecución: ${metrics.scenario_id}.`
        : 'La respuesta de métricas indica has_run=false; no se afirma un avance ejecutado.',
    },
    {
      id: 'receive',
      label: 'Confirmar recepción en Tierra',
      status: stateAt(5),
      timestamp: deliveredReport?.communication.delivered_at_utc,
      description: received
        ? `Informe recibido por /earth/reports: ${deliveredReport.report_id}.`
        : 'Pendiente de un informe con entrega confirmada en la bandeja de Tierra.',
    },
    {
      id: 'review',
      label: 'Revisar informe en Tierra',
      status: stateAt(6),
      description: reviewed
        ? 'El informe recibido indica review_status=reviewed.'
        : 'Pendiente de review_status=reviewed en el informe recibido.',
    },
    {
      id: 'return',
      label: 'Recibir comentario a bordo',
      status: stateAt(7),
      timestamp: returnedMessage?.received_at_utc,
      description: returned
        ? `Respuesta confirmada en /ship/inbox: ${returnedMessage?.message_id}.`
        : 'Pendiente; una revisión en Tierra no confirma la recepción en nave.',
    },
  ]
}

export function isReconnectedMode(mode: SimulatorMode) {
  return mode === 'online' || mode === 'delayed'
}
