import { Menu, Search } from 'lucide-react'

export function Topbar({
  title,
  onMenuClick,
  offlineMode,
  onToggleOffline
}: {
  title: string
  onMenuClick: () => void
  offlineMode: boolean
  onToggleOffline: () => void
}) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button type="button" className="topbar-menu" onClick={onMenuClick} aria-label="Abrir navegación">
          <Menu size={18} />
        </button>
        <div>
          <p className="topbar-kicker">SCG Transporte GT</p>
          <h1>{title}</h1>
        </div>
      </div>

      <div className="topbar-actions">
        <label className="topbar-search">
          <Search size={16} />
          <input type="search" placeholder="Buscar camiones, viajes, pilotos..." />
        </label>
        <button type="button" className="topbar-chip" onClick={onToggleOffline}>
          {offlineMode ? 'Offline activo' : 'Online'}
        </button>
      </div>
    </header>
  )
}
