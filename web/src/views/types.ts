import type { RoleAccess, FuelSnapshot, Truck } from '../types'
import type { useDashboardState } from '../hooks/useDashboardState'

export type TabId =
  | 'dashboard'
  | 'programacion'
  | 'combustible'
  | 'viajes'
  | 'costos'
  | 'mantenimiento'
  | 'flota'
  | 'pilotos'
  | 'homepiloto'
  | 'clientes'
  | 'materiales'
  | 'roles'
  | 'mobile'
  | 'desktop'
  | 'infraestructura'
  | 'reportes'

export type DashboardState = ReturnType<typeof useDashboardState>

export type CurrencyFormatter = (value: number) => string

export type SharedViewProps = {
  dashboard: DashboardState
  formatMoney: CurrencyFormatter
  fleetState: Truck[]
  fuelState: FuelSnapshot[]
}

export type RolesViewProps = {
  roleMatrix: RoleAccess[]
  selectedRole: string
  setSelectedRole: (value: string) => void
  roleModules: Record<string, string[]>
}
