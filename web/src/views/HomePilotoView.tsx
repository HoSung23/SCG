import { Truck, Route, Phone, Mail, IdCard } from 'lucide-react'
import { StatusBadge } from '../components/StatusBadge'
import type { SharedViewProps } from './types'

export function HomePilotoView({ dashboard, fleetState }: SharedViewProps) {
  // En producción esto vendría del usuario logueado; por ahora toma el primer piloto activo
  const pilot = dashboard.pilots.find(p => p.status === 'active') ?? dashboard.pilots[0]

  if (!pilot) {
    return (
      <div className="view-stack">
        <article className="card">
          <p className="muted">No hay pilotos activos en el sistema.</p>
        </article>
      </div>
    )
  }

  const assignedTruck = fleetState.find(t => t.id === pilot.assignedTruckId)
  const recentTrips = dashboard.trips
    .filter(t => t.driver === pilot.name)
    .slice(0, 5)

  const daysLeft = Math.floor(
    (new Date(pilot.licenseDue).getTime() - Date.now()) / 86_400_000
  )

  return (
    <div className="view-stack">
      {/* Perfil */}
      <div className="two-col">
        <article className="card">
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div className="pilot-avatar">{pilot.name.charAt(0).toUpperCase()}</div>
            <div style={{ flex: 1 }}>
              <h2 style={{ marginBottom: 4 }}>{pilot.name}</h2>
              <StatusBadge status={pilot.status ?? 'active'} />
              <div className="pilot-info-grid">
                <span><IdCard size={13} /> Lic. {pilot.licenseType}{pilot.licenseNumber ? ` · ${pilot.licenseNumber}` : ''}</span>
                <span style={{ color: daysLeft < 0 ? '#ef4444' : daysLeft <= 15 ? '#f59e0b' : '#86efac' }}>
                  Vence: {pilot.licenseDue} {daysLeft < 0 ? '⚠ VENCIDA' : daysLeft <= 30 ? `(${daysLeft} días)` : ''}
                </span>
                {pilot.phoneNumber && <span><Phone size={13} /> {pilot.phoneNumber}</span>}
                {pilot.email && <span><Mail size={13} /> {pilot.email}</span>}
              </div>
            </div>
          </div>
        </article>

        {/* Camión asignado */}
        <article className="card">
          <h2><Truck size={16} style={{ display: 'inline', marginRight: 6 }} />Camión asignado</h2>
          {assignedTruck ? (
            <div className="pilot-truck-card">
              <div className="pilot-truck-plate">{assignedTruck.plate}</div>
              <div>
                <strong>{assignedTruck.model}</strong>
                <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                  <StatusBadge status={assignedTruck.status} variant="truck" />
                  {assignedTruck.year && <span className="muted">Año {assignedTruck.year}</span>}
                  <span className="muted">{assignedTruck.fuelKmPerGallon} km/gal</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="muted">Sin camión asignado actualmente.</p>
          )}
        </article>
      </div>

      {/* Últimos 5 viajes */}
      <article className="card">
        <h2><Route size={16} style={{ display: 'inline', marginRight: 6 }} />Últimos 5 viajes</h2>
        {recentTrips.length === 0 ? (
          <p className="muted">Sin viajes registrados para este piloto.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Origen</th>
                <th>Destino</th>
                <th>Km</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {recentTrips.map(trip => (
                <tr key={trip.id}>
                  <td><span className="muted">{trip.date}</span></td>
                  <td>{trip.origin}</td>
                  <td>{trip.destination}</td>
                  <td>{trip.distanceKm} km</td>
                  <td><StatusBadge status={trip.status} variant="trip" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </article>
    </div>
  )
}
