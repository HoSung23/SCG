import { useEffect, useState } from 'react'
import { toast, Toaster } from 'sonner'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import { LoginScreen } from './components/LoginScreen'
import { HeroHeader } from './components/HeroHeader'
import {
  fleet,
  fuelSnapshots,
  roleMatrix,
  trips
} from './mockData'
import { tabLabelMap, roleModules } from './config/ui'
import { useSessionState } from './hooks/useSessionState'
import { useDashboardState } from './hooks/useDashboardState'
import { ViewRouter } from './views/ViewRouter'
import type { TabId } from './views/types'

const formatMoney = (value: number) =>
  new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
    maximumFractionDigits: 0
  }).format(value)

export function App() {
  // Session management
  const { session, isAuthenticated, login, logout } = useSessionState()

  // Dashboard state (using new hook)
  const dashboard = useDashboardState()

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState('Admin')

  // Additional local state for views not yet in dashboard hook
  const [isOfflineMode, setIsOfflineMode] = useState(false)
  const [selectedTripId, setSelectedTripId] = useState(trips[0]?.id ?? '')
  const [selectedFuelStation, setSelectedFuelStation] = useState(fuelSnapshots[0]?.station ?? 'Shell')
  const [newFuelPrice, setNewFuelPrice] = useState('')
  const [exportLog, setExportLog] = useState<string[]>([])
  const [syncQueue, setSyncQueue] = useState(3)

  useEffect(() => {
    if (session?.role && roleModules[session.role]) {
      setSelectedRole(session.role)
    }
  }, [session])

  // Show login if not authenticated
  if (!isAuthenticated || !session) {
    return (
      <>
        <LoginScreen onLoginSuccess={login} />
        <Toaster />
      </>
    )
  }

  const simulateExport = (reportName: string) => {
    const stamp = new Date().toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })
    setExportLog((currentLog) => [`${stamp} · ${reportName} exportado`, ...currentLog].slice(0, 8))
  }

  const runSyncQueue = () => {
    if (syncQueue <= 0) return
    setSyncQueue(0)
    toast.success('Sincronización completada')
  }

  const handleLogout = () => {
    logout()
    setSidebarOpen(false)
    toast('Sesión cerrada')
  }

  return (
    <div className="layout-shell">
      <Toaster position="bottom-right" richColors />
      <Sidebar
        activeTab={dashboard.activeTab as TabId}
        onTabChange={(tab) => dashboard.setActiveTab(tab as TabId)}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <div className="content-shell">
        <Topbar
          title={tabLabelMap[dashboard.activeTab as TabId]}
          onMenuClick={() => setSidebarOpen((previous) => !previous)}
          offlineMode={isOfflineMode}
          onToggleOffline={() => setIsOfflineMode((previous) => !previous)}
        />

        <HeroHeader
          displayName={session.displayName}
          role={session.role}
          fleetSize={fleet.length}
          isOfflineMode={isOfflineMode}
        />

        {dashboard.isLoading && <section className="card"><strong>Cargando datos reales...</strong></section>}
        <ViewRouter
          activeTab={dashboard.activeTab as TabId}
          dashboard={dashboard}
          formatMoney={formatMoney}
          fleetState={fleet}
          fuelState={fuelSnapshots}
          selectedTripId={selectedTripId}
          setSelectedTripId={setSelectedTripId}
          selectedFuelStation={selectedFuelStation}
          setSelectedFuelStation={setSelectedFuelStation}
          newFuelPrice={newFuelPrice}
          setNewFuelPrice={setNewFuelPrice}
          roleMatrix={roleMatrix}
          selectedRole={selectedRole}
          setSelectedRole={setSelectedRole}
          roleModules={roleModules}
          isOfflineMode={isOfflineMode}
          setIsOfflineMode={setIsOfflineMode}
          syncQueue={syncQueue}
          runSyncQueue={runSyncQueue}
          exportLog={exportLog}
          simulateExport={simulateExport}
        />
      </div>
      <div className={`sidebar-backdrop ${sidebarOpen ? 'sidebar-backdrop-visible' : ''}`} onClick={() => setSidebarOpen(false)} />
    </div>
  )
}
