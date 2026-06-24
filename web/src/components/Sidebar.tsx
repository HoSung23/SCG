import type { LucideIcon } from 'lucide-react'
import { Bell, Calendar, Fuel, LayoutDashboard, Map, Settings, Truck, Users, UserCheck, Wrench, FileText, Route, Building2, Package } from 'lucide-react'

type TabId =
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

const navigation: Array<{ id: TabId; label: string; icon: LucideIcon }> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'programacion', label: 'Programación', icon: Calendar },
  { id: 'combustible', label: 'Combustible', icon: Fuel },
  { id: 'viajes', label: 'Viajes', icon: Route },
  { id: 'costos', label: 'Costos', icon: FileText },
  { id: 'mantenimiento', label: 'Mantenimiento', icon: Wrench },
  { id: 'flota', label: 'Flota', icon: Truck },
  { id: 'pilotos', label: 'Pilotos', icon: Users },
  { id: 'homepiloto', label: 'Home Piloto', icon: UserCheck },
  { id: 'clientes', label: 'Clientes', icon: Building2 },
  { id: 'materiales', label: 'Materiales', icon: Package },
  { id: 'roles', label: 'Roles', icon: Bell },
  { id: 'mobile', label: 'Mobile', icon: Map },
  { id: 'desktop', label: 'Desktop', icon: Settings },
  { id: 'infraestructura', label: 'Infraestructura', icon: Map },
  { id: 'reportes', label: 'Reportes', icon: FileText }
]

const primaryModules: TabId[] = ['dashboard', 'programacion', 'flota', 'pilotos', 'homepiloto', 'clientes', 'materiales', 'viajes', 'costos']

export function Sidebar({
  activeTab,
  onTabChange,
  open,
  onClose,
  onLogout
}: {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  open: boolean
  onClose?: () => void
  onLogout: () => void
}) {
  const primaryNavigation = navigation.filter((item) => primaryModules.includes(item.id))
  const supportNavigation = navigation.filter((item) => !primaryModules.includes(item.id))

  return (
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="sidebar-brand">
        <div className="sidebar-logo">SCG</div>
        <div>
          <strong>Sistema de Control</strong>
          <p>Transporte pesado GT</p>
        </div>
      </div>

      <div className="sidebar-section-title">Módulos principales</div>
      <nav className="sidebar-nav">
        {primaryNavigation.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              className={`sidebar-link ${activeTab === item.id ? 'sidebar-link-active' : ''}`}
              onClick={() => {
                onTabChange(item.id)
                onClose?.()
              }}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              <small className="sidebar-pill">Activo</small>
            </button>
          )
        })}
      </nav>

      <div className="sidebar-section-title">Operación y configuración</div>
      <nav className="sidebar-nav">
        {supportNavigation.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              className={`sidebar-link ${activeTab === item.id ? 'sidebar-link-active' : ''}`}
              onClick={() => {
                onTabChange(item.id)
                onClose?.()
              }}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="sidebar-profile">
        <div className="sidebar-avatar">AG</div>
        <div>
          <strong>Admin SCG</strong>
          <p>superadmin</p>
        </div>
      </div>

      <div style={{ padding: '0 1rem 1rem' }}>
        <button
          type="button"
          className="mini-btn"
          onClick={() => {
            onLogout()
            onClose?.()
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
