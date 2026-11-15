import {
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'
import type { Baseline, TrendPoint } from '../../types'

interface NumericTrendPoint extends TrendPoint {
  numericValue: number
  timestamp: number
}

interface LongitudinalTrendChartProps {
  points: TrendPoint[]
  baseline: Baseline | null
  unit: string
}

const utcTickFormatter = new Intl.DateTimeFormat('es-CR', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'UTC',
})

const utcTooltipFormatter = new Intl.DateTimeFormat('es-CR', {
  dateStyle: 'medium',
  timeStyle: 'short',
  hour12: false,
  timeZone: 'UTC',
})

function toNumericPoints(points: TrendPoint[]): NumericTrendPoint[] {
  return points.flatMap((point) => {
    const numericValue = typeof point.value === 'number' ? point.value : Number(point.value)
    const timestamp = new Date(point.observed_at_utc).getTime()

    if (!Number.isFinite(numericValue) || !Number.isFinite(timestamp)) return []
    return [{ ...point, numericValue, timestamp }]
  })
}

function TrendTooltip({ active, payload, unit }: { active?: boolean; payload?: Array<{ payload: NumericTrendPoint }>; unit: string }) {
  const point = payload?.[0]?.payload
  if (!active || !point) return null

  return (
    <div className="max-w-64 rounded-control border border-line bg-card p-3 text-xs shadow-card">
      <p className="font-semibold text-ink">{point.numericValue} {unit}</p>
      <p className="mt-1 text-muted">{utcTooltipFormatter.format(new Date(point.timestamp))} UTC</p>
      <p className="mt-1 text-muted">Fase: {point.phase} · Calidad: {point.quality}</p>
      <p className="mt-1 text-muted">Origen: {point.source_kind}</p>
    </div>
  )
}

export function LongitudinalTrendChart({ points, baseline, unit }: LongitudinalTrendChartProps) {
  const numericPoints = toNumericPoints(points)
  const timestamps = numericPoints.map((point) => point.timestamp)
  const minTimestamp = Math.min(...timestamps)
  const maxTimestamp = Math.max(...timestamps)
  const padding = minTimestamp === maxTimestamp ? 12 * 60 * 60 * 1000 : 0
  const xDomain: [number, number] = [minTimestamp - padding, maxTimestamp + padding]
  const observationLabel = numericPoints.length === 1 ? 'observación' : 'observaciones'

  return (
    <div
      className="w-full"
      role="img"
      aria-label={`Gráfico de ${numericPoints.length} ${observationLabel} en ${unit}; observaciones como puntos, sin línea de tendencia`}
    >
      <div className="h-72 w-full sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 16, right: 14, bottom: 22, left: 0 }}>
            <CartesianGrid stroke="#DEE6EF" strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="timestamp"
              domain={xDomain}
              scale="time"
              tickFormatter={(value: number) => utcTickFormatter.format(new Date(value))}
              tick={{ fill: '#64748B', fontSize: 11 }}
              tickMargin={10}
              minTickGap={28}
              name="Fecha UTC"
            />
            <YAxis
              type="number"
              dataKey="numericValue"
              unit={` ${unit}`}
              width={64}
              tick={{ fill: '#64748B', fontSize: 11 }}
              domain={['auto', 'auto']}
              name="Valor"
            />
            <ZAxis range={[90, 90]} />
            <Tooltip content={<TrendTooltip unit={unit} />} cursor={{ strokeDasharray: '3 3' }} />
            {baseline?.median !== null && baseline?.median !== undefined && (
              <ReferenceLine
                y={baseline.median}
                stroke="#15877A"
                strokeDasharray="6 4"
                ifOverflow="extendDomain"
              />
            )}
            <Scatter name="Observaciones recibidas" data={numericPoints} fill="#0B3D91" line={false} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted" aria-label="Leyenda de la gráfica">
        <span className="inline-flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-nasa-blue" aria-hidden="true" />
          Observación recibida
        </span>
        {baseline?.median !== null && baseline?.median !== undefined && (
          <span className="inline-flex items-center gap-2">
            <span className="h-0.5 w-5 bg-coverage" aria-hidden="true" />
            Baseline demo: mediana {baseline.median} {baseline.unit} · n={baseline.n}
          </span>
        )}
      </div>
    </div>
  )
}
