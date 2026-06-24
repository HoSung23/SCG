import { useEffect, useState } from 'react'
import { sileo } from 'sileo'
import { Play, CheckCircle, MapPin, Gauge } from 'lucide-react'
import { apiClient } from '../services/api'
import { StatusBadge } from '../components/StatusBadge'
import type { SharedViewProps } from './types'

type ViajeDetail = {
  id: string
  trip_code?: string
  customer?: string
  origin?: string
  destination?: string
  pilot_name?: string
  truck_plate?: string
  pilot_id?: string
  truck_id?: string
  status: 'programado' | 'en-ruta' | 'completado' | 'cancelado'
  created_at?: string
  started_at?: string
  completed_at?: string
  gps_inicio?: string
  gps_fin?: string
  odometro_inicio?: number
  odometro_fin?: number
  km_reales?: number
  distance_km?: number
}

export function TripsView({ dashboard }: SharedViewProps) {
  const [viajes, setViajes] = useState<ViajeDetail[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState<string>('')
  const [filtroPiloto, setFiltroPiloto] = useState<string>('')
  const [filtroCamion, setFiltroCamion] = useState<string>('')

  const [actionModal, setActionModal] = useState<{ type: 'start' | 'finish'; viajeId: string } | null>(null)
  const [formData, setFormData] = useState({
    gpsInicio: '',
    odometroInicio: '',
    gpsFin: '',
    odometroFin: '',
    observaciones: ''
  })

  useEffect(() => {
    loadViajes()
  }, [filtroStatus, filtroPiloto, filtroCamion])

  async function loadViajes() {
    try {
      setIsLoading(true)
      const params: any = {}
      if (filtroStatus) params.status = filtroStatus
      if (filtroPiloto) params.pilotId = filtroPiloto
      if (filtroCamion) params.truckId = filtroCamion
      const data = await apiClient.getAllTrips(params)
      setViajes(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error loading trips:', error)
      sileo.error({ title: 'Error cargando viajes' })
      setViajes([])
    } finally {
      setIsLoading(false)
    }
  }

  async function handleStartTrip() {
    if (!actionModal || actionModal.type !== 'start') return
    
    if (!formData.odometroInicio) {
      sileo.error({ title: 'El odómetro inicial es requerido' })
      return
    }

    try {
      await apiClient.startTrip(actionModal.viajeId, {
        gpsInicio: formData.gpsInicio || undefined,
        odometroInicio: Number(formData.odometroInicio),
        observaciones: formData.observaciones || undefined
      })
      sileo.success({ title: 'Viaje iniciado' })
      setActionModal(null)
      setFormData({ gpsInicio: '', odometroInicio: '', gpsFin: '', odometroFin: '', observaciones: '' })
      await loadViajes()
    } catch (error: any) {
      sileo.error({ title: error.message || 'Error iniciando viaje' })
    }
  }

  async function handleFinishTrip() {
    if (!actionModal || actionModal.type !== 'finish') return
    
    if (!formData.odometroFin) {
      sileo.error({ title: 'El odómetro final es requerido' })
      return
    }

    try {
      await apiClient.finishTrip(actionModal.viajeId, {
        gpsFin: formData.gpsFin || undefined,
        odometroFin: Number(formData.odometroFin),
        observaciones: formData.observaciones || undefined
      })
      sileo.success({ title: 'Viaje completado' })
      setActionModal(null)
      setFormData({ gpsInicio: '', odometroInicio: '', gpsFin: '', odometroFin: '', observaciones: '' })
      await loadViajes()
    } catch (error: any) {
      sileo.error({ title: error.message || 'Error finalizando viaje' })
    }
  }

  const viajesHoy = viajes.filter(v => {
    const today = new Date().toLocaleDateString('en-CA')
    const viajeDate = new Date(v.created_at ?? '').toLocaleDateString('en-CA')
    return viajeDate === today
  })
  const viajesActivos = viajes.filter(v => v.status === 'en-ruta')
  const viajesCompletados = viajes.filter(v => v.status === 'completado')
  const viajeCancelados = viajes.filter(v => v.status === 'cancelado')

  const filteredViajes = viajes.filter(v => {
    if (filtroStatus && v.status !== filtroStatus) return false
    if (filtroPiloto && v.pilot_id !== filtroPiloto) return false
    if (filtroCamion && v.truck_id !== filtroCamion) return false
    return true
  })

  if (isLoading) return <div className="view-stack"><p>⏳ Cargando viajes...</p></div>

  return (
    <section className="view-stack">
      <header className="view-header">
        <h1>🚚 Gestión de Viajes</h1>
        <p>Monitorea y controla viajes en tiempo real</p>
      </header>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{viajesHoy.length}</div>
          <div style={{ fontSize: '12px', marginTop: '0.5rem', opacity: 0.9 }}>Viajes hoy</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{viajesActivos.length}</div>
          <div style={{ fontSize: '12px', marginTop: '0.5rem', opacity: 0.9 }}>En ruta</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{viajesCompletados.length}</div>
          <div style={{ fontSize: '12px', marginTop: '0.5rem', opacity: 0.9 }}>Completados</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{viajeCancelados.length}</div>
          <div style={{ fontSize: '12px', marginTop: '0.5rem', opacity: 0.9 }}>Cancelados</div>
        </div>
      </div>

      <article className="card">
        {/* Filters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label htmlFor="filtro-status" style={{ display: 'block', marginBottom: '0.25rem', fontSize: '12px', fontWeight: '600' }}>Estado</label>
            <select
              id="filtro-status"
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="programado">Programado</option>
              <option value="en-ruta">En ruta</option>
              <option value="completado">Completado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          <div>
            <label htmlFor="filtro-piloto" style={{ display: 'block', marginBottom: '0.25rem', fontSize: '12px', fontWeight: '600' }}>Piloto</label>
            <select
              id="filtro-piloto"
              value={filtroPiloto}
              onChange={(e) => setFiltroPiloto(e.target.value)}
            >
              <option value="">Todos</option>
              {dashboard.pilots.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="filtro-camion" style={{ display: 'block', marginBottom: '0.25rem', fontSize: '12px', fontWeight: '600' }}>Camión</label>
            <select
              id="filtro-camion"
              value={filtroCamion}
              onChange={(e) => setFiltroCamion(e.target.value)}
            >
              <option value="">Todos</option>
              {dashboard.trucks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.plate}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd', background: '#f8f9fa' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '12px', fontWeight: '600' }}>Código</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '12px', fontWeight: '600' }}>Cliente</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '12px', fontWeight: '600' }}>Ruta</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '12px', fontWeight: '600' }}>Piloto</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '12px', fontWeight: '600' }}>Camión</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '12px', fontWeight: '600' }}>Estado</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '12px', fontWeight: '600' }}>Km</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '12px', fontWeight: '600' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredViajes.map((viaje) => (
                <tr key={viaje.id} className="trip-row">
                  <td style={{ padding: '0.75rem', fontSize: '12px', fontWeight: '500' }}>{viaje.trip_code ?? '-'}</td>
                  <td style={{ padding: '0.75rem', fontSize: '12px' }}>{viaje.customer ?? '-'}</td>
                  <td style={{ padding: '0.75rem', fontSize: '11px', color: '#666' }}>
                    {(viaje.origin ?? '?').substring(0, 12)} → {(viaje.destination ?? '?').substring(0, 12)}
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '12px' }}>{viaje.pilot_name || '-'}</td>
                  <td style={{ padding: '0.75rem', fontSize: '12px', fontWeight: '500' }}>{viaje.truck_plate || '-'}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <StatusBadge status={viaje.status} variant="trip" />
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '12px', textAlign: 'right', fontWeight: '500' }}>
                    {viaje.km_reales ? `${viaje.km_reales.toFixed(1)} km` : '-'}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    {viaje.status === 'programado' && (
                      <button
                        type="button"
                        title="Iniciar viaje"
                        onClick={() => {
                          setActionModal({ type: 'start', viajeId: viaje.id })
                            setFormData({ gpsInicio: '', odometroInicio: '', gpsFin: '', odometroFin: '', observaciones: '' })
                        }}
                        style={{ 
                          padding: '0.5rem 0.75rem', 
                          background: '#0066cc', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '4px', 
                          cursor: 'pointer', 
                          fontSize: '11px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        <Play size={14} /> Iniciar
                      </button>
                    )}
                    {viaje.status === 'en-ruta' && (
                      <button
                        type="button"
                        title="Finalizar viaje"
                        onClick={() => {
                          setActionModal({ type: 'finish', viajeId: viaje.id })
                            setFormData({ gpsInicio: '', odometroInicio: '', gpsFin: '', odometroFin: '', observaciones: '' })
                        }}
                        style={{ 
                          padding: '0.5rem 0.75rem', 
                          background: '#16a34a', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '4px', 
                          cursor: 'pointer', 
                          fontSize: '11px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        <CheckCircle size={14} /> Terminar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredViajes.length === 0 && <p style={{ textAlign: 'center', color: '#999', marginTop: '3rem', padding: '2rem' }}>📭 Sin viajes con estos filtros</p>}
      </article>

      {/* Modal: Iniciar Viaje */}
      {actionModal?.type === 'start' && (
        <div className="modal-backdrop">
          <div className="modal-panel">
            <h2>🚀 Iniciar Viaje</h2>
            
            <div style={{ display: 'grid', gap: '1.25rem' }}>
              <div>
                <label htmlFor="gps-inicio" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '12px', fontWeight: '600' }}>
                  <MapPin size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                  Coordenadas GPS (opcional)
                </label>
                <input
                  id="gps-inicio"
                  type="text"
                  placeholder="14.6349, -90.5069"
                  value={formData.gpsInicio}
                  onChange={(e) => setFormData({ ...formData, gpsInicio: e.target.value })}
                />
              </div>
              
              <div>
                <label htmlFor="odometro-inicio" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '12px', fontWeight: '600' }}>
                  <Gauge size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                  Odómetro Inicial (km) *
                </label>
                <input
                  id="odometro-inicio"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={formData.odometroInicio}
                  onChange={(e) => setFormData({ ...formData, odometroInicio: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="obs-inicio" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '12px', fontWeight: '600' }}>
                  📝 Observaciones
                </label>
                <textarea
                  id="obs-inicio"
                  rows={3}
                  placeholder="Condiciones del camión, clima, etc..."
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
              <button 
                type="button" 
                onClick={() => setActionModal(null)} 
                className="btn-ghost"
              >
                Cancelar
              </button>
              <button 
                type="button" 
                onClick={handleStartTrip} 
                className="btn-primary"
              >
                Confirmar Inicio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Finalizar Viaje */}
      {actionModal?.type === 'finish' && (
        <div className="modal-backdrop">
          <div className="modal-panel">
            <h2>✅ Finalizar Viaje</h2>
            
            <div style={{ display: 'grid', gap: '1.25rem' }}>
              <div>
                <label htmlFor="gps-fin" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '12px', fontWeight: '600' }}>
                  <MapPin size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                  Coordenadas GPS (opcional)
                </label>
                <input
                  id="gps-fin"
                  type="text"
                  placeholder="14.6349, -90.5069"
                  value={formData.gpsFin}
                  onChange={(e) => setFormData({ ...formData, gpsFin: e.target.value })}
                />
              </div>
              
              <div>
                <label htmlFor="odometro-fin" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '12px', fontWeight: '600' }}>
                  <Gauge size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                  Odómetro Final (km) *
                </label>
                <input
                  id="odometro-fin"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={formData.odometroFin}
                  onChange={(e) => setFormData({ ...formData, odometroFin: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="obs-fin" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '12px', fontWeight: '600' }}>
                  📝 Observaciones
                </label>
                <textarea
                  id="obs-fin"
                  rows={3}
                  placeholder="Condiciones finales, incidentes, etc..."
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
              <button 
                type="button" 
                onClick={() => setActionModal(null)} 
                className="btn-ghost"
              >
                Cancelar
              </button>
              <button 
                type="button" 
                onClick={handleFinishTrip} 
                className="btn-success"
              >
                Confirmar Fin
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
