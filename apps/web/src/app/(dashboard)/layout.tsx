import type { ReactNode } from 'react'

const navigation = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Flota', href: '/dashboard/flota' },
  { label: 'Pilotos', href: '/dashboard/pilotos' },
  { label: 'Viajes', href: '/dashboard/viajes' },
  { label: 'Costos - Combustible', href: '/dashboard/costos/combustible' },
  { label: 'Costos - Mantenimiento', href: '/dashboard/costos/mantenimiento' },
  { label: 'Costos - Generales', href: '/dashboard/costos/generales' },
  { label: 'Reportes', href: '/dashboard/reportes' },
  { label: 'Configuración', href: '/dashboard/configuracion' }
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', minHeight: '100vh' }}>
      <aside style={{ padding: 24, borderRight: '1px solid #e2e8f0', background: '#0f172a', color: '#e2e8f0' }}>
        <h2 style={{ marginTop: 0 }}>SCG Transporte GT</h2>
        <p style={{ color: '#94a3b8' }}>Operación de flota y costos</p>
        <nav style={{ display: 'grid', gap: 8, marginTop: 24 }}>
          {navigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              style={{
                padding: '10px 12px',
                borderRadius: 8,
                background: '#1e293b',
                color: '#e2e8f0'
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </aside>
      <section>
        <header style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', background: '#ffffff' }}>
          <strong>SCG</strong>
        </header>
        <main style={{ padding: 24, background: '#f8fafc', minHeight: 'calc(100vh - 64px)' }}>{children}</main>
      </section>
    </div>
  )
}
