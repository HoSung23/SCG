import type { CostSummary, Trip } from '../../types'
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

const COLORS = ['#1d4ed8', '#f59e0b', '#10b981', '#6b7280']
const formatCurrency = (value: number) => `Q ${value.toLocaleString('es-GT')}`
const formatCompactCurrency = (value: number) => `Q${Math.round(value / 1000)}k`

export function DashboardCharts({ costState, tripState }: { costState: CostSummary; tripState: Trip[] }) {
  const costData = [
    { name: 'Combustible', value: costState.fuel },
    { name: 'Mantenimiento', value: costState.maintenance },
    { name: 'Planilla', value: costState.payroll },
    { name: 'Administrativo', value: costState.admin }
  ]

  const distributionData = [
    { name: 'Combustible', value: costState.fuel },
    { name: 'Mantenimiento', value: costState.maintenance },
    { name: 'Planilla', value: costState.payroll },
    { name: 'Administrativo', value: costState.admin }
  ]

  const tripStatusData = [
    { name: 'Programados', value: tripState.filter((trip) => trip.status === 'programado').length },
    { name: 'En ruta', value: tripState.filter((trip) => trip.status === 'en-ruta').length },
    { name: 'Completados', value: tripState.filter((trip) => trip.status === 'completado').length }
  ]

  const topTrucksData = Array.from(
    tripState.reduce((acc, trip) => {
      const current = acc.get(trip.truckId) ?? { name: trip.truckId, value: 0 }
      current.value += 1
      acc.set(trip.truckId, current)
      return acc
    }, new Map<string, { name: string; value: number }>()).values()
  )
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)

  const totalCosts = distributionData.reduce((acc, item) => acc + item.value, 0)
  const completedTrips = tripState.filter((trip) => trip.status === 'completado').length
  const inRouteTrips = tripState.filter((trip) => trip.status === 'en-ruta').length
  const scheduledTrips = tripState.filter((trip) => trip.status === 'programado').length

  return (
    <div className="dashboard-charts">
      <article className="card">
        <div className="chart-head">
          <h2>BarChart · Costos por categoría</h2>
          <small>{formatCurrency(totalCosts)} acumulado</small>
        </div>
        <div className="chart-frame">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={costData}>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(value) => formatCompactCurrency(Number(value))} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="value" fill="#1d4ed8" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="card">
        <div className="chart-head">
          <h2>PieChart · Distribución de costos</h2>
          <small>{costData.length} categorías</small>
        </div>
        <div className="chart-frame">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={distributionData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={3}>
                {distributionData.map((_entry, index) => (
                  <Cell key={_entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => {
                  const percentage = totalCosts > 0 ? ((value / totalCosts) * 100).toFixed(1) : '0.0'
                  return `${formatCurrency(value)} (${percentage}%)`
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="card card-wide">
        <h2>Resumen de viajes operativos</h2>
        <div className="trip-summary-grid">
          <article>
            <small>Completados</small>
            <strong>{completedTrips}</strong>
          </article>
          <article>
            <small>En ruta</small>
            <strong>{inRouteTrips}</strong>
          </article>
          <article>
            <small>Programados</small>
            <strong>{scheduledTrips}</strong>
          </article>
        </div>
      </article>

      <article className="card">
        <div className="chart-head">
          <h2>BarChart · Viajes por estado</h2>
          <small>operación actual</small>
        </div>
        <div className="chart-frame">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={tripStatusData}>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="card">
        <div className="chart-head">
          <h2>BarChart · Top camiones por viajes</h2>
          <small>uso relativo de la flota</small>
        </div>
        <div className="chart-frame">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={topTrucksData} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} width={80} />
              <Tooltip />
              <Bar dataKey="value" fill="#f59e0b" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>
    </div>
  )
}
