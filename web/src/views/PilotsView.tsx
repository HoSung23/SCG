import type { SharedViewProps } from './types'

export function PilotsView({ dashboard, fleetState }: SharedViewProps) {
  return (
    <section className="two-col">
      <article className="card">
        <h2>Pilotos</h2>
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Licencia</th>
              <th>Unidad asignada</th>
            </tr>
          </thead>
          <tbody>
            {dashboard.pilots.slice(0, 5).map((pilot) => {
              const assignedTruck = fleetState.find((truck) => truck.id === pilot.assignedTruckId)
              return (
                <tr key={pilot.id}>
                  <td>{pilot.name}</td>
                  <td>{pilot.licenseType} · vence {pilot.licenseDue}</td>
                  <td>{assignedTruck ? `${assignedTruck.plate} • ${assignedTruck.model}` : 'Sin asignar'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </article>

      <article className="card">
        <h2>Reasignar piloto</h2>
        <div className="form-grid">
          <label htmlFor="pilot-select">Piloto</label>
          <select
            id="pilot-select"
            value={dashboard.pilotForm.pilotId}
            onChange={(event) => dashboard.setPilotForm({ ...dashboard.pilotForm, pilotId: event.target.value })}
          >
            {dashboard.pilots.map((pilot) => (
              <option key={pilot.id} value={pilot.id}>{pilot.name}</option>
            ))}
          </select>

          <label htmlFor="truck-select">Camión</label>
          <select
            id="truck-select"
            value={dashboard.pilotForm.truckId}
            onChange={(event) => dashboard.setPilotForm({ ...dashboard.pilotForm, truckId: event.target.value })}
          >
            {fleetState.map((truck) => (
              <option key={truck.id} value={truck.id}>{truck.plate}</option>
            ))}
          </select>

          <button type="button" className="action-btn" onClick={dashboard.reassignPilot}>Reasignar</button>
        </div>
      </article>
    </section>
  )
}
