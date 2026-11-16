interface TimeStampProps {
  value: string | Date | null
  label?: string
  className?: string
}

const utcFormatter = new Intl.DateTimeFormat('es-CR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'UTC',
  timeZoneName: 'short',
})

export function TimeStamp({ value, label = 'Fecha de observación', className = '' }: TimeStampProps) {
  if (!value) {
    return <span className={`text-sm text-muted ${className}`}>{label}: Sin fecha</span>
  }

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return <span className={`text-sm text-muted ${className}`}>{label}: Fecha inválida</span>
  }

  return (
    <span className={`text-sm text-muted ${className}`}>
      {label}:{' '}
      <time dateTime={date.toISOString()}>{utcFormatter.format(date)}</time>
    </span>
  )
}
