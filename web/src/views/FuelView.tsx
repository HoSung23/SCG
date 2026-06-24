import { useEffect, useState } from 'react'
import { sileo } from 'sileo'
import { RefreshCw, TrendingDown } from 'lucide-react'
import { apiClient } from '../services/api'
import type { SharedViewProps } from './types'

type FuelRecord = {
  id: string
  truck_id: string
  truck_plate?: string
  station: string
  diesel_price_gtq?: number
  gallons_dispensed?: number
  total_cost_gtq?: number
  meter_km?: number
  recorded_at: string
  notes?: string
}

type MemPrice = {
  date: string
  dieselPrecio: number
  gasolinaRegular: number
  gasolinaSuper: number
  kerosene: number
  lastUpdated: string
}

export function FuelView({ dashboard, formatMoney }: SharedViewProps) {
  const [records, setRecords] = useState<FuelRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filtroTruck, setFiltroTruck] = useState<string>('')
  const [memPrice, setMemPrice] = useState<MemPrice | null>(null)
  const [isRefreshingPrice, setIsRefreshingPrice] = useState(false)

  const [formData, setFormData] = useState({
    truckId: '',
    station: '',
    dieselPriceGtq: '',
    gallonsDispensed: '',
    meterKm: '',
    notes: ''
  })

  useEffect(() => {
    loadData()
  }, [filtroTruck])

  async function loadData() {
    try {
      setIsLoading(true)

      // Cargar precio MEM
      const priceRes = await fetch('http://localhost:3000/api/fuel-prices/today')
      if (priceRes.ok) {
        const price: MemPrice = await priceRes.json()
        setMemPrice(price)
        setFormData(prev => ({ ...prev, dieselPriceGtq: price.dieselPrecio.toString() }))
      }

      // Cargar registros
      const data = await apiClient.getFuelRecords()
      const filtered = Array.isArray(data) ? data : []
      if (filtroTruck) {
        setRecords(filtered.filter((r: any) => r.truck_id === filtroTruck))
      } else {
        setRecords(filtered)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRefreshPrice() {
    try {
      setIsRefreshingPrice(true)
      const res = await fetch('http://localhost:3000/api/fuel-prices/refresh', { method: 'POST' })
      if (res.ok) {
        const price: MemPrice = await res.json()
        setMemPrice(price)
        setFormData(prev => ({ ...prev, dieselPriceGtq: price.dieselPrecio.toString() }))
        sileo.success({ title: 'Precio MEM actualizado' })
      }
    } catch (error) {
      sileo.error({ title: 'Error actualizando precio' })
    } finally {
      setIsRefreshingPrice(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.truckId || !formData.station || !formData.dieselPriceGtq || !formData.gallonsDispensed) {
      sileo.error({ title: 'Completa los campos requeridos (*)' })
      return
    }

    const price = Number(formData.dieselPriceGtq)
    const gallons = Number(formData.gallonsDispensed)

    if (price <= 0 || gallons <= 0) {
      sileo.error({ title: 'Precio y galones deben ser > 0' })
      return
    }

    try {
      await apiClient.recordFuel({
        truckId: formData.truckId,
        station: formData.station,
        dieselPriceGtq: price,
        gallonsDispensed: gallons,
        meterKm: formData.meterKm ? Number(formData.meterKm) : undefined,
        notes: formData.notes || undefined
      })
      sileo.success({ title: 'Combustible registrado' })
      setFormData({ truckId: '', station: '', dieselPriceGtq: memPrice?.dieselPrecio.toString() || '', gallonsDispensed: '', meterKm: '', notes: '' })
      await loadData()
    } catch (error: any) {
      sileo.error({ title: error.message || 'Error registrando' })
    }
  }

  const totalCost = Number(formData.dieselPriceGtq) * Number(formData.gallonsDispensed) || 0
  const totalFuelSpent = records.reduce((sum, r) => sum + (r.total_cost_gtq ?? 0), 0)

  if (isLoading) return <div className="view-stack"><p>⏳ Cargando...</p></div>

  return (
    <section className="view-stack">
      <header className="view-header">
        <h1>⛽ Gestión de Combustible</h1>
        <p>Registra compras de diesel con precios actualizados de MEM</p>
      </header>

      {/* Precio MEM Widget */}
      {memPrice && (
        <div className="mem-widget">
          <div>
            <div className="mem-widget__label">Precio MEM de hoy · Diésel</div>
            <div className="mem-widget__price">Q{memPrice.dieselPrecio.toFixed(2)}</div>
            <div className="mem-widget__time">{new Date(memPrice.lastUpdated).toLocaleTimeString('es-GT')}</div>
          </div>
          <button
            type="button"
            onClick={handleRefreshPrice}
            disabled={isRefreshingPrice}
            className="mem-widget__btn"
          >
            <RefreshCw size={15} />
            Actualizar
          </button>
        </div>
      )}

      {/* Formulario */}
      <article className="card">
        <h2>📝 Registrar Carga</h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div>
            <label htmlFor="truck-select">Camión *</label>
            <select
              id="truck-select"
              value={formData.truckId}
              onChange={(e) => setFormData({ ...formData, truckId: e.target.value })}
              required
            >
              <option value="">-- Selecciona --</option>
              {dashboard.trucks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.plate} - {t.model}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="station">Gasolinera *</label>
            <input
              id="station"
              type="text"
              placeholder="ej. Puma, Shell"
              value={formData.station}
              onChange={(e) => setFormData({ ...formData, station: e.target.value })}
              required
            />
          </div>

          <div>
            <label htmlFor="price">Precio/Galón (GTQ) *</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.dieselPriceGtq}
                onChange={(e) => setFormData({ ...formData, dieselPriceGtq: e.target.value })}
                required
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, dieselPriceGtq: memPrice?.dieselPrecio.toString() || prev.dieselPriceGtq }))}
                title="Usar precio MEM"
                style={{
                  padding: '0.5rem 1rem',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                <TrendingDown size={14} />
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="gallons">Galones *</label>
            <input
              id="gallons"
              type="number"
              min="0"
              step="0.1"
              value={formData.gallonsDispensed}
              onChange={(e) => setFormData({ ...formData, gallonsDispensed: e.target.value })}
              required
            />
          </div>

          <div>
            <label htmlFor="odometer">Odómetro (km)</label>
            <input
              id="odometer"
              type="number"
              min="0"
              value={formData.meterKm}
              onChange={(e) => setFormData({ ...formData, meterKm: e.target.value })}
            />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="notes">Observaciones</label>
            <textarea
              id="notes"
              rows={2}
              placeholder="Notas..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          {totalCost > 0 && (
            <div style={{ gridColumn: '1 / -1', background: 'rgba(37, 99, 235, 0.1)', border: '1px solid rgba(96, 165, 250, 0.2)', padding: '0.875rem 1rem', borderRadius: '10px', fontSize: '14px', color: '#cbd5e1' }}>
              <strong style={{ color: '#e2e8f0' }}>💰 Total estimado:</strong>{' '}
              <span style={{ fontSize: '20px', fontWeight: '700', color: '#93c5fd' }}>{formatMoney(totalCost)}</span>
            </div>
          )}

          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn-success" style={{ flex: 1 }}>
              ✓ Guardar
            </button>
            <button type="button" className="btn-ghost" onClick={() => setFormData({ truckId: '', station: '', dieselPriceGtq: memPrice?.dieselPrecio.toString() || '', gallonsDispensed: '', meterKm: '', notes: '' })}>
              Limpiar
            </button>
          </div>
        </form>
      </article>

      {/* Historial */}
      <article className="card">
        <h2>📊 Historial</h2>
        <div style={{ marginBottom: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          <div>
            <label htmlFor="filtro-truck" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '12px' }}>Filtrar por Camión</label>
            <select id="filtro-truck" value={filtroTruck} onChange={(e) => setFiltroTruck(e.target.value)}>
              <option value="">Todos</option>
              {dashboard.trucks.map((t) => (
                <option key={t.id} value={t.id}>{t.plate}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Total gastado ({records.length} registros)</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fbbf24' }}>{formatMoney(totalFuelSpent)}</div>
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Camión</th>
                <th>Gasolinera</th>
                <th style={{ textAlign: 'right' }}>Galones</th>
                <th style={{ textAlign: 'right' }}>Precio</th>
                <th style={{ textAlign: 'right' }}>Total</th>
                <th style={{ textAlign: 'center' }}>Odóm</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  <td>{new Date(record.recorded_at).toLocaleDateString('es-GT')}</td>
                  <td style={{ fontWeight: '500' }}>{record.truck_plate || '-'}</td>
                  <td>{record.station}</td>
                  <td style={{ textAlign: 'right' }}>{Number(record.gallons_dispensed ?? 0).toFixed(1)}</td>
                  <td style={{ textAlign: 'right' }}>Q{Number(record.diesel_price_gtq ?? 0).toFixed(2)}</td>
                  <td style={{ textAlign: 'right', fontWeight: '600', color: '#fbbf24' }}>{formatMoney(record.total_cost_gtq ?? 0)}</td>
                  <td style={{ textAlign: 'center' }}>{record.meter_km ? `${record.meter_km}` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {records.length === 0 && <p style={{ textAlign: 'center', color: '#64748b', marginTop: '2rem', padding: '2rem' }}>📭 Sin registros</p>}
      </article>
    </section>
  )
}
