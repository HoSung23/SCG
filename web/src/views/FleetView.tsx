import { StatusBadge } from '../components/StatusBadge'
import type { SharedViewProps } from './types'

export function FleetView({ dashboard, fleetState }: SharedViewProps) {
  return (
    <section className="two-col">
      <article className="card">
        <h2>Flota de camiones</h2>
        <table>
          <thead>
            <tr>
              <th>Placa</th>
              <th>Modelo</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {fleetState.map((truck) => (
              <tr key={truck.id}>
                <td>{truck.plate}</td>
                <td>{truck.model}</td>
                <td><StatusBadge status={truck.status} variant="truck" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>

      <article className="card">
        <h2>Actualizar estado</h2>
        <div className="form-grid">
          <label htmlFor="fleet-select">Unidad</label>
          <select
            id="fleet-select"
            value={dashboard.fleetStatusForm.truckId}
            onChange={(event) => dashboard.setFleetStatusForm({ ...dashboard.fleetStatusForm, truckId: event.target.value })}
          >
            {fleetState.map((truck) => (
              <option key={truck.id} value={truck.id}>{truck.plate}</option>
            ))}
          </select>

          <label htmlFor="fleet-status">Estado</label>
          <select
            id="fleet-status"
            value={dashboard.fleetStatusForm.newStatus}
            onChange={(event) => dashboard.setFleetStatusForm({ ...dashboard.fleetStatusForm, newStatus: event.target.value as 'active' | 'maintenance' | 'idle' })}
          >
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="idle">Idle</option>
          </select>

          <button type="button" className="action-btn" onClick={dashboard.updateFleetStatus}>Aplicar</button>
        </div>
      </article>
    </section>
  )
}
