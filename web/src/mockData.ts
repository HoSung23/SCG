import type {
  AlertItem,
  CostSummary,
  FuelSnapshot,
  MaintenanceTask,
  ModuleSummary,
  Pilot,
  RoleAccess,
  RouteTimeline,
  Trip,
  Truck
} from './types'

export const fleet: Truck[] = [
  { id: 't1', plate: 'C-123BCD', model: 'Freightliner Cascadia', fuelKmPerGallon: 8.5, status: 'active' },
  { id: 't2', plate: 'C-456EFG', model: 'Kenworth T680', fuelKmPerGallon: 7.9, status: 'maintenance' },
  { id: 't3', plate: 'C-789HIJ', model: 'International LT', fuelKmPerGallon: 8.1, status: 'active' }
]

export const pilots: Pilot[] = [
  {
    id: 'p1',
    name: 'Carlos Pérez',
    licenseType: 'A',
    licenseDue: '2027-03-12',
    assignedTruckId: 't1'
  },
  {
    id: 'p2',
    name: 'María López',
    licenseType: 'A',
    licenseDue: '2026-11-20',
    assignedTruckId: 't3'
  },
  {
    id: 'p3',
    name: 'José Martínez',
    licenseType: 'B',
    licenseDue: '2026-09-05',
    assignedTruckId: 't2'
  }
]

export const trips: Trip[] = [
  { id: 'v1', origin: 'Ciudad de Guatemala', destination: 'Puerto Quetzal', driver: 'Carlos Pérez', truckId: 't1', distanceKm: 120, status: 'en-ruta', date: '2026-06-08' },
  { id: 'v2', origin: 'Escuintla', destination: 'Quetzaltenango', driver: 'María López', truckId: 't3', distanceKm: 210, status: 'programado', date: '2026-06-08' },
  { id: 'v3', origin: 'Amatitlán', destination: 'Petén', driver: 'José Martínez', truckId: 't1', distanceKm: 460, status: 'completado', date: '2026-06-07' }
]

export const monthlyCosts: CostSummary = {
  fuel: 82500,
  maintenance: 28700,
  payroll: 51000,
  admin: 9400
}

export const roleMatrix: RoleAccess[] = [
  { role: 'Superadmin', access: 'Todo el sistema' },
  { role: 'Admin', access: 'Operaciones, costos, reportes' },
  { role: 'Gerente', access: 'Dashboard y reportes (solo lectura costos)' },
  { role: 'Piloto', access: 'App móvil: viaje, ubicación, evidencias' },
  { role: 'Contador', access: 'Costos, planilla y exportaciones' }
]

export const knownFuelStations = ['Shell', 'UNO', 'Puma']
export const highestFuelPriceGTQ = 37.4

export const fuelSnapshots: FuelSnapshot[] = [
  { station: 'Shell', dieselGtq: 36.9, date: '2026-06-06' },
  { station: 'UNO', dieselGtq: 37.4, date: '2026-06-06' },
  { station: 'Puma', dieselGtq: 36.7, date: '2026-06-06' }
]

export const alerts: AlertItem[] = [
  {
    id: 'a1',
    level: 'critical',
    title: 'Camión C-456EFG sin conectividad',
    detail: 'Último ping hace 41 minutos. Activar protocolo offline del piloto.'
  },
  {
    id: 'a2',
    level: 'warning',
    title: 'Precio diesel superior al umbral',
    detail: 'El precio máximo subió 2.4% respecto a la semana anterior.'
  },
  {
    id: 'a3',
    level: 'info',
    title: 'Migración Excel lista para lote 01',
    detail: '3,280 registros históricos validados para carga inicial.'
  }
]

export const maintenanceQueue: MaintenanceTask[] = [
  {
    id: 'm1',
    truckPlate: 'C-123BCD',
    type: 'preventivo',
    dueInKm: 850,
    estimatedCost: 5400,
    status: 'pendiente'
  },
  {
    id: 'm2',
    truckPlate: 'C-456EFG',
    type: 'correctivo',
    dueInKm: 0,
    estimatedCost: 9700,
    status: 'en-proceso'
  },
  {
    id: 'm3',
    truckPlate: 'C-789HIJ',
    type: 'preventivo',
    dueInKm: 1250,
    estimatedCost: 4300,
    status: 'pendiente'
  }
]

export const routeTimeline: RouteTimeline[] = [
  {
    id: 'r1',
    checkpoint: 'Salida - Ciudad de Guatemala',
    timestamp: '08:10',
    state: 'ok'
  },
  {
    id: 'r2',
    checkpoint: 'Control Escuintla',
    timestamp: '09:35',
    state: 'ok'
  },
  {
    id: 'r3',
    checkpoint: 'Tramo CA-9 Sur',
    timestamp: '10:22',
    state: 'delay'
  },
  {
    id: 'r4',
    checkpoint: 'Puerto Quetzal',
    timestamp: '11:02',
    state: 'offline'
  }
]

export const moduleSummary: ModuleSummary[] = [
  {
    id: 'ms1',
    title: 'Dashboard Principal',
    status: 'base',
    summary: 'KPIs y estado operativo en tiempo real (demo).'
  },
  {
    id: 'ms2',
    title: 'Combustible',
    status: 'base',
    summary: 'Radar de precios con regla de precio máximo.'
  },
  {
    id: 'ms3',
    title: 'Mantenimiento',
    status: 'base',
    summary: 'Cola de mantenimientos preventivos/correctivos.'
  },
  {
    id: 'ms4',
    title: 'Costos Generales',
    status: 'base',
    summary: 'Combustible, planilla, mantenimiento y administración.'
  },
  {
    id: 'ms5',
    title: 'Viajes',
    status: 'base',
    summary: 'Registro de viajes y estados operativos.'
  },
  {
    id: 'ms6',
    title: 'Pilotos y Camiones',
    status: 'base',
    summary: 'Asignación piloto-unidad y licencias.'
  },
  {
    id: 'ms7',
    title: 'Permisos y Roles',
    status: 'base',
    summary: 'Matriz de acceso para operación y auditoría.'
  },
  {
    id: 'ms8',
    title: 'App Móvil Pilotos',
    status: 'in-progress',
    summary: 'Flujo base: iniciar/finalizar viaje e incidencias.'
  },
  {
    id: 'ms9',
    title: 'Desktop Oficina',
    status: 'in-progress',
    summary: 'Electron activo para operación en oficina.'
  }
]
