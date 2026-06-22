type InfrastructureViewProps = {
  syncQueue: number
  runSyncQueue: () => void
}

export function InfrastructureView({ syncQueue, runSyncQueue }: InfrastructureViewProps) {
  return (
    <section className="two-col">
      <article className="card">
        <h2>Infraestructura</h2>
        <ul>
          <li>Supabase PostgreSQL: activo</li>
          <li>Realtime tracking: activo</li>
          <li>Backups diarios: habilitado</li>
          <li>RLS por rol: habilitado</li>
        </ul>
      </article>

      <article className="card">
        <h2>Sincronización</h2>
        <p>Cola: {syncQueue} eventos</p>
        <button type="button" className="action-btn" onClick={runSyncQueue}>Sincronizar</button>
      </article>
    </section>
  )
}
