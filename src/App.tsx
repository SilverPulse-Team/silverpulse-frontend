function App() {
  return (
    <div className="min-h-screen bg-canvas text-ink lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="bg-deep-space px-6 py-8 text-white lg:min-h-screen">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="grid size-10 place-items-center rounded-full border border-data font-semibold text-data"
          >
            SP
          </span>
          <div>
            <p className="text-lg font-semibold tracking-tight">SilverPulse</p>
            <p className="text-sm text-slate-300">Sistema de diseño</p>
          </div>
        </div>

        <div className="mt-8 rounded-card bg-midnight-surface p-4 text-sm text-slate-200">
          <p className="font-semibold text-white">Entorno de muestra</p>
          <p className="mt-1">Página técnica para verificar tokens y estilos globales.</p>
        </div>
      </aside>

      <main className="px-4 py-8 sm:px-8 lg:px-12 lg:py-10">
        <header className="mb-8 flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-nasa-blue">
              Fundamentos visuales · FE-04
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Interfaz de misión sobria y accesible
            </h1>
            <p className="mt-2 max-w-2xl text-muted">
              Tokens locales de SilverPulse aplicados sobre un canvas claro y una superficie oscura.
            </p>
          </div>
          <span className="w-fit rounded-full border border-notice/30 bg-notice/10 px-3 py-1.5 text-sm font-semibold text-ink">
            DATOS SINTÉTICOS · DEMO
          </span>
        </header>

        <section aria-labelledby="tokens-title">
          <h2 id="tokens-title" className="text-xl font-semibold">
            Tokens principales
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-card border border-line bg-card p-5 shadow-card">
              <span className="mb-4 block h-2 rounded-full bg-nasa-blue" />
              <p className="font-semibold">NASA Blue</p>
              <p className="mt-1 text-sm text-muted">Acciones y navegación activa</p>
              <code className="mt-4 block text-sm">#0B3D91</code>
            </article>
            <article className="rounded-card border border-line bg-card p-5 shadow-card">
              <span className="mb-4 block h-2 rounded-full bg-data" />
              <p className="font-semibold">Datos</p>
              <p className="mt-1 text-sm text-muted">Visualización secundaria</p>
              <code className="mt-4 block text-sm">#2687C9</code>
            </article>
            <article className="rounded-card border border-line bg-card p-5 shadow-card">
              <span className="mb-4 block h-2 rounded-full bg-coverage" />
              <p className="font-semibold">Cobertura</p>
              <p className="mt-1 text-sm text-muted">Evidencia disponible</p>
              <code className="mt-4 block text-sm">#15877A</code>
            </article>
            <article className="rounded-card border border-line bg-card p-5 shadow-card">
              <span className="mb-4 block h-2 rounded-full bg-nasa-red" />
              <p className="font-semibold">NASA Red</p>
              <p className="mt-1 text-sm text-muted">Acento puntual, no diagnóstico</p>
              <code className="mt-4 block text-sm">#FC3D21</code>
            </article>
          </div>
        </section>

        <section aria-labelledby="controls-title" className="mt-8 rounded-card border border-line bg-card p-6 shadow-card">
          <h2 id="controls-title" className="text-xl font-semibold">
            Controles y foco
          </h2>
          <p className="mt-2 text-muted">
            Usa Tab para comprobar el indicador de foco visible y los estados distinguibles.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              className="min-h-11 rounded-control bg-nasa-blue px-5 py-2.5 font-semibold text-white transition-colors hover:bg-deep-space"
            >
              Acción principal
            </button>
            <button
              type="button"
              className="min-h-11 rounded-control border border-line bg-card px-5 py-2.5 font-semibold text-ink transition-colors hover:border-nasa-blue hover:text-nasa-blue"
            >
              Acción secundaria
            </button>
            <button
              type="button"
              disabled
              className="min-h-11 cursor-not-allowed rounded-control bg-slate-200 px-5 py-2.5 font-semibold text-slate-500"
            >
              Acción deshabilitada
            </button>
          </div>
        </section>

        <p className="mt-8 text-sm text-muted">
          Prototipo independiente · NASA Space Apps Challenge 2026
        </p>
      </main>
    </div>
  )
}

export default App
