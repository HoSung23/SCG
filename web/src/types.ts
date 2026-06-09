export type Truck = {
  id: string
  plate: string
  model: string
  fuelKmPerGallon: number
  status: 'active' | 'maintenance' | 'idle'
}

export type Pilot = {
  id: string
  name: string
  licenseType: string
  licenseDue: string
  assignedTruckId: string
}

export type Trip = {
  id: string
  origin: string
  destination: string
  driver: string
  truckId: string
  distanceKm: number
  status: 'programado' | 'en-ruta' | 'completado'
  date: string
}

export type CostSummary = {
  fuel: number
  maintenance: number
  payroll: number
  admin: number
}

export type RoleAccess = {
  role: string
  access: string
}

export type AlertItem = {
  id: string
  level: 'critical' | 'warning' | 'info'
  title: string
  detail: string
}

export type MaintenanceTask = {
  id: string
  truckPlate: string
  type: 'preventivo' | 'correctivo' | 'emergencia'
  dueInKm: number
  estimatedCost: number
  status: 'pendiente' | 'en-proceso' | 'completado'
}

export type FuelSnapshot = {
  station: string
  dieselGtq: number
  date: string
}

export type RouteTimeline = {
  id: string
  checkpoint: string
  timestamp: string
  state: 'ok' | 'delay' | 'offline'
}

export type ModuleSummary = {
  id: string
  title: string
  status: 'base' | 'in-progress' | 'next'
  summary: string
}
