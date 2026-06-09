import type { LucideIcon } from 'lucide-react'
import { Bell, Fuel, LayoutDashboard, Map, Settings, Truck, Users, Wrench, FileText, Route } from 'lucide-react'

type TabId =
  | 'dashboard'
  | 'combustible'
  | 'viajes'
  | 'costos'
  | 'mantenimiento'
  | 'flota'
  | 'pilotos'
  | 'roles'
  | 'mobile'
  | 'desktop'
  | 'infraestructura'
  | 'reportes'

const navigation: Array<{ id: TabId; label: string; icon: LucideIcon }> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'combustible', label: 'Combustible', icon: Fuel },
  { id: 'viajes', label: 'Viajes', icon: Route },
  { id: 'costos', label: 'Costos', icon: FileText },
  { id: 'mantenimiento', label: 'Mantenimiento', icon: Wrench },
  { id: 'flota', label: 'Flota', icon: Truck },
  { id: 'pilotos', label: 'Pilotos', icon: Users },
  { id: 'roles', label: 'Roles', icon: Bell },
  { id: 'mobile', label: 'Mobile', icon: Map },
  { id: 'desktop', label: 'Desktop', icon: Settings },
  { id: 'infraestructura', label: 'Infraestructura', icon: Map },
  { id: 'reportes', label: 'Reportes', icon: FileText }
]

export function Sidebar({
  activeTab,
  onTabChange,
  open,
  onClose
}: {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  open: boolean
  onClose?: () => void
}) {
  return (
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="sidebar-brand">
        <div className="sidebar-logo">SCG</div>
        <div>
          <strong>Sistema de Control</strong>
          <p>Transporte pesado GT</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navigation.map((item) => {
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
    </aside>
  )
}
