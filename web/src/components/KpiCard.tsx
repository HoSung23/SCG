import type { ReactNode } from 'react'

type KpiCardProps = {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  accent?: boolean
  className?: string
}

export function KpiCard({ title, value, subtitle, icon, accent = false, className = '' }: KpiCardProps) {
  return (
    <article
      className={`kpi-card ${accent ? 'kpi-card-accent' : ''} ${className}`.trim()}
      style={{
        background: accent ? 'linear-gradient(135deg, #1d4ed8, #0f172a)' : '#111827',
        border: accent ? '1px solid #3b82f6' : '1px solid #2b3548'
      }}
    >
      <div className="kpi-card-head">
        <p className="kpi-card-title">{title}</p>
        {icon}
      </div>
      <p className="kpi-card-value">{value}</p>
      {subtitle && <p className="kpi-card-subtitle">{subtitle}</p>}
    </article>
  )
}
