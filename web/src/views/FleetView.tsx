import { useState } from 'react'
import { sileo } from 'sileo'
import { Plus, Pencil, X } from 'lucide-react'
import { StatusBadge } from '../components/StatusBadge'
import { apiClient } from '../services/api'
import type { SharedViewProps } from './types'
import type { Truck } from '../types'

const TRUCK_STATUS_LABELS: Record<string, string> = {
  active: 'Activo', maintenance: 'Mantenimiento', idle: 'Inactivo', retired: 'Retirado'
}
const EMPTY_FORM = { plate: '', model: '', year: '2020', fuelKmPerGallon: '', ownershipType: 'propia' }

export function FleetView({ dashboard, fleetState }: SharedViewProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingTruck, setEditingTruck] = useState<Truck | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const next: Record<string, string> = {}
    if (!form.plate.trim()) next.plate = 'Placa requerida'
    if (!form.model.trim()) next.model = 'Modelo requerido'
    if (!form.year || Number(form.year) <= 1990) next.year = 'Año debe ser mayor a 1990'
    if (!form.fuelKmPerGallon || Number(form.fuelKmPerGallon) <= 0) next.fuelKmPerGallon = 'Km/Galón debe ser > 0'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const openCreate = () => { setEditingTruck(null); setForm(EMPTY_FORM); setErrors({}); setShowForm(true) }
  const openEdit = (truck: Truck) => {
    setEditingTruck(truck)
    setForm({ plate: truck.plate, model: truck.model, year: String(truck.year ?? 2020), fuelKmPerGallon: String(truck.fuelKmPerGallon), ownershipType: truck.ownershipType ?? 'propia' })
    setErrors({}); setShowForm(true)
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      if (editingTruck) {
        await apiClient.updateTruck(editingTruck.id, { model: form.model, fuelKmPerGallon: Number(form.fuelKmPerGallon), ownershipType: form.ownershipType })
        sileo.success({ title: `Camión ${form.plate} actualizado` })
      } else {
        await apiClient.createTruck({ plate: form.plate.toUpperCase(), model: form.model, year: Number(form.year), fuelKmPerGallon: Number(form.fuelKmPerGallon), ownershipType: form.ownershipType })
        sileo.success({ title: `Camión ${form.plate.toUpperCase()} creado` })
      }
      setShowForm(false)
    } catch { sileo.error({ title: 'Error al guardar camión' }) }
    finally { setLoading(false) }
  }

  const handleStatusChange = async (truck: Truck, newStatus: string) => {
    try {
      await apiClient.updateTruck(truck.id, { status: newStatus })
      dashboard.setFleetStatusForm({ truckId: truck.id, newStatus: newStatus as Truck['status'] })
      await dashboard.updateFleetStatus()
      sileo.success({ title: `${truck.plate} → ${TRUCK_STATUS_LABELS[newStatus]}` })
    } catch { sileo.error({ title: 'Error al actualizar estado' }) }
  }

  return (
    <div className="view-stack">
      <div className="view-header">
        <div>
          <h2>Flota de camiones</h2>
          <small className="muted">{fleetState.length} unidades · {fleetState.filter(t => t.status === 'active').length} activas</small>
        </div>
        <button type="button" className="action-btn icon-label-btn" onClick={openCreate}>
          <Plus size={15} /> Nuevo camión
        </button>
      </div>

      {showForm && (
        <article className="card form-card">
          <div className="form-card-head">
            <h3>{editingTruck ? `Editar ${editingTruck.plate}` : 'Nuevo camión'}</h3>
            <button type="button" className="icon-btn" onClick={() => setShowForm(false)}><X size={16} /></button>
          </div>
          <div className="form-grid form-grid-2col">
            <div>
              <label>Placa *</label>
              <input type="text" value={form.plate} disabled={!!editingTruck} placeholder="P-123ABC" onChange={e => setForm({ ...form, plate: e.target.value })} />
              {errors.plate && <span className="form-error">{errors.plate}</span>}
            </div>
            <div>
              <label>Modelo *</label>
              <input type="text" value={form.model} placeholder="Kenworth T800" onChange={e => setForm({ ...form, model: e.target.value })} />
              {errors.model && <span className="form-error">{errors.model}</span>}
            </div>
            <div>
              <label>Año *</label>
              <input type="number" value={form.year} disabled={!!editingTruck} onChange={e => setForm({ ...form, year: e.target.value })} />
              {errors.year && <span className="form-error">{errors.year}</span>}
            </div>
            <div>
              <label>Km/Galón esperado *</label>
              <input type="number" step="0.1" value={form.fuelKmPerGallon} onChange={e => setForm({ ...form, fuelKmPerGallon: e.target.value })} />
              {errors.fuelKmPerGallon && <span className="form-error">{errors.fuelKmPerGallon}</span>}
            </div>
            <div>
              <label>Tipo de propiedad</label>
              <select value={form.ownershipType} onChange={e => setForm({ ...form, ownershipType: e.target.value })}>
                <option value="propia">Propia</option>
                <option value="arrendada">Arrendada</option>
              </select>
            </div>
          </div>
          <div className="action-row">
            <button type="button" className="action-btn" onClick={handleSubmit} disabled={loading}>{loading ? 'Guardando...' : editingTruck ? 'Actualizar' : 'Crear camión'}</button>
            <button type="button" className="mini-btn" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </article>
      )}

      <article className="card">
        <table>
          <thead><tr><th>Placa</th><th>Modelo</th><th>Año</th><th>Estado</th><th>Tipo</th><th>Km/Galón</th><th>Acciones</th></tr></thead>
          <tbody>
            {fleetState.length === 0 ? (
              <tr><td colSpan={7} className="muted" style={{ textAlign: 'center', padding: '24px' }}>Sin camiones registrados</td></tr>
            ) : fleetState.map((truck) => (
              <tr key={truck.id}>
                <td><strong>{truck.plate}</strong></td>
                <td>{truck.model}</td>
                <td>{truck.year ?? '—'}</td>
                <td><StatusBadge status={truck.status} variant="truck" /></td>
                <td><span className="muted">{truck.ownershipType ?? 'Propia'}</span></td>
                <td>{truck.fuelKmPerGallon} km/gal</td>
                <td>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <button type="button" className="icon-btn" title="Editar" onClick={() => openEdit(truck)}><Pencil size={14} /></button>
                    <select className="inline-status-select" value={truck.status} onChange={e => handleStatusChange(truck, e.target.value)}>
                      <option value="active">Activo</option>
                      <option value="maintenance">Mantenimiento</option>
                      <option value="idle">Inactivo</option>
                      <option value="retired">Retirado</option>
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </div>
  )
}
