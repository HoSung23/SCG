import { apiClient } from './api'
import { alerts as mockAlerts, fuelSnapshots as mockFuelSnapshots, monthlyCosts as mockMonthlyCosts, maintenanceQueue as mockMaintenanceQueue, routeTimeline as mockRouteTimeline } from '../mockData'
import type { AlertItem, CostSummary, FuelSnapshot, MaintenanceTask, Pilot, RouteTimeline, Trip, Truck } from '../types'

type BackendTruck = {
  id: string
  plate: string
  model: string
  year: number
  fuel_km_per_gallon: number
  status: 'active' | 'maintenance' | 'idle' | 'retired'
}

type BackendPilot = {
  id: string
  name: string
  license_type: string
  license_due: string
  assigned_truck_id?: string | null
}

type BackendTrip = {
  id: string
  truck_id: string
  pilot_id: string
  origin: string
  destination: string
  distance_km: number
  status: 'programado' | 'en-ruta' | 'completado' | 'cancelado'
  created_at?: string
}

type BackendMaintenanceTask = {
  id: string
  truck_id: string
  type: 'preventivo' | 'correctivo' | 'emergencia'
  description: string
  due_in_km?: number | null
  estimated_cost_gtq?: number | null
  status: 'programado' | 'en-progreso' | 'completado' | 'cancelado'
}

type BackendFuelRecord = {
  id: string
  station: string
  diesel_price_gtq: number
  recorded_at: string
}

type BackendCostRecord = {
  id: string
  category: 'combustible' | 'mantenimiento' | 'salarios' | 'seguros' | 'tolls' | 'otro'
  amount_gtq: number
}

type BackendAlert = {
  id: string
  level: 'critical' | 'warning' | 'info'
  title: string
  detail: string
}

export type DashboardData = {
  fleet: Truck[]
  pilots: Pilot[]
  trips: Trip[]
  maintenanceQueue: MaintenanceTask[]
  fuelSnapshots: FuelSnapshot[]
  monthlyCosts: CostSummary
  alerts: AlertItem[]
  routeTimeline: RouteTimeline[]
}

const mapTruck = (truck: BackendTruck): Truck => ({
  id: truck.id,
  plate: truck.plate,
  model: truck.model,
  fuelKmPerGallon: truck.fuel_km_per_gallon,
  status: truck.status === 'retired' ? 'idle' : truck.status
})

const mapPilot = (pilot: BackendPilot): Pilot => ({
  id: pilot.id,
  name: pilot.name,
  licenseType: pilot.license_type,
  licenseDue: pilot.license_due,
  assignedTruckId: pilot.assigned_truck_id ?? ''
})

const mapTrip = (trip: BackendTrip, pilotName: string): Trip => ({
  id: trip.id,
  origin: trip.origin,
  destination: trip.destination,
  driver: pilotName,
  truckId: trip.truck_id,
  distanceKm: Number(trip.distance_km),
  status: trip.status === 'cancelado' ? 'programado' : trip.status,
  date: trip.created_at ? trip.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10)
})

const mapMaintenance = (task: BackendMaintenanceTask, truckPlate: string): MaintenanceTask => ({
  id: task.id,
  truckPlate,
  type: task.type,
  dueInKm: task.due_in_km ?? 0,
  estimatedCost: Number(task.estimated_cost_gtq ?? 0),
  status: task.status === 'programado' ? 'pendiente' : task.status === 'en-progreso' ? 'en-proceso' : 'completado'
})

const mapFuelSnapshots = (records: BackendFuelRecord[]): FuelSnapshot[] => {
  const byStation = new Map<string, BackendFuelRecord>()
  for (const record of records) {
    const previous = byStation.get(record.station)
    if (!previous || new Date(record.recorded_at).getTime() > new Date(previous.recorded_at).getTime()) {
      byStation.set(record.station, record)
    }
  }

  return Array.from(byStation.values()).map((record) => ({
    station: record.station,
    dieselGtq: Number(record.diesel_price_gtq),
    date: record.recorded_at.slice(0, 10)
  }))
}

const mapCostSummary = (records: BackendCostRecord[]): CostSummary => {
  const grouped: CostSummary = { fuel: 0, maintenance: 0, payroll: 0, admin: 0 }

  for (const record of records) {
    const value = Number(record.amount_gtq)
    if (record.category === 'combustible') {
      grouped.fuel += value
    } else if (record.category === 'mantenimiento') {
      grouped.maintenance += value
    } else if (record.category === 'salarios') {
      grouped.payroll += value
    } else {
      grouped.admin += value
    }
  }

  return grouped
}

const mapAlerts = (items: BackendAlert[]): AlertItem[] =>
  items.map((item) => ({
    id: item.id,
    level: item.level,
    title: item.title,
    detail: item.detail
  }))

export async function loadDashboardData(): Promise<DashboardData> {
  const [trucks, pilots, trips, maintenanceTasks, fuelRecords, costRecords, alerts] = await Promise.all([
    apiClient.getTrucks(),
    apiClient.getPilots(),
    apiClient.getTrips(),
    apiClient.getMaintenanceTasks(),
    apiClient.getFuelRecords(),
    apiClient.getCostRecords(),
    apiClient.getAlerts()
  ])

  const truckMap = new Map<string, BackendTruck>((trucks as BackendTruck[]).map((truck) => [truck.id, truck]))
  const pilotMap = new Map<string, BackendPilot>((pilots as BackendPilot[]).map((pilot) => [pilot.id, pilot]))

  const mappedFleet = (trucks as BackendTruck[]).map(mapTruck)
  const mappedPilots = (pilots as BackendPilot[]).map(mapPilot)
  const mappedTrips = (trips as BackendTrip[]).map((trip) => mapTrip(trip, pilotMap.get(trip.pilot_id)?.name ?? 'Sin piloto'))
  const mappedMaintenance = (maintenanceTasks as BackendMaintenanceTask[]).map((task) =>
    mapMaintenance(task, truckMap.get(task.truck_id)?.plate ?? 'Sin placa')
  )

  const mappedFuelSnapshots = mapFuelSnapshots(fuelRecords as BackendFuelRecord[])
  const mappedCosts = mapCostSummary(costRecords as BackendCostRecord[])
  const mappedAlerts = mapAlerts((alerts as BackendAlert[]).slice(0, 6))

  return {
    fleet: mappedFleet.length > 0 ? mappedFleet : [],
    pilots: mappedPilots.length > 0 ? mappedPilots : [],
    trips: mappedTrips.length > 0 ? mappedTrips : [],
    maintenanceQueue: mappedMaintenance.length > 0 ? mappedMaintenance : mockMaintenanceQueue,
    fuelSnapshots: mappedFuelSnapshots.length > 0 ? mappedFuelSnapshots : mockFuelSnapshots,
    monthlyCosts: mappedCosts.fuel + mappedCosts.maintenance + mappedCosts.payroll + mappedCosts.admin > 0 ? mappedCosts : mockMonthlyCosts,
    alerts: mappedAlerts.length > 0 ? mappedAlerts : mockAlerts,
    routeTimeline: mockRouteTimeline
  }
}
