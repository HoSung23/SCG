import { useState, useEffect } from 'react'
import { sileo } from 'sileo'
import { Plus, Pencil, X } from 'lucide-react'
import { StatusBadge } from '../components/StatusBadge'
import { apiClient } from '../services/api'
import type { Client } from '../types'

const EMPTY_FORM = { name: '', nit: '', contactName: '', phone: '', email: '', address: '' }

export function ClientesView() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getClients() as Client[]
      setClients(data)
    } catch { sileo.error({ title: 'Error al cargar clientes' }) }
    finally { setLoading(false) }
  }

  useEffect(() => { void load() }, [])

  const validate = () => {
    const next: Record<string, string> = {}
    if (!form.name.trim()) next.name = 'El nombre es requerido'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setErrors({}); setShowForm(true) }
  const openEdit = (c: Client) => {
    setEditing(c)
    setForm({ name: c.name, nit: c.nit ?? '', contactName: c.contactName ?? '', phone: c.phone ?? '', email: c.email ?? '', address: c.address ?? '' })
    setErrors({}); setShowForm(true)
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      if (editing) {
        await apiClient.updateClient(editing.id, form)
        sileo.success({ title: 'Cliente actualizado' })
      } else {
        await apiClient.createClient(form)
        sileo.success({ title: `Cliente ${form.name} creado` })
      }
      setShowForm(false)
      await load()
    } catch { sileo.error({ title: 'Error al guardar cliente' }) }
    finally { setSaving(false) }
  }

  const handleToggleStatus = async (c: Client) => {
    const newStatus = c.status === 'active' ? 'inactive' : 'active'
    try {
      await apiClient.updateClient(c.id, { status: newStatus })
      sileo.success({ title: `Cliente ${newStatus === 'active' ? 'activado' : 'desactivado'}` })
      await load()
    } catch { sileo.error({ title: 'Error al cambiar estado' }) }
  }

  return (
    <div className="view-stack">
      <div className="view-header">
        <div>
          <h2>Clientes</h2>
          <small className="muted">{clients.filter(c => c.status === 'active').length} activos de {clients.length}</small>
        </div>
        <button type="button" className="action-btn icon-label-btn" onClick={openCreate}>
          <Plus size={15} /> Nuevo cliente
        </button>
      </div>

      {showForm && (
        <article className="card form-card">
          <div className="form-card-head">
            <h3>{editing ? `Editar ${editing.name}` : 'Nuevo cliente'}</h3>
            <button type="button" className="icon-btn" onClick={() => setShowForm(false)}><X size={16} /></button>
          </div>
          <div className="form-grid form-grid-2col">
            <div>
              <label>Nombre *</label>
              <input type="text" value={form.name} placeholder="Constructora XYZ" onChange={e => setForm({ ...form, name: e.target.value })} />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>
            <div>
              <label>NIT</label>
              <input type="text" value={form.nit} placeholder="123456-7" onChange={e => setForm({ ...form, nit: e.target.value })} />
            </div>
            <div>
              <label>Contacto</label>
              <input type="text" value={form.contactName} placeholder="Carlos López" onChange={e => setForm({ ...form, contactName: e.target.value })} />
            </div>
            <div>
              <label>Teléfono</label>
              <input type="tel" value={form.phone} placeholder="2222-3333" onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label>Correo</label>
              <input type="email" value={form.email} placeholder="cliente@empresa.com" onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label>Dirección</label>
              <input type="text" value={form.address} placeholder="Ciudad de Guatemala" onChange={e => setForm({ ...form, address: e.target.value })} />
            </div>
          </div>
          <div className="action-row">
            <button type="button" className="action-btn" onClick={handleSubmit} disabled={saving}>{saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear cliente'}</button>
            <button type="button" className="mini-btn" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </article>
      )}

      <article className="card">
        {loading ? <p className="muted">Cargando...</p> : (
          <table>
            <thead><tr><th>Nombre</th><th>NIT</th><th>Contacto</th><th>Teléfono</th><th>Correo</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {clients.length === 0 ? (
                <tr><td colSpan={7} className="muted" style={{ textAlign: 'center', padding: '24px' }}>Sin clientes registrados</td></tr>
              ) : clients.map(c => (
                <tr key={c.id}>
                  <td><strong>{c.name}</strong></td>
                  <td><span className="muted">{c.nit ?? '—'}</span></td>
                  <td>{c.contactName ?? '—'}</td>
                  <td><span className="muted">{c.phone ?? '—'}</span></td>
                  <td><span className="muted">{c.email ?? '—'}</span></td>
                  <td><StatusBadge status={c.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <button type="button" className="icon-btn" title="Editar" onClick={() => openEdit(c)}><Pencil size={14} /></button>
                      <button type="button" className="mini-btn" onClick={() => handleToggleStatus(c)}>
                        {c.status === 'active' ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
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
