import { useEffect, useMemo, useRef, useState } from 'react'
import { GripVertical } from 'lucide-react'
import { ResponsiveGridLayout, type LayoutItem } from 'react-grid-layout'
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { DashboardCharts } from '../components/charts/DashboardCharts'
import type { SharedViewProps } from './types'

const KPI_LAYOUT_KEY = 'scg:dashboard:kpi-layout:v2'
const KPI_DAYS_WINDOW = 14
const LITERS_PER_GALLON = 3.78541
const MS_PER_HOUR = 1000 * 60 * 60
const MS_PER_DAY = 1000 * 60 * 60 * 24

const formatHours = (value: number) => `${value.toFixed(1)} h`
const formatDays = (value: number) => `${value.toFixed(0)} d`
const toNumber = (value: unknown) => Number(value ?? 0) || 0

type TimeSeriesPoint = { dateKey: string; label: string; [key: string]: string | number }
type KpiWidget = {
  id: string
  title: string
  kind: 'line' | 'bar'
  series: Array<{ key: string; label: string; color: string }>
  data: TimeSeriesPoint[]
}

const DEFAULT_LAYOUT: LayoutItem[] = [
  { i: 'operativos', x: 0, y: 0, w: 4, h: 3, minW: 3, minH: 2 },
  { i: 'combustible', x: 4, y: 0, w: 4, h: 3, minW: 3, minH: 2 },
  { i: 'flota', x: 8, y: 0, w: 4, h: 3, minW: 3, minH: 2 },
  { i: 'pilotos', x: 0, y: 3, w: 4, h: 3, minW: 3, minH: 2 },
  { i: 'financieros', x: 4, y: 3, w: 4, h: 3, minW: 3, minH: 2 },
  { i: 'programacion', x: 8, y: 3, w: 4, h: 3, minW: 3, minH: 2 },
  { i: 'gerencia', x: 0, y: 6, w: 12, h: 2, minW: 4, minH: 2 }
]

const loadLayout = (): LayoutItem[] => {
  if (typeof window === 'undefined') return DEFAULT_LAYOUT
  try {
    const raw = window.localStorage.getItem(KPI_LAYOUT_KEY)
    if (!raw) return DEFAULT_LAYOUT
    const parsed = JSON.parse(raw) as LayoutItem[]
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_LAYOUT
  } catch {
    return DEFAULT_LAYOUT
  }
}

const normalizeLayout = (layout: LayoutItem[]) => layout.map((item) => ({ ...item, w: Math.max(3, item.w), h: Math.max(2, item.h) }))

function toDateKey(value: unknown) {
  if (!value) return null
  const parsed = new Date(String(value))
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toISOString().slice(0, 10)
}

function buildDateWindow(days: number) {
  const current = new Date()
  current.setHours(0, 0, 0, 0)
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(current)
    date.setDate(current.getDate() - (days - 1 - index))
    return date.toISOString().slice(0, 10)
  })
}

function dateLabel(dateKey: string) {
  const [, month, day] = dateKey.split('-')
  return `${day}/${month}`
}

function renderWidgetChart(widget: KpiWidget, options?: { compact?: boolean }) {
  const compact = options?.compact ?? false
  return (
    <div className={`dashboard-kpi-chart${compact ? ' dashboard-kpi-chart--compact' : ''}`}>
      <ResponsiveContainer width="100%" height="100%">
        {widget.kind === 'line' ? (
          <LineChart data={widget.data} margin={{ top: 8, right: 6, bottom: 4, left: 2 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
            <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            {!compact && <Legend wrapperStyle={{ fontSize: 11 }} />}
            {widget.series.map((serie) => (
              <Line key={serie.key} type="monotone" dataKey={serie.key} name={serie.label} stroke={serie.color} strokeWidth={2.2} dot={false} />
            ))}
          </LineChart>
        ) : (
          <BarChart data={widget.data} margin={{ top: 8, right: 6, bottom: 4, left: 2 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
            <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            {!compact && <Legend wrapperStyle={{ fontSize: 11 }} />}
            {widget.series.map((serie) => (
              <Bar key={serie.key} dataKey={serie.key} name={serie.label} fill={serie.color} radius={[6, 6, 0, 0]} />
            ))}
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}

export function DashboardView({ dashboard, formatMoney, fleetState }: SharedViewProps) {
  const [layout, setLayout] = useState<LayoutItem[]>(() => loadLayout())
  const [editMode, setEditMode] = useState(false)
  const [gridWidth, setGridWidth] = useState(() => (typeof window === 'undefined' ? 1200 : window.innerWidth))
  const gridContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    try {
      window.localStorage.setItem(KPI_LAYOUT_KEY, JSON.stringify(layout))
    } catch {
      // ignore
    }
  }, [layout])

  useEffect(() => {
    const container = gridContainerRef.current
    if (!container || typeof ResizeObserver === 'undefined') return

    const updateWidth = () => {
      const nextWidth = Math.max(320, Math.floor(container.getBoundingClientRect().width))
      setGridWidth(nextWidth)
    }

    updateWidth()
    const observer = new ResizeObserver(updateWidth)
    observer.observe(container)

    return () => observer.disconnect()
  }, [])

  const trips = dashboard.trips ?? []
  const fuelRecords = (dashboard.fuelRecords ?? []) as any[]
  const programaciones = (dashboard.programaciones ?? []) as any[]

  const today = new Date().toISOString().slice(0, 10)
  const todayTrips = trips.filter((trip) => trip.date === today)
  const activeTrips = trips.filter((trip) => trip.status === 'en-ruta')
  const completedTrips = trips.filter((trip) => trip.status === 'completado')
  const scheduledTrips = trips.filter((trip) => trip.status === 'programado')
  const criticalAlerts = dashboard.alerts.filter((alert) => alert.level === 'critical')
  const warningAlerts = dashboard.alerts.filter((alert) => alert.level === 'warning')

  const activeTrucks = fleetState.filter((truck) => truck.status === 'active')
  const inactiveTrucks = fleetState.filter((truck) => truck.status !== 'active')

  const trucksByUse = useMemo(
    () =>
      [...fleetState]
        .map((truck) => ({ truck, trips: trips.filter((trip) => trip.truckId === truck.id).length }))
        .sort((a, b) => b.trips - a.trips),
    [fleetState, trips]
  )

  const completedWithTime = completedTrips.filter((trip) => trip.startedAt && trip.completedAt)
  const avgTripHours = completedWithTime.length
    ? completedWithTime.reduce((sum, trip) => sum + ((new Date(trip.completedAt!).getTime() - new Date(trip.startedAt!).getTime()) / MS_PER_HOUR), 0) / completedWithTime.length
    : 0

  const plannedKm = trips.reduce((sum, trip) => sum + toNumber(trip.distanceKm), 0)
  const realKm = trips.reduce((sum, trip) => sum + toNumber(trip.actualDistanceKm ?? trip.distanceKm), 0)
  const kmVariance = plannedKm > 0 ? ((realKm - plannedKm) / plannedKm) * 100 : 0

  const fuelToday = fuelRecords.filter((record) => record.recordedAt?.slice(0, 10) === today)
  const totalFuelLiters = fuelRecords.reduce((sum, record) => sum + (toNumber(record.gallonsDispensed) * LITERS_PER_GALLON), 0)
  const totalFuelCost = fuelRecords.reduce((sum, record) => sum + toNumber(record.totalCostGtq), 0)
  const fuelTodayCost = fuelToday.reduce((sum, record) => sum + toNumber(record.totalCostGtq), 0)
  const fuelTodayLiters = fuelToday.reduce((sum, record) => sum + (toNumber(record.gallonsDispensed) * LITERS_PER_GALLON), 0)
  const latestFuelPrice = fuelRecords[0]?.dieselPriceGtq ?? null
  const memFuelPrice = dashboard.memFuelPrice?.dieselPrecio ?? null
  const memVariation = memFuelPrice && latestFuelPrice ? ((latestFuelPrice - memFuelPrice) / memFuelPrice) * 100 : null

  const fuelByTruck = fleetState
    .map((truck) => {
      const records = fuelRecords.filter((record) => record.truckId === truck.id)
      return {
        truck,
        liters: records.reduce((sum: number, record: any) => sum + (toNumber(record.gallonsDispensed) * LITERS_PER_GALLON), 0),
        cost: records.reduce((sum: number, record: any) => sum + toNumber(record.totalCostGtq), 0),
        gallons: records.reduce((sum: number, record: any) => sum + toNumber(record.gallonsDispensed), 0)
      }
    })
    .sort((a, b) => b.liters - a.liters)

  const completedWithFuel = completedTrips.filter((trip) => trip.fuelConsumptionGallons && trip.fuelConsumptionGallons > 0)
  const avgKmPerGallon = completedWithFuel.length
    ? completedWithFuel.reduce((sum, trip) => sum + (toNumber(trip.actualDistanceKm ?? trip.distanceKm) / toNumber(trip.fuelConsumptionGallons)), 0) / completedWithFuel.length
    : 0

  const pilotStats = dashboard.pilots.map((pilot) => {
    const pilotTrips = trips.filter((trip) => trip.pilotId === pilot.id || trip.driver === pilot.name)
    const pilotHours = pilotTrips
      .filter((trip) => trip.startedAt && trip.completedAt)
      .reduce((sum, trip) => sum + ((new Date(trip.completedAt!).getTime() - new Date(trip.startedAt!).getTime()) / MS_PER_HOUR), 0)
    const incidents = dashboard.alerts.filter((alert) => alert.relatedPilotId === pilot.id).length
    const daysLeft = Math.floor((new Date(pilot.licenseDue).getTime() - Date.now()) / MS_PER_DAY)
    return { pilot, trips: pilotTrips.length, hours: pilotHours, incidents, daysLeft }
  }).sort((a, b) => b.trips - a.trips)

  const expiringLicenses = pilotStats.filter((pilot) => pilot.daysLeft <= 30)
  const avgFleetAge = fleetState.length
    ? fleetState.reduce((sum, truck) => sum + (truck.year ? new Date().getFullYear() - truck.year : 0), 0) / fleetState.length
    : 0

  const totalCosts = dashboard.totalCosts
  const maintenanceToFuelRatio = dashboard.costs.fuel > 0 ? dashboard.costs.maintenance / dashboard.costs.fuel : 0
  const costPerTrip = completedTrips.length ? totalCosts / completedTrips.length : 0
  const costPerKm = realKm > 0 ? totalCosts / realKm : 0

  const programacionesCumplidas = programaciones.filter((item) => item.trip_id || item.status === 'completado').length
  const programacionesPendientes = programaciones.filter((item) => !item.trip_id && item.status !== 'cancelado').length
  const conversionTimes = programaciones
    .filter((item) => item.trip_id && item.created_at && item.assigned_at)
    .map((item) => (new Date(item.assigned_at).getTime() - new Date(item.created_at).getTime()) / MS_PER_HOUR)
  const avgConversionHours = conversionTimes.length ? conversionTimes.reduce((sum: number, value: number) => sum + value, 0) / conversionTimes.length : 0
  const overdueProgramaciones = programaciones.filter((item) => item.fecha_programacion && item.fecha_programacion < today && !item.trip_id).length
  const complianceRate = programaciones.length ? (programacionesCumplidas / programaciones.length) * 100 : 0

  const topTruck = trucksByUse[0]
  const opsToday = todayTrips.length + activeTrips.length

  const dateWindow = useMemo(() => buildDateWindow(KPI_DAYS_WINDOW), [])

  const operationalSeries = useMemo<TimeSeriesPoint[]>(() => (
    dateWindow.map((dateKey) => {
      const completed = trips.filter((trip) => trip.status === 'completado' && toDateKey(trip.completedAt ?? trip.date) === dateKey).length
      const scheduled = trips.filter((trip) => trip.status === 'programado' && toDateKey(trip.date) === dateKey).length
      return { dateKey, label: dateLabel(dateKey), completed, scheduled }
    })
  ), [dateWindow, trips])

  const fuelSeries = useMemo<TimeSeriesPoint[]>(() => (
    dateWindow.map((dateKey) => {
      const records = fuelRecords.filter((record) => toDateKey(record.recordedAt) === dateKey)
      return {
        dateKey,
        label: dateLabel(dateKey),
        liters: records.reduce((sum, record) => sum + (toNumber(record.gallonsDispensed) * LITERS_PER_GALLON), 0),
        cost: records.reduce((sum, record) => sum + toNumber(record.totalCostGtq), 0)
      }
    })
  ), [dateWindow, fuelRecords])

  const fleetSeries = useMemo<TimeSeriesPoint[]>(() => (
    dateWindow.map((dateKey) => {
      const dayTrips = trips.filter((trip) => toDateKey(trip.date ?? trip.startedAt ?? trip.completedAt) === dateKey)
      const uniqueTrucks = new Set(dayTrips.map((trip) => trip.truckId).filter(Boolean)).size
      const utilization = fleetState.length ? (uniqueTrucks / fleetState.length) * 100 : 0
      return { dateKey, label: dateLabel(dateKey), activeUnits: uniqueTrucks, utilization }
    })
  ), [dateWindow, trips, fleetState.length])

  const pilotsSeries = useMemo<TimeSeriesPoint[]>(() => (
    dateWindow.map((dateKey) => {
      const dayTrips = trips.filter((trip) => toDateKey(trip.date ?? trip.startedAt ?? trip.completedAt) === dateKey)
      const uniquePilots = new Set(dayTrips.map((trip) => trip.pilotId ?? trip.driver).filter(Boolean)).size
      const driveHours = dayTrips
        .filter((trip) => trip.startedAt && trip.completedAt)
        .reduce((sum, trip) => sum + ((new Date(trip.completedAt!).getTime() - new Date(trip.startedAt!).getTime()) / MS_PER_HOUR), 0)
      return { dateKey, label: dateLabel(dateKey), activePilots: uniquePilots, driveHours: Number(driveHours.toFixed(1)) }
    })
  ), [dateWindow, trips])

  const financialSeries = useMemo<TimeSeriesPoint[]>(() => (
    dateWindow.map((dateKey) => {
      const records = fuelRecords.filter((record) => toDateKey(record.recordedAt) === dateKey)
      const completed = trips.filter((trip) => trip.status === 'completado' && toDateKey(trip.completedAt ?? trip.date) === dateKey).length
      const fuelCostDay = records.reduce((sum, record) => sum + toNumber(record.totalCostGtq), 0)
      const avgCostPerTripDay = completed > 0 ? fuelCostDay / completed : 0
      return { dateKey, label: dateLabel(dateKey), fuelCostDay, avgCostPerTripDay: Number(avgCostPerTripDay.toFixed(2)) }
    })
  ), [dateWindow, fuelRecords, trips])

  const programacionSeries = useMemo<TimeSeriesPoint[]>(() => (
    dateWindow.map((dateKey) => {
      const created = programaciones.filter((item) => toDateKey(item.created_at ?? item.fecha_programacion) === dateKey).length
      const converted = programaciones.filter((item) => item.trip_id && toDateKey(item.assigned_at ?? item.updated_at ?? item.created_at) === dateKey).length
      return { dateKey, label: dateLabel(dateKey), created, converted }
    })
  ), [dateWindow, programaciones])

  const managementSeries = useMemo<TimeSeriesPoint[]>(() => (
    dateWindow.map((dateKey) => {
      const operations = trips.filter((trip) => toDateKey(trip.date ?? trip.startedAt ?? trip.completedAt) === dateKey).length
      const alerts = dashboard.alerts.filter((alert: any) => toDateKey(alert.createdAt ?? alert.created_at ?? alert.date) === dateKey).length
      return { dateKey, label: dateLabel(dateKey), operations, alerts }
    })
  ), [dateWindow, trips, dashboard.alerts])

  const widgets: KpiWidget[] = [
    {
      id: 'operativos',
      title: 'KPIs operativos',
      kind: 'line',
      data: operationalSeries,
      series: [
        { key: 'completed', label: 'Completados', color: '#3b82f6' },
        { key: 'scheduled', label: 'Programados', color: '#60a5fa' }
      ]
    },
    {
      id: 'combustible',
      title: 'KPIs de combustible',
      kind: 'bar',
      data: fuelSeries,
      series: [
        { key: 'liters', label: 'Litros', color: '#f59e0b' },
        { key: 'cost', label: 'Costo GTQ', color: '#ef4444' }
      ]
    },
    {
      id: 'flota',
      title: 'KPIs de flota',
      kind: 'line',
      data: fleetSeries,
      series: [
        { key: 'activeUnits', label: 'Unidades activas', color: '#06b6d4' },
        { key: 'utilization', label: 'Utilización %', color: '#3b82f6' }
      ]
    },
    {
      id: 'pilotos',
      title: 'KPIs de pilotos',
      kind: 'line',
      data: pilotsSeries,
      series: [
        { key: 'activePilots', label: 'Pilotos activos', color: '#22c55e' },
        { key: 'driveHours', label: 'Horas conducción', color: '#16a34a' }
      ]
    },
    {
      id: 'financieros',
      title: 'KPIs financieros',
      kind: 'bar',
      data: financialSeries,
      series: [
        { key: 'fuelCostDay', label: 'Costo combustible', color: '#a855f7' },
        { key: 'avgCostPerTripDay', label: 'Costo promedio/viaje', color: '#3b82f6' }
      ]
    },
    {
      id: 'programacion',
      title: 'KPIs de programación',
      kind: 'bar',
      data: programacionSeries,
      series: [
        { key: 'created', label: 'Programadas', color: '#f59e0b' },
        { key: 'converted', label: 'Convertidas', color: '#eab308' }
      ]
    },
    {
      id: 'gerencia',
      title: 'Gerencia · panel rápido',
      kind: 'line',
      data: managementSeries,
      series: [
        { key: 'operations', label: 'Operaciones', color: '#22c55e' },
        { key: 'alerts', label: 'Alertas', color: '#06b6d4' }
      ]
    }
  ]

  const handleLayoutChange = (nextLayout: LayoutItem[]) => {
    setLayout(normalizeLayout(nextLayout))
  }

  const resetLayout = () => setLayout(DEFAULT_LAYOUT)

  return (
    <section className="view-stack dashboard-view">
      <header className="view-header">
        <div>
          <h1>Dashboard operativo</h1>
          <p>Gerencia, operación, combustible, flota, pilotos y programación</p>
        </div>
        <div className="dashboard-toolbar">
          <button type="button" className="mini-btn" onClick={() => setEditMode((current) => !current)}>
            <GripVertical size={14} /> {editMode ? 'Bloquear tablero' : 'Editar tablero'}
          </button>
          <button type="button" className="mini-btn" onClick={resetLayout}>
            Restaurar diseño
          </button>
        </div>
      </header>

      <article className="dashboard-kpi-widget dashboard-kpi-widget--summary">
        <div className="dashboard-kpi-widget__head">
          <div className="dashboard-kpi-widget__titlewrap">
            <h2>Resumen operativo</h2>
          </div>
        </div>
        {renderWidgetChart({
          id: 'summary',
          title: 'Resumen operativo',
          kind: 'line',
          data: managementSeries,
          series: [
            { key: 'operations', label: 'Operaciones', color: '#2563eb' },
            { key: 'alerts', label: 'Alertas', color: '#f59e0b' }
          ]
        }, { compact: true })}
      </article>

      <div ref={gridContainerRef} className="dashboard-kpi-grid-wrap">
        <ResponsiveGridLayout
          className="dashboard-kpi-grid"
          width={gridWidth}
          layouts={{ lg: layout }}
          breakpoints={{ lg: 1200 }}
          cols={{ lg: 12 }}
          rowHeight={92}
          dragConfig={{ enabled: editMode, handle: '.dashboard-kpi-widget__drag', cancel: '.dashboard-kpi-chart, .recharts-wrapper, .recharts-surface' }}
          resizeConfig={{ enabled: editMode }}
          onLayoutChange={(currentLayout) => handleLayoutChange(currentLayout as LayoutItem[])}
        >
          {widgets.map((widget) => (
            <article key={widget.id} className="dashboard-kpi-widget">
              <div className="dashboard-kpi-widget__head">
                <div className="dashboard-kpi-widget__titlewrap">
                  <span className="dashboard-kpi-widget__drag" title="Arrastrar">
                    <GripVertical size={15} />
                  </span>
                  <h2>{widget.title}</h2>
                </div>
                <span className="dashboard-kpi-widget__state">{editMode ? 'Editable' : 'Vista'}</span>
              </div>
              {renderWidgetChart(widget)}
            </article>
          ))}
        </ResponsiveGridLayout>
      </div>

      <DashboardCharts costState={dashboard.costs} tripState={trips} />

      <section className="dashboard-grid">
        <article className="card">
          <h2>Top camiones por uso</h2>
          <table className="metric-table metric-table--bars">
            <tbody>
              {trucksByUse.slice(0, 5).map((item) => {
                const maxTrips = trucksByUse[0]?.trips || 1
                const width = (item.trips / maxTrips) * 100
                return (
                  <tr key={item.truck.id}>
                    <td>
                      <strong>{item.truck.plate}</strong>
                      <small>{item.truck.model}</small>
                    </td>
                    <td>
                      <div className="metric-bar">
                        <span style={{ width: `${width}%` }} />
                      </div>
                    </td>
                    <td className="metric-table__value">{item.trips}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </article>

        <article className="card">
          <h2>Combustible por camión</h2>
          <table className="metric-table metric-table--bars">
            <tbody>
              {fuelByTruck.slice(0, 5).map((item) => {
                const maxLiters = fuelByTruck[0]?.liters || 1
                const width = maxLiters > 0 ? (item.liters / maxLiters) * 100 : 0
                return (
                  <tr key={item.truck.id}>
                    <td>
                      <strong>{item.truck.plate}</strong>
                      <small>{item.liters.toFixed(0)} L · {formatMoney(item.cost)}</small>
                    </td>
                    <td>
                      <div className="metric-bar metric-bar--fuel">
                        <span style={{ width: `${width}%` }} />
                      </div>
                    </td>
                    <td className="metric-table__value">{item.gallons.toFixed(1)} gl</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </article>

        <article className="card">
          <h2>Alertas activas</h2>
          <table className="metric-table">
            <tbody>
              {dashboard.alerts.slice(0, 5).map((alert) => (
                <tr key={alert.id}>
                  <td>
                    <strong>{alert.title}</strong>
                    <small>{alert.detail}</small>
                  </td>
                  <td className="metric-table__value">{alert.level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="card">
          <h2>Licencias y control de pilotos</h2>
          <table className="metric-table">
            <tbody>
              {pilotStats.slice(0, 5).map(({ pilot, trips: pilotTrips, hours, incidents, daysLeft }) => (
                <tr key={pilot.id}>
                  <td>
                    <strong>{pilot.name}</strong>
                    <small>{daysLeft <= 30 ? `vence en ${daysLeft} días` : `vigente ${formatDays(daysLeft)}`}</small>
                  </td>
                  <td>
                    <div>{pilotTrips} viajes</div>
                    <small>{formatHours(hours)} · {incidents} incidencias</small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="card card-wide">
          <h2>Programaciones recientes</h2>
          <table className="metric-table metric-table--bars">
            <tbody>
              {programaciones.slice(0, 6).map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.codigo ?? item.id}</strong>
                    <small>{item.fecha_programacion ?? item.created_at?.slice(0, 10) ?? 'sin fecha'}</small>
                  </td>
                  <td>
                    <span className={`dashboard-status dashboard-status--${item.status}`}>{item.status}</span>
                  </td>
                  <td className="metric-table__value">{item.trip_id ? 'con viaje' : 'pendiente'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="card card-wide">
          <h2>Combustible vs MEM</h2>
          <table className="metric-table">
            <tbody>
              <tr>
                <td>
                  <strong>Precio MEM actual</strong>
                </td>
                <td className="metric-table__value">{memFuelPrice ? formatMoney(memFuelPrice) : 'N/D'}</td>
              </tr>
              <tr>
                <td>
                  <strong>Último precio cargado</strong>
                </td>
                <td className="metric-table__value">{latestFuelPrice ? formatMoney(latestFuelPrice) : 'N/D'}</td>
              </tr>
              <tr>
                <td>
                  <strong>Variación</strong>
                </td>
                <td className="metric-table__value">{memVariation === null ? 'N/D' : `${memVariation >= 0 ? '+' : ''}${memVariation.toFixed(1)}%`}</td>
              </tr>
              <tr>
                <td>
                  <strong>Consumo diario</strong>
                </td>
                <td className="metric-table__value">{fuelTodayLiters.toFixed(1)} L</td>
              </tr>
            </tbody>
          </table>
        </article>

        <article className="card card-wide">
          <h2>Flota y eficiencia por unidad</h2>
          <table className="metric-table metric-table--bars">
            <tbody>
              {fuelByTruck.slice(0, 5).map((item) => {
                const tripsCount = trips.filter((trip) => trip.truckId === item.truck.id).length
                const efficiency = item.gallons > 0 ? (trips.filter((trip) => trip.truckId === item.truck.id).reduce((sum, trip) => sum + toNumber(trip.actualDistanceKm ?? trip.distanceKm), 0) / item.gallons) : 0
                return (
                  <tr key={item.truck.id}>
                    <td>
                      <strong>{item.truck.plate}</strong>
                      <small>{tripsCount} viajes · {item.truck.status}</small>
                    </td>
                    <td className="metric-table__value">{efficiency > 0 ? `${efficiency.toFixed(2)} km/gal` : 'N/D'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </article>
      </section>
    </section>
  )
}
