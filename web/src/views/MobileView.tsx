import type { DashboardState } from './types'

type MobileViewProps = {
  dashboard: DashboardState
}

export function MobileView({ dashboard }: MobileViewProps) {
  return (
    <section className="two-col">
      <article className="card">
        <h2>Flujo app móvil</h2>
        <ol>
          <li>Inicia viaje y envía ubicación.</li>
          <li>Opera offline si no hay señal.</li>
          <li>Reporta incidencia desde el camión.</li>
          <li>Finaliza viaje con evidencia.</li>
        </ol>
      </article>

      <article className="card">
        <h2>Reportar incidencia</h2>
        <div className="form-grid">
          <label htmlFor="offline-incident">Incidencia</label>
          <input
            id="offline-incident"
            value={dashboard.offlineForm.reason}
            onChange={(event) => dashboard.setOfflineForm({ ...dashboard.offlineForm, reason: event.target.value })}
          />
          <button type="button" className="action-btn" onClick={dashboard.reportOfflineIncident}>
            Registrar
          </button>
        </div>
      </article>
    </section>
  )
}
