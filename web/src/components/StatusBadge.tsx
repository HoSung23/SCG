type BadgeVariant = 'truck' | 'trip' | 'maintenance' | 'alert' | 'generic'

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  active: { label: 'Activo', bg: 'rgba(34,197,94,0.12)', color: '#86efac' },
  inactive: { label: 'Inactivo', bg: 'rgba(148,163,184,0.1)', color: '#94a3b8' },
  maintenance: { label: 'Mantenimiento', bg: 'rgba(245,158,11,0.12)', color: '#fcd34d' },
  idle: { label: 'Inactivo', bg: 'rgba(148,163,184,0.1)', color: '#94a3b8' },
  retired: { label: 'Retirado', bg: 'rgba(239,68,68,0.08)', color: '#f87171' },
  'programado': { label: 'Programado', bg: 'rgba(59,130,246,0.12)', color: '#93c5fd' },
  'en-ruta': { label: 'En ruta', bg: 'rgba(34,197,94,0.12)', color: '#86efac' },
  'completado': { label: 'Completado', bg: 'rgba(148,163,184,0.1)', color: '#94a3b8' },
  'cancelado': { label: 'Cancelado', bg: 'rgba(239,68,68,0.1)', color: '#f87171' },
  critical: { label: 'Crítica', bg: 'rgba(239,68,68,0.1)', color: '#f87171' },
  warning: { label: 'Advertencia', bg: 'rgba(245,158,11,0.12)', color: '#fcd34d' },
  info: { label: 'Información', bg: 'rgba(59,130,246,0.12)', color: '#93c5fd' },
  'pendiente': { label: 'Pendiente', bg: 'rgba(245,158,11,0.12)', color: '#fcd34d' },
  'en-proceso': { label: 'En proceso', bg: 'rgba(59,130,246,0.12)', color: '#93c5fd' },
  'on_leave': { label: 'Permiso', bg: 'rgba(167,139,250,0.12)', color: '#c4b5fd' },
  'valid': { label: 'Vigente', bg: 'rgba(34,197,94,0.12)', color: '#86efac' },
  'expired': { label: 'Vencida', bg: 'rgba(239,68,68,0.1)', color: '#f87171' },
  'about_to_expire': { label: 'Por vencer', bg: 'rgba(245,158,11,0.12)', color: '#fcd34d' }
}

export function StatusBadge({ status, variant = 'generic' }: { status: string; variant?: BadgeVariant }) {
  const config = statusConfig[status] ?? { label: status, bg: '#f3f4f6', color: '#374151' }

  return (
    <span
      data-variant={variant}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: config.bg,
        color: config.color,
        border: `1px solid ${config.color}33`,
        padding: '3px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        lineHeight: 1
      }}
    >
      {config.label}
    </span>
  )
}
