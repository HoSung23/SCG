import { useEffect, useState } from 'react'
import { sileo } from 'sileo'
import { Plus, X } from 'lucide-react'
import { apiClient } from '../services/api'
import { StatusBadge } from '../components/StatusBadge'
import type { SharedViewProps } from './types'

type Programacion = {
  id: string
  fecha_programacion: string
  codigo_documento: string
  cliente_nombre: string
  origen: string
  destino: string
  material_nombre: string
  numero_pedido: string
  fecha_entrega: string
  pilot_id?: string
  truck_id?: string
  status: 'pendiente' | 'asignado' | 'en_curso' | 'completado' | 'cancelado'
  pilot_name?: string
  truck_plate?: string
}

export function ProgramacionView({ dashboard }: SharedViewProps) {
  const [programaciones, setProgramaciones] = useState<Programacion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState<string>('')
  const [filtroFecha, setFiltroFecha] = useState<string>('')

  const [modalOpen, setModalOpen] = useState<'pilot' | 'truck' | null>(null)
  const [selectedProgramacionId, setSelectedProgramacionId] = useState<string>('')
  const [selectedPilot, setSelectedPilot] = useState<string>('')
  const [selectedTruck, setSelectedTruck] = useState<string>('')

  useEffect(() => {
    loadProgramaciones()
  }, [filtroStatus, filtroFecha])

  async function loadProgramaciones() {
    try {
      setIsLoading(true)
      const params: any = {}
      if (filtroStatus) params.status = filtroStatus
      if (filtroFecha) params.fecha = filtroFecha
      const data = await apiClient.getProgramaciones(params)
      setProgramaciones(Array.isArray(data) ? data : [])
    } catch (error) {
      sileo.error({ title: 'Error cargando programaciones' })
      setProgramaciones([])
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAssignPilot() {
    if (!selectedProgramacionId || !selectedPilot) {
      sileo.error({ title: 'Selecciona piloto y programación' })
      return
    }
    try {
      await apiClient.assignPilotToProgramacion(selectedProgramacionId, selectedPilot)
      sileo.success({ title: 'Piloto asignado' })
      setModalOpen(null)
      setSelectedProgramacionId('')
      setSelectedPilot('')
      await loadProgramaciones()
    } catch (error) {
      sileo.error({ title: 'Error asignando piloto' })
    }
  }

  async function handleAssignTruck() {
    if (!selectedProgramacionId || !selectedTruck) {
      sileo.error({ title: 'Selecciona camión y programación' })
      return
    }
    try {
      await apiClient.assignTruckToProgramacion(selectedProgramacionId, selectedTruck)
      sileo.success({ title: 'Camión asignado' })
      setModalOpen(null)
      setSelectedProgramacionId('')
      setSelectedTruck('')
      await loadProgramaciones()
    } catch (error) {
      sileo.error({ title: 'Error asignando camión' })
    }
  }

  async function handleGenerateTrip(progId: string) {
    const prog = programaciones.find(p => p.id === progId)
    if (!prog?.pilot_id || !prog?.truck_id) {
      sileo.error({ title: 'Debe asignar piloto y camión primero' })
      return
    }
    try {
      await apiClient.generateTripFromProgramacion(progId)
      sileo.success({ title: 'Viaje generado exitosamente' })
      await loadProgramaciones()
    } catch (error) {
      sileo.error({ title: 'Error generando viaje' })
    }
  }

  const filteredProgramaciones = programaciones.filter(p => {
    if (filtroStatus && p.status !== filtroStatus) return false
    return true
  })

  if (isLoading) return <div className="view-stack"><p>Cargando programaciones...</p></div>

  return (
    <section className="view-stack">
      <header className="view-header">
        <h1>Programación de viajes</h1>
        <p>Gestiona la programación diaria y asigna recursos</p>
      </header>

      <article className="card">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label htmlFor="filtro-status">Estado</label>
            <select
              id="filtro-status"
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              style={{ minWidth: '150px' }}
            >
              <option value="">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="asignado">Asignado</option>
              <option value="en_curso">En curso</option>
              <option value="completado">Completado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          <div>
            <label htmlFor="filtro-fecha">Fecha</label>
            <input
              id="filtro-fecha"
              type="date"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ccc' }}>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Fecha</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Código</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Cliente</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Origen</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Destino</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Material</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Piloto</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Camión</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Estado</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProgramaciones.map((prog) => (
                <tr key={prog.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '0.5rem' }}>
                    {new Date(prog.fecha_programacion).toLocaleDateString('es-GT')}
                  </td>
                  <td style={{ padding: '0.5rem' }}>{prog.codigo_documento}</td>
                  <td style={{ padding: '0.5rem' }}>{prog.cliente_nombre}</td>
                  <td style={{ padding: '0.5rem' }}>{prog.origen}</td>
                  <td style={{ padding: '0.5rem' }}>{prog.destino}</td>
                  <td style={{ padding: '0.5rem' }}>{prog.material_nombre}</td>
                  <td style={{ padding: '0.5rem' }}>
                    {prog.pilot_name || (
                      <button
                        type="button"
                        className="icon-btn"
                        title="Asignar piloto"
                        onClick={() => {
                          setSelectedProgramacionId(prog.id)
                          setModalOpen('pilot')
                        }}
                      >
                        <Plus size={16} /> Asignar
                      </button>
                    )}
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    {prog.truck_plate || (
                      <button
                        type="button"
                        className="icon-btn"
                        title="Asignar camión"
                        onClick={() => {
                          setSelectedProgramacionId(prog.id)
                          setModalOpen('truck')
                        }}
                      >
                        <Plus size={16} /> Asignar
                      </button>
                    )}
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <StatusBadge status={prog.status} variant="trip" />
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    {prog.pilot_id && prog.truck_id && prog.status === 'asignado' && (
                      <button
                        type="button"
                        className="icon-btn"
                        title="Generar viaje"
                        onClick={() => handleGenerateTrip(prog.id)}
                      >
                        ✓ Viaje
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProgramaciones.length === 0 && <p style={{ textAlign: 'center', color: '#666', marginTop: '2rem' }}>Sin programaciones</p>}
      </article>

      {modalOpen === 'pilot' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', maxWidth: '400px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>Asignar piloto</h2>
              <button type="button" onClick={() => { setModalOpen(null); setSelectedPilot(''); }} className="icon-btn">
                <X size={18} />
              </button>
            </div>
            <select value={selectedPilot} onChange={(e) => setSelectedPilot(e.target.value)} style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}>
              <option value="">-- Selecciona piloto --</option>
              {dashboard.pilots.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <button type="button" onClick={handleAssignPilot} style={{ width: '100%', padding: '0.75rem', background: '#0066cc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Asignar
            </button>
          </div>
        </div>
      )}

      {modalOpen === 'truck' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', maxWidth: '400px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>Asignar camión</h2>
              <button type="button" onClick={() => { setModalOpen(null); setSelectedTruck(''); }} className="icon-btn">
                <X size={18} />
              </button>
            </div>
            <select value={selectedTruck} onChange={(e) => setSelectedTruck(e.target.value)} style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}>
              <option value="">-- Selecciona camión --</option>
              {dashboard.trucks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.plate} - {t.model}
                </option>
              ))}
            </select>
            <button type="button" onClick={handleAssignTruck} style={{ width: '100%', padding: '0.75rem', background: '#0066cc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Asignar
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
