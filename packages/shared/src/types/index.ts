export type UserRole = 'superadmin' | 'admin' | 'gerente' | 'contador' | 'piloto'
export type TruckStatus = 'activo' | 'mantenimiento' | 'inactivo'
export type TripStatus = 'programado' | 'en_ruta' | 'completado' | 'cancelado'
export type FuelStation = 'Shell' | 'UNO' | 'Puma' | 'Otro'
export type FuelType = 'diesel' | 'regular' | 'super'
export type MaintenanceType = 'preventivo' | 'correctivo' | 'emergencia'
export type CostCategory = 'planilla' | 'seguro' | 'permiso' | 'viatico' | 'administrativo' | 'combustible_directo' | 'otro'

export interface AppUser {
  id: string
  name: string
  email: string
  role: UserRole
  phone?: string
  avatarUrl?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Truck {
  id: string
  plate: string
  brand: string
  model: string
  year: number
  capacityTons: number
  fuelEfficiency: number
  status: TruckStatus
  currentDriverId?: string | null
  mileage: number
  lastMaintenanceDate?: string | null
  nextMaintenanceMileage?: number | null
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export interface Driver {
  id: string
  licenseNumber: string
  licenseExpiry: string
  licenseType: string
  truckId?: string | null
  emergencyContact?: string | null
  emergencyPhone?: string | null
}

export interface FuelPrice {
  id: string
  station: FuelStation
  fuelType: FuelType
  pricePerGallon: number
  priceDate: string
  sourceUrl?: string | null
  isActive: boolean
  createdAt: string
}

export interface Trip {
  id: string
  truckId: string
  driverId: string
  origin: string
  destination: string
  cargoDescription?: string | null
  cargoWeightTons?: number | null
  status: TripStatus
  scheduledStart?: string | null
  actualStart?: string | null
  actualEnd?: string | null
  distanceKm?: number | null
  fuelCost?: number | null
  tollCost?: number | null
  otherCost?: number | null
  totalCost?: number | null
  startPhotoUrl?: string | null
  endPhotoUrl?: string | null
  notes?: string | null
  createdAt: string
  updatedAt: string
}
