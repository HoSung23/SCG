export type Truck = {
  id: string
  plate: string
  model: string
  year?: number
  fuelKmPerGallon: number
  status: 'active' | 'maintenance' | 'idle' | 'retired'
  ownershipType?: string
  gpsDeviceId?: string
  lastGpsUpdate?: string
}

export type Pilot = {
  id: string
  name: string
  licenseType: string
  licenseNumber?: string
  licenseDue: string
  licenseStatus?: string
  assignedTruckId: string
  status?: string
  phoneNumber?: string
  email?: string
}

export type Client = {
  id: string
  name: string
  nit?: string
  contactName?: string
  phone?: string
  email?: string
  address?: string
  status: 'active' | 'inactive'
  createdAt?: string
}

export type Material = {
  id: string
  name: string
  unit: string
  description?: string
  active: boolean
  createdAt?: string
}

export type Trip = {
  id: string
  origin: string
  destination: string
  driver: string
  pilotId?: string
  truckId: string
  distanceKm: number
  status: 'programado' | 'en-ruta' | 'completado'
  date: string
  startedAt?: string
  completedAt?: string
  fuelConsumptionGallons?: number
  costGtq?: number
  actualDistanceKm?: number
  estimatedTimeHours?: number
}

export type FuelRecord = {
  id: string
  truckId: string
  station: string
  dieselPriceGtq: number
  gallonsDispensed: number
  totalCostGtq: number
  meterKm?: number
  recordedAt: string
  notes?: string
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
  relatedTripId?: string
  relatedPilotId?: string
  relatedTruckId?: string
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
