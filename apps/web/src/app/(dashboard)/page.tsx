const kpis = [
  { label: 'Viajes activos', value: '12' },
  { label: 'Camiones en ruta', value: '8 / 25' },
  { label: 'Costo mensual', value: 'Q 184,500' },
  { label: 'Combustible mes', value: 'Q 82,500' },
  { label: 'Mantenimiento mes', value: 'Q 28,700' },
  { label: 'Alertas críticas', value: '3' }
]

export default function DashboardPage() {
  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {kpis.map((kpi) => (
          <article key={kpi.label} style={{ background: '#fff', padding: 20, borderRadius: 16, border: '1px solid #e2e8f0' }}>
            <p style={{ margin: 0, color: '#64748b' }}>{kpi.label}</p>
            <h2 style={{ margin: '8px 0 0' }}>{kpi.value}</h2>
          </article>
        ))}
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        <article style={{ background: '#fff', padding: 20, borderRadius: 16, border: '1px solid #e2e8f0' }}>
          <h3>Mapa en tiempo real</h3>
          <p>Marcadores por camión, estados y ruta activa.</p>
        </article>
        <article style={{ background: '#fff', padding: 20, borderRadius: 16, border: '1px solid #e2e8f0' }}>
          <h3>Alertas operativas</h3>
          <p>Licencias, mantenimientos e incidencias sin resolver.</p>
        </article>
      </section>
    </div>
  )
}
