import type { ResearchSource } from '../../services'
import { toSafeExternalUrl } from './sourceUrl'

export function SourcesList({ sources }: { sources: ResearchSource[] }) {
  return (
    <ul className="grid gap-4 lg:grid-cols-2">
      {sources.map((source) => {
        const href = toSafeExternalUrl(source.url)

        return (
          <li key={source.id}>
            <article className="h-full rounded-card border border-line bg-card p-5 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-wide text-nasa-blue">
                Atribución / ID del catálogo: {source.id}
              </p>
              <h2 className="mt-2 text-lg font-semibold text-ink">{source.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                <strong className="text-ink">Relevancia:</strong> {source.relevance}
              </p>
              {href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex min-h-11 items-center break-all font-medium text-nasa-blue underline underline-offset-2 hover:text-deep-space"
                >
                  Consultar fuente pública: {source.url}
                </a>
              ) : (
                <p role="alert" className="mt-4 text-sm text-muted">
                  El catálogo contiene una URL no válida; se omitió el enlace externo.
                </p>
              )}
            </article>
          </li>
        )
      })}
    </ul>
  )
}
