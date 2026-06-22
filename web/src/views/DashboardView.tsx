import { AlertTriangle, DollarSign, Fuel, Route, Truck, Wrench } from 'lucide-react'
import { KpiCard } from '../components/KpiCard'
import { DashboardCharts } from '../components/charts/DashboardCharts'
import type { SharedViewProps } from './types'

export function DashboardView({ dashboard, formatMoney, fleetState, fuelState }: SharedViewProps) {
  const maxFuelValue = fuelState.length > 0 ? Math.max(...fuelState.map((item) => item.dieselGtq)) : 1
  const avgFuelPrice = fuelState.length > 0 ? fuelState.reduce((acc, item) => acc + item.dieselGtq, 0) / fuelState.length : 0

  return (
    <>
      <section className="kpi-grid">
        <KpiCard title="Viajes activos" value={dashboard.activeTrips.length} subtitle="en operación" icon={<Route size={18} />} accent />
        <KpiCard title="Camiones activos" value={`${dashboard.activeTrucks.length} / ${fleetState.length}`} subtitle="disponibles hoy" icon={<Truck size={18} />} />
        <KpiCard title="Costo mensual" value={formatMoney(dashboard.totalCosts)} subtitle="acumulado del mes" icon={<DollarSign size={18} />} />
        <KpiCard title="Precio diesel máximo" value={formatMoney(maxFuelValue)} subtitle="referencia actual" icon={<Fuel size={18} />} />
        <KpiCard title="Mantenimientos pendientes" value={dashboard.pendingMaintenance.length} subtitle="por resolver" icon={<Wrench size={18} />} />
        <KpiCard title="Alertas críticas" value={dashboard.alerts.length} subtitle="alertas activas" icon={<AlertTriangle size={18} />} />
      </section>

      <DashboardCharts costState={dashboard.costs} tripState={dashboard.trips} />

      <section className="two-col">
        <article className="card">
          <h2>Radar de precios de combustible</h2>
          <div className="fuel-bars">
            {fuelState.map((snapshot) => (
              <div key={snapshot.station} className="fuel-row">
                <span>{snapshot.station}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(snapshot.dieselGtq / maxFuelValue) * 100}%` }} />
                </div>
                <strong>{formatMoney(snapshot.dieselGtq)}</strong>
              </div>
            ))}
          </div>
          <strong>Promedio semanal: {formatMoney(avgFuelPrice)}</strong>
        </article>

        <article className="card">
          <h2>Alertas operativas</h2>
          <button type="button" className="mini-btn" onClick={() => dashboard.dismissAlert(dashboard.alerts[0]?.id || '')}>
            Resolver alerta
          </button>
          <ul className="alert-list">
            {dashboard.alerts.slice(0, 5).map((alert) => (
              <li key={alert.id}>
                <strong>{alert.title}</strong>
                <small>{alert.level} · {alert.detail}</small>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </>
  )
}
