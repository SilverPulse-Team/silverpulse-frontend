import { Check, Circle, Clock3 } from 'lucide-react'
import { TimeStamp } from './TimeStamp'

export interface TimelineEvent {
  id: string
  label: string
  status: 'complete' | 'current' | 'pending'
  timestamp?: string | Date | null
  description?: string
}

export function ReportTimeline({ events, label = 'Historial del informe' }: { events: TimelineEvent[]; label?: string }) {
  return (
    <ol aria-label={label} className="space-y-0">
      {events.map((event, index) => {
        const Icon = event.status === 'complete' ? Check : event.status === 'current' ? Clock3 : Circle
        const isLast = index === events.length - 1

        return (
          <li key={event.id} className="relative flex gap-3 pb-6 last:pb-0">
            {!isLast && <span aria-hidden="true" className="absolute left-[15px] top-8 h-[calc(100%-2rem)] w-px bg-line" />}
            <span
              className={`relative z-10 grid size-8 shrink-0 place-items-center rounded-full border ${
                event.status === 'complete'
                  ? 'border-coverage bg-coverage text-white'
                  : event.status === 'current'
                    ? 'border-nasa-blue bg-nasa-blue text-white'
                    : 'border-line bg-card text-muted'
              }`}
            >
              <Icon aria-hidden="true" className="size-4" />
            </span>
            <div className="min-w-0 pt-1">
              <p className={`text-sm font-semibold ${event.status === 'pending' ? 'text-muted' : 'text-ink'}`}>{event.label}</p>
              {event.description && <p className="mt-1 text-sm leading-5 text-muted">{event.description}</p>}
              {event.timestamp !== undefined && <TimeStamp value={event.timestamp} label="Fecha" className="mt-1 block text-xs" />}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
