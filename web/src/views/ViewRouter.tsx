import { DashboardView } from './DashboardView'
import { FuelView } from './FuelView'
import { TripsView } from './TripsView'
import { CostsView } from './CostsView'
import { MaintenanceView } from './MaintenanceView'
import { FleetView } from './FleetView'
import { PilotsView } from './PilotsView'
import { HomePilotoView } from './HomePilotoView'
import { ClientesView } from './ClientesView'
import { MaterialesView } from './MaterialesView'
import { ProgramacionView } from './ProgramacionView'
import { RolesView } from './RolesView'
import { MobileView } from './MobileView'
import { DesktopView } from './DesktopView'
import { InfrastructureView } from './InfrastructureView'
import { ReportsView } from './ReportsView'
import type { RoleAccess, FuelSnapshot, Truck } from '../types'
import type { TabId, DashboardState, CurrencyFormatter } from './types'

type ViewRouterProps = {
  activeTab: TabId
  dashboard: DashboardState
  formatMoney: CurrencyFormatter
  fleetState: Truck[]
  fuelState: FuelSnapshot[]
  roleMatrix: RoleAccess[]
  selectedRole: string
  setSelectedRole: (value: string) => void
  roleModules: Record<string, string[]>
  isOfflineMode: boolean
  setIsOfflineMode: (next: boolean | ((previous: boolean) => boolean)) => void
  syncQueue: number
  runSyncQueue: () => void
  exportLog: string[]
  simulateExport: (reportName: string) => void
}

export function ViewRouter({
  activeTab,
  dashboard,
  formatMoney,
  fleetState,
  fuelState,
  roleMatrix,
  selectedRole,
  setSelectedRole,
  roleModules,
  isOfflineMode,
  setIsOfflineMode,
  syncQueue,
  runSyncQueue,
  exportLog,
  simulateExport
}: ViewRouterProps) {
  const sharedProps = {
    dashboard,
    formatMoney,
    fleetState,
    fuelState
  }

  switch (activeTab) {
    case 'dashboard':
      return <DashboardView {...sharedProps} />
    case 'programacion':
      return <ProgramacionView {...sharedProps} />
    case 'combustible':
      return <FuelView {...sharedProps} />
    case 'viajes':
      return <TripsView {...sharedProps} />
    case 'costos':
      return <CostsView {...sharedProps} />
    case 'mantenimiento':
      return <MaintenanceView {...sharedProps} />
    case 'flota':
      return <FleetView {...sharedProps} />
    case 'pilotos':
      return <PilotsView {...sharedProps} />
    case 'homepiloto':
      return <HomePilotoView {...sharedProps} />
    case 'clientes':
      return <ClientesView />
    case 'materiales':
      return <MaterialesView />
    case 'roles':
      return (
        <RolesView
          roleMatrix={roleMatrix}
          selectedRole={selectedRole}
          setSelectedRole={setSelectedRole}
          roleModules={roleModules}
        />
      )
    case 'mobile':
      return <MobileView dashboard={dashboard} />
    case 'desktop':
      return <DesktopView isOfflineMode={isOfflineMode} onToggleOffline={() => setIsOfflineMode((previous) => !previous)} />
    case 'infraestructura':
      return <InfrastructureView syncQueue={syncQueue} runSyncQueue={runSyncQueue} />
    case 'reportes':
      return <ReportsView exportLog={exportLog} simulateExport={simulateExport} />
    default:
      return <DashboardView {...sharedProps} />
  }
}
