type BadgeVariant = 'truck' | 'trip' | 'maintenance' | 'alert' | 'generic'

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  active: { label: 'Activo', bg: '#d1fae5', color: '#065f46' },
  maintenance: { label: 'Mantenimiento', bg: '#fef3c7', color: '#92400e' },
  idle: { label: 'Inactivo', bg: '#f3f4f6', color: '#374151' },
  'programado': { label: 'Programado', bg: '#dbeafe', color: '#1e40af' },
  'en-ruta': { label: 'En ruta', bg: '#d1fae5', color: '#065f46' },
  'completado': { label: 'Completado', bg: '#f3f4f6', color: '#374151' },
  'cancelado': { label: 'Cancelado', bg: '#fee2e2', color: '#991b1b' },
  critical: { label: 'Crítica', bg: '#fee2e2', color: '#991b1b' },
  warning: { label: 'Advertencia', bg: '#fef3c7', color: '#92400e' },
  info: { label: 'Información', bg: '#dbeafe', color: '#1e40af' },
  'pendiente': { label: 'Pendiente', bg: '#fef3c7', color: '#92400e' },
  'en-proceso': { label: 'En proceso', bg: '#dbeafe', color: '#1e40af' }
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
