import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export type BadgeTone = 'blue' | 'teal' | 'amber' | 'neutral'

interface StatusBadgeProps {
  icon: LucideIcon
  label: string
  tone?: BadgeTone
  prefix?: ReactNode
}

const toneClasses: Record<BadgeTone, string> = {
  blue: 'border-data/30 bg-data/10 text-nasa-blue',
  teal: 'border-coverage/30 bg-coverage/10 text-coverage',
  amber: 'border-notice/30 bg-notice/10 text-ink',
  neutral: 'border-line bg-canvas text-muted',
}

export function StatusBadge({ icon: Icon, label, tone = 'neutral', prefix }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex min-h-7 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${toneClasses[tone]}`}
      aria-label={label}
    >
      <Icon aria-hidden="true" className="size-3.5 shrink-0" />
      {prefix}
      <span>{label}</span>
    </span>
  )
}
