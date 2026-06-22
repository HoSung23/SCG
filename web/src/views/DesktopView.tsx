type DesktopViewProps = {
  isOfflineMode: boolean
  onToggleOffline: () => void
}

export function DesktopView({ isOfflineMode, onToggleOffline }: DesktopViewProps) {
  return (
    <section className="two-col">
      <article className="card">
        <h2>Desktop oficina</h2>
        <ul>
          <li>Control central de costos</li>
          <li>Seguimiento de alertas en tiempo real</li>
          <li>Operación local con Electron</li>
        </ul>
      </article>

      <article className="card">
        <h2>Modo offline</h2>
        <p>Estado: {isOfflineMode ? 'Activo' : 'Inactivo'}</p>
        <button type="button" className="mini-btn" onClick={onToggleOffline}>
          Alternar
        </button>
      </article>
    </section>
  )
}
