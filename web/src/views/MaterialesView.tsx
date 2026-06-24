import { useState, useEffect } from 'react'
import { sileo } from 'sileo'
import { Plus, X } from 'lucide-react'
import { apiClient } from '../services/api'
import type { Material } from '../types'

const EMPTY_FORM = { name: '', unit: 'TN', description: '' }
const UNIT_OPTIONS = ['TN', 'M3', 'KG', 'CARGA', 'VIAJE', 'OTRO']

export function MaterialesView() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getMaterials() as Material[]
      setMaterials(data)
    } catch { sileo.error({ title: 'Error al cargar materiales' }) }
    finally { setLoading(false) }
  }

  useEffect(() => { void load() }, [])

  const validate = () => {
    const next: Record<string, string> = {}
    if (!form.name.trim()) next.name = 'El nombre es requerido'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      await apiClient.createMaterial(form)
      sileo.success({ title: `Material ${form.name} creado` })
      setShowForm(false)
      setForm(EMPTY_FORM)
      await load()
    } catch { sileo.error({ title: 'Error al crear material' }) }
    finally { setSaving(false) }
  }

  const handleToggle = async (m: Material) => {
    try {
      await apiClient.toggleMaterial(m.id)
      sileo.success({ title: `${m.name} ${m.active ? 'desactivado' : 'activado'}` })
      await load()
    } catch { sileo.error({ title: 'Error al cambiar estado' }) }
  }

  return (
    <div className="view-stack">
      <div className="view-header">
        <div>
          <h2>Materiales</h2>
          <small className="muted">{materials.filter(m => m.active).length} activos de {materials.length}</small>
        </div>
        <button type="button" className="action-btn icon-label-btn" onClick={() => { setForm(EMPTY_FORM); setErrors({}); setShowForm(true) }}>
          <Plus size={15} /> Nuevo material
        </button>
      </div>

      {showForm && (
        <article className="card form-card">
          <div className="form-card-head">
            <h3>Nuevo material</h3>
            <button type="button" className="icon-btn" onClick={() => setShowForm(false)}><X size={16} /></button>
          </div>
          <div className="form-grid form-grid-2col">
            <div>
              <label>Nombre *</label>
              <input type="text" value={form.name} placeholder="Arena, Grava, Cemento…" onChange={e => setForm({ ...form, name: e.target.value })} />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>
            <div>
              <label>Unidad</label>
              <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
                {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label>Descripción (opcional)</label>
              <input type="text" value={form.description} placeholder="Descripción del material" onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <div className="action-row">
            <button type="button" className="action-btn" onClick={handleSubmit} disabled={saving}>{saving ? 'Guardando...' : 'Crear material'}</button>
            <button type="button" className="mini-btn" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </article>
      )}

      <article className="card">
        {loading ? <p className="muted">Cargando...</p> : (
          <table>
            <thead><tr><th>Nombre</th><th>Unidad</th><th>Descripción</th><th>Estado</th><th>Acción</th></tr></thead>
            <tbody>
              {materials.length === 0 ? (
                <tr><td colSpan={5} className="muted" style={{ textAlign: 'center', padding: '24px' }}>Sin materiales registrados</td></tr>
              ) : materials.map(m => (
                <tr key={m.id}>
                  <td><strong>{m.name}</strong></td>
                  <td><span className="muted">{m.unit}</span></td>
                  <td><span className="muted">{m.description ?? '—'}</span></td>
                  <td>
                    <span className="module-badge" style={m.active ? {} : { background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}>
                      {m.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <button type="button" className="mini-btn" onClick={() => handleToggle(m)}>
                      {m.active ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </article>
    </div>
  )
}
