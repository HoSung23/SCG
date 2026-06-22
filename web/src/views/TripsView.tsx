import { StatusBadge } from '../components/StatusBadge'
import type { SharedViewProps } from './types'

type TripsViewProps = SharedViewProps & {
  selectedTripId: string
  setSelectedTripId: (value: string) => void
}

export function TripsView({ dashboard, selectedTripId, setSelectedTripId }: TripsViewProps) {
  const selectedTrip = dashboard.trips.find((trip) => trip.id === selectedTripId)

  return (
    <section className="two-col">
      <article className="card">
        <h2>Viajes recientes</h2>
        <table>
          <thead>
            <tr>
              <th>Ruta</th>
              <th>Piloto</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {dashboard.trips.slice(0, 5).map((trip) => (
              <tr key={trip.id}>
                <td>{trip.origin} → {trip.destination}</td>
                <td>{trip.driver}</td>
                <td><StatusBadge status={trip.status} variant="trip" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>

      <article className="card">
        <h2>Acción rápida</h2>
        <label htmlFor="trip-select">Viaje</label>
        <select id="trip-select" value={selectedTripId} onChange={(event) => setSelectedTripId(event.target.value)}>
          {dashboard.trips.map((trip) => (
            <option key={trip.id} value={trip.id}>{trip.origin} → {trip.destination}</option>
          ))}
        </select>
        <button type="button" className="action-btn" onClick={() => dashboard.advanceTripStatus(selectedTripId)}>
          Avanzar estado
        </button>
        {selectedTrip && <p className="muted">Estado actual: {selectedTrip.status}</p>}
      </article>
    </section>
  )
}
