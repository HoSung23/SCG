import { useState } from 'react'
import { sileo } from 'sileo'
import { Plus, Pencil, X, AlertTriangle } from 'lucide-react'
import { StatusBadge } from '../components/StatusBadge'
import { apiClient } from '../services/api'
import type { SharedViewProps } from './types'
import type { Pilot } from '../types'

type LicenseAlert = { pilotId: string; name: string; daysLeft: number; level: 'vencida' | 'critica' | 'advertencia' | 'aviso' }

function getLicenseAlerts(pilots: Pilot[]): LicenseAlert[] {
  const today = new Date()
  return pilots
    .map(p => {
      const due = new Date(p.licenseDue)
      const daysLeft = Math.floor((due.getTime() - today.getTime()) / 86_400_000)
      if (daysLeft > 30) return null
      const level = daysLeft < 0 ? 'vencida' : daysLeft <= 7 ? 'critica' : daysLeft <= 15 ? 'advertencia' : 'aviso'
      return { pilotId: p.id, name: p.name, daysLeft, level }
    })
    .filter((a): a is LicenseAlert => a !== null)
}

const ALERT_COLORS: Record<string, string> = {
  vencida: '#fee2e2', critica: '#fef3c7', advertencia: '#fef9c3', aviso: '#dbeafe'
}
const ALERT_TEXT: Record<string, string> = {
  vencida: '#991b1b', critica: '#92400e', advertencia: '#854d0e', aviso: '#1e40af'
}

const EMPTY_FORM = { name: '', licenseType: 'C', licenseNumber: '', licenseDue: '', phoneNumber: '', email: '' }

export function PilotsView({ dashboard, fleetState }: SharedViewProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingPilot, setEditingPilot] = useState<Pilot | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const licenseAlerts = getLicenseAlerts(dashboard.pilots)

  const validate = () => {
    const next: Record<string, string> = {}
    if (!form.name.trim()) next.name = 'Nombre requerido'
    if (!form.licenseNumber.trim()) next.licenseNumber = 'Número de licencia requerido'
    if (!form.licenseDue) next.licenseDue = 'Vencimiento requerido'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const openCreate = () => { setEditingPilot(null); setForm(EMPTY_FORM); setErrors({}); setShowForm(true) }
  const openEdit = (pilot: Pilot) => {
    setEditingPilot(pilot)
    setForm({ name: pilot.name, licenseType: pilot.licenseType, licenseNumber: pilot.licenseNumber ?? '', licenseDue: pilot.licenseDue, phoneNumber: pilot.phoneNumber ?? '', email: pilot.email ?? '' })
    setErrors({}); setShowForm(true)
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      if (editingPilot) {
        await apiClient.updatePilot(editingPilot.id, { name: form.name, licenseType: form.licenseType, licenseDue: form.licenseDue, phoneNumber: form.phoneNumber, email: form.email })
        sileo.success({ title: `Piloto ${form.name} actualizado` })
      } else {
        await apiClient.createPilot({ name: form.name, licenseType: form.licenseType, licenseNumber: form.licenseNumber, licenseDue: form.licenseDue, phoneNumber: form.phoneNumber, email: form.email })
        sileo.success({ title: `Piloto ${form.name} creado` })
      }
      setShowForm(false)
    } catch { sileo.error({ title: 'Error al guardar piloto' }) }
    finally { setLoading(false) }
  }

  return (
    <div className="view-stack">
      <div className="view-header">
        <div>
          <h2>Pilotos</h2>
          <small className="muted">{dashboard.pilots.length} registrados · {dashboard.pilots.filter(p => p.status === 'active').length} activos</small>
        </div>
        <button type="button" className="action-btn icon-label-btn" onClick={openCreate}>
          <Plus size={15} /> Nuevo piloto
        </button>
      </div>

      {/* Alertas de vencimiento */}
      {licenseAlerts.length > 0 && (
        <div className="license-alerts">
          {licenseAlerts.map(alert => (
            <div key={alert.pilotId} className="license-alert-item" style={{ background: ALERT_COLORS[alert.level], color: ALERT_TEXT[alert.level] }}>
              <AlertTriangle size={14} />
              <strong>{alert.name}</strong>
              <span>—</span>
              <span>{alert.daysLeft < 0 ? `Licencia vencida hace ${Math.abs(alert.daysLeft)} días` : `Vence en ${alert.daysLeft} días`}</span>
            </div>
          ))}
        </div>
      )}

      {/* Formulario */}
      {showForm && (
        <article className="card form-card">
          <div className="form-card-head">
            <h3>{editingPilot ? `Editar ${editingPilot.name}` : 'Nuevo piloto'}</h3>
            <button type="button" className="icon-btn" onClick={() => setShowForm(false)}><X size={16} /></button>
          </div>
          <div className="form-grid form-grid-2col">
            <div>
              <label>Nombre completo *</label>
              <input type="text" value={form.name} placeholder="Juan Pérez" onChange={e => setForm({ ...form, name: e.target.value })} />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>
            <div>
              <label>Tipo de licencia</label>
              <select value={form.licenseType} onChange={e => setForm({ ...form, licenseType: e.target.value })}>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>
            <div>
              <label>Número de licencia *</label>
              <input type="text" value={form.licenseNumber} disabled={!!editingPilot} placeholder="GT-12345" onChange={e => setForm({ ...form, licenseNumber: e.target.value })} />
              {errors.licenseNumber && <span className="form-error">{errors.licenseNumber}</span>}
            </div>
            <div>
              <label>Vencimiento licencia *</label>
              <input type="date" value={form.licenseDue} onChange={e => setForm({ ...form, licenseDue: e.target.value })} />
              {errors.licenseDue && <span className="form-error">{errors.licenseDue}</span>}
            </div>
            <div>
              <label>Teléfono</label>
              <input type="tel" value={form.phoneNumber} placeholder="5555-1234" onChange={e => setForm({ ...form, phoneNumber: e.target.value })} />
            </div>
            <div>
              <label>Correo</label>
              <input type="email" value={form.email} placeholder="piloto@empresa.com" onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div className="action-row">
            <button type="button" className="action-btn" onClick={handleSubmit} disabled={loading}>{loading ? 'Guardando...' : editingPilot ? 'Actualizar' : 'Crear piloto'}</button>
            <button type="button" className="mini-btn" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </article>
      )}

      <article className="card">
        <table>
          <thead><tr><th>Nombre</th><th>Licencia</th><th>Vencimiento</th><th>Estado</th><th>Camión asignado</th><th>Teléfono</th><th>Acciones</th></tr></thead>
          <tbody>
            {dashboard.pilots.length === 0 ? (
              <tr><td colSpan={7} className="muted" style={{ textAlign: 'center', padding: '24px' }}>Sin pilotos registrados</td></tr>
            ) : dashboard.pilots.map((pilot) => {
              const truck = fleetState.find(t => t.id === pilot.assignedTruckId)
              const daysLeft = Math.floor((new Date(pilot.licenseDue).getTime() - Date.now()) / 86_400_000)
              return (
                <tr key={pilot.id}>
                  <td><strong>{pilot.name}</strong></td>
                  <td>{pilot.licenseType}{pilot.licenseNumber ? ` · ${pilot.licenseNumber}` : ''}</td>
                  <td>
                    <span style={{ color: daysLeft < 0 ? '#ef4444' : daysLeft <= 15 ? '#f59e0b' : 'inherit' }}>
                      {pilot.licenseDue}
                    </span>
                  </td>
                  <td><StatusBadge status={pilot.status ?? 'active'} variant="generic" /></td>
                  <td>{truck ? `${truck.plate} · ${truck.model}` : <span className="muted">Sin asignar</span>}</td>
                  <td><span className="muted">{pilot.phoneNumber ?? '—'}</span></td>
                  <td>
                    <button type="button" className="icon-btn" title="Editar" onClick={() => openEdit(pilot)}><Pencil size={14} /></button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </article>
    </div>
  )
}
