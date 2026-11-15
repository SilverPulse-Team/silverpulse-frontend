import type { ReactNode } from 'react'
import { EmptyState } from './EmptyState'

export interface DataTableColumn<Row> {
  key: string
  header: string
  render: (row: Row) => ReactNode
}

interface ResponsiveDataTableProps<Row> {
  caption: string
  columns: DataTableColumn<Row>[]
  rows: Row[]
  getRowKey: (row: Row) => string
  emptyTitle?: string
  emptyDescription?: string
}

export function ResponsiveDataTable<Row>({
  caption,
  columns,
  rows,
  getRowKey,
  emptyTitle = 'Sin registros',
  emptyDescription = 'No hay datos disponibles para mostrar.',
}: ResponsiveDataTableProps<Row>) {
  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <section className="overflow-hidden rounded-card border border-line bg-card shadow-card">
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-canvas text-xs uppercase tracking-wide text-muted">
            <tr>
              {columns.map((column) => (
                <th key={column.key} scope="col" className="border-b border-line px-4 py-3 font-semibold">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row) => (
              <tr key={getRowKey(row)} className="align-top hover:bg-canvas/70">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-4 text-ink">
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-line md:hidden" aria-label={caption}>
        {rows.map((row) => (
          <article key={getRowKey(row)} className="space-y-3 p-4">
            {columns.map((column) => (
              <div key={column.key} className="grid grid-cols-[minmax(7rem,0.8fr)_minmax(0,1.2fr)] gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">{column.header}</p>
                <div className="min-w-0 text-sm text-ink">{column.render(row)}</div>
              </div>
            ))}
          </article>
        ))}
      </div>
    </section>
  )
}
