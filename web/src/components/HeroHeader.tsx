interface HeroHeaderProps {
  displayName: string
  role: string
  fleetSize: number
  isOfflineMode: boolean
}

export function HeroHeader({ displayName, role, fleetSize, isOfflineMode }: HeroHeaderProps) {
  return (
    <section className="hero">
      <div>
        <h1>Sistema de Control de Gastos</h1>
        <p>Control operacional de flota, pilotos, viajes y costos.</p>
      </div>
      <div className="hero-status">
        <strong>Flota: {fleetSize} unidades</strong>
        <small>{displayName} · {role}</small>
        <small>{isOfflineMode ? 'Modo local activo' : 'Conectado al backend'}</small>
      </div>
    </section>
  )
}
