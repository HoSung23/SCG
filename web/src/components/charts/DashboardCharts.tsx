import type { CostSummary, Trip } from '../../types'
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

const COLORS = ['#1d4ed8', '#f59e0b', '#10b981', '#6b7280']

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

  const completedTrips = tripState.filter((trip) => trip.status === 'completado').length
  const weeklyTripsData = Array.from({ length: 8 }, (_, index) => ({
    week: `Sem ${index + 1}`,
    completed: Math.max(1, completedTrips - (7 - index)),
    previous: Math.max(0, completedTrips - (8 - index))
  }))

  return (
    <div className="dashboard-charts">
      <article className="card">
        <h2>Costos por categoría</h2>
        <div className="chart-frame">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={costData}>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(value) => `Q${Math.round(Number(value) / 1000)}k`} />
              <Tooltip formatter={(value: number) => `Q ${value.toLocaleString('es-GT')}`} />
              <Bar dataKey="value" fill="#1d4ed8" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="card">
        <h2>Distribución del mes</h2>
        <div className="chart-frame">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={distributionData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={3}>
                {distributionData.map((_entry, index) => (
                  <Cell key={_entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `Q ${value.toLocaleString('es-GT')}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="card card-wide">
        <h2>Viajes completados por semana</h2>
        <div className="chart-frame">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={weeklyTripsData}>
              <XAxis dataKey="week" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={3} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="previous" stroke="#94a3b8" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>
    </div>
  )
}
