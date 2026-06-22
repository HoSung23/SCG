import { StatusBadge } from '../components/StatusBadge'
import type { SharedViewProps } from './types'

export function MaintenanceView({ dashboard, fleetState }: SharedViewProps) {
  return (
    <section className="two-col">
      <article className="card">
        <h2>Mantenimiento programado</h2>
        <table>
          <thead>
            <tr>
              <th>Unidad</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {dashboard.maintenance.slice(0, 5).map((task) => (
              <tr key={task.id}>
                <td>{task.truckPlate}</td>
                <td>{task.type}</td>
                <td><StatusBadge status={task.status} variant="maintenance" /></td>
                <td>
                  {task.status !== 'completado' && (
                    <button type="button" className="mini-btn" onClick={() => dashboard.markMaintenanceComplete(task.id)}>
                      Completar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>

      <article className="card">
        <h2>Registrar mantenimiento</h2>
        <div className="form-grid">
          <label htmlFor="maint-truck">Camión</label>
          <select
            id="maint-truck"
            value={dashboard.maintenanceForm.truckId}
            onChange={(event) => dashboard.setMaintenanceForm({ ...dashboard.maintenanceForm, truckId: event.target.value })}
          >
            {fleetState.map((truck) => (
              <option key={truck.id} value={truck.id}>{truck.plate}</option>
            ))}
          </select>

          <label htmlFor="maint-cost">Costo (GTQ)</label>
          <input
            id="maint-cost"
            type="number"
            value={dashboard.maintenanceForm.cost}
            onChange={(event) => dashboard.setMaintenanceForm({ ...dashboard.maintenanceForm, cost: event.target.value })}
          />

          <button type="button" className="action-btn">Registrar</button>
        </div>
      </article>
    </section>
  )
}
