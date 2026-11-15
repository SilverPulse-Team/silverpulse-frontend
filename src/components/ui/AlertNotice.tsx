import { CircleAlert, Info } from 'lucide-react'
import type { ReactNode } from 'react'

interface AlertNoticeProps {
  title: string
  children: ReactNode
  tone?: 'info' | 'notice'
}

export function AlertNotice({ title, children, tone = 'info' }: AlertNoticeProps) {
  const Icon = tone === 'notice' ? CircleAlert : Info

  return (
    <aside
      className={`rounded-card border p-4 ${
        tone === 'notice' ? 'border-notice/35 bg-notice/10' : 'border-data/30 bg-data/10'
      }`}
      aria-label={title}
    >
      <div className="flex gap-3">
        <Icon aria-hidden="true" className={`mt-0.5 size-5 shrink-0 ${tone === 'notice' ? 'text-notice' : 'text-data'}`} />
        <div>
          <p className="text-sm font-semibold text-ink">{title}</p>
          <div className="mt-1 text-sm leading-6 text-muted">{children}</div>
        </div>
      </div>
    </aside>
  )
}
