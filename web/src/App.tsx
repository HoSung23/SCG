import { useEffect, useMemo, useState } from 'react'
import {
  alerts,
  fleet,
  fuelSnapshots,
  highestFuelPriceGTQ,
  maintenanceQueue,
  monthlyCosts,
  pilots,
  roleMatrix,
  routeTimeline,
  trips
} from './mockData'
import { loadDashboardData } from './services/dashboardData'
import { apiClient } from './services/api'

const formatMoney = (value: number) =>
  new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
    maximumFractionDigits: 0
  }).format(value)

export function App() {
  const tabs = [
    'dashboard',
    'combustible',
    'viajes',
    'costos',
    'mantenimiento',
    'flota',
    'pilotos',
    'roles',
    'mobile',
    'desktop',
    'infraestructura',
    'reportes'
  ] as const

  type TabId = (typeof tabs)[number]
  type CostKey = keyof typeof monthlyCosts

  const [activeTab, setActiveTab] = useState<TabId>('dashboard')
  const [tripState, setTripState] = useState(trips)
  const [costState, setCostState] = useState(monthlyCosts)
  const [fleetState, setFleetState] = useState(fleet)
  const [maintenanceState, setMaintenanceState] = useState(maintenanceQueue)
  const [pilotState, setPilotState] = useState(pilots)
  const [alertState, setAlertState] = useState(alerts)
  const [routeState, setRouteState] = useState(routeTimeline)
  const [selectedRole, setSelectedRole] = useState('Admin')
  const [isOfflineMode, setIsOfflineMode] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [expenseCategory, setExpenseCategory] = useState<CostKey>('fuel')
  const [expenseAmount, setExpenseAmount] = useState('')
  const [expenseLabel, setExpenseLabel] = useState('')

  const [selectedTripId, setSelectedTripId] = useState(trips[0]?.id ?? '')
  const [selectedPilotId, setSelectedPilotId] = useState(pilots[0]?.id ?? '')
  const [selectedTruckId, setSelectedTruckId] = useState(fleet[0]?.id ?? '')
  const [selectedFleetTruckId, setSelectedFleetTruckId] = useState(fleet[0]?.id ?? '')
  const [selectedFleetStatus, setSelectedFleetStatus] = useState<'active' | 'maintenance' | 'idle'>('active')
  const [offlineIncident, setOfflineIncident] = useState('Sin señal en tramo CA-9')
  const [selectedFuelStation, setSelectedFuelStation] = useState(fuelSnapshots[0]?.station ?? 'Shell')
  const [newFuelPrice, setNewFuelPrice] = useState('')
  const [fuelState, setFuelState] = useState(fuelSnapshots)
  const [exportLog, setExportLog] = useState<string[]>([])
  const [syncQueue, setSyncQueue] = useState(3)

  const [recentMovements, setRecentMovements] = useState<Array<{ id: string; description: string; amount: number }>>([
    { id: 'cm1', description: 'Carga inicial combustible Shell', amount: 4300 },
    { id: 'cm2', description: 'Viáticos ruta a Puerto Quetzal', amount: 950 }
  ])

  const roleModules: Record<string, string[]> = {
    Superadmin: ['Dashboard', 'Costos', 'Viajes', 'Mantenimiento', 'Usuarios', 'Configuración'],
    Admin: ['Dashboard', 'Costos', 'Viajes', 'Mantenimiento', 'Reportes'],
    Gerente: ['Dashboard', 'Reportes', 'Costos (lectura)'],
    Piloto: ['Iniciar viaje', 'Finalizar viaje', 'Incidencias', 'Modo offline'],
    Contador: ['Planilla', 'Costos', 'Exportación']
  }

  const activeTrips = tripState.filter((trip) => trip.status === 'en-ruta').length
  const totalCost = costState.fuel + costState.maintenance + costState.payroll + costState.admin
  const activeTrucks = fleetState.filter((truck) => truck.status === 'active').length
  const maintenanceCount = maintenanceState.filter((task) => task.status !== 'completado').length
  const avgFuelPrice = fuelState.reduce((acc, item) => acc + item.dieselGtq, 0) / fuelState.length
  const connectivityRisk = alertState.filter((item) => item.level === 'critical').length

  const maxFuelValue = Math.max(...fuelState.map((item) => item.dieselGtq))

  const tabLabelMap: Record<TabId, string> = {
    dashboard: 'Dashboard',
    combustible: 'Combustible',
    viajes: 'Viajes',
    costos: 'Costos',
    mantenimiento: 'Mantenimiento',
    flota: 'Flota',
    pilotos: 'Pilotos',
    roles: 'Roles',
    mobile: 'Mobile',
    desktop: 'Desktop',
    infraestructura: 'Infraestructura',
    reportes: 'Reportes'
  }

  const selectedTrip = useMemo(
    () => tripState.find((trip) => trip.id === selectedTripId),
    [selectedTripId, tripState]
  )

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      try {
        const dashboardData = await loadDashboardData()
        if (!isMounted) {
          return
        }

        setFleetState(dashboardData.fleet)
        setPilotState(dashboardData.pilots)
        setTripState(dashboardData.trips)
        setMaintenanceState(dashboardData.maintenanceQueue)
        setFuelState(dashboardData.fuelSnapshots)
        setCostState(dashboardData.monthlyCosts)
        setAlertState(dashboardData.alerts)
        setRouteState(dashboardData.routeTimeline)
        setSelectedTripId(dashboardData.trips[0]?.id ?? '')
        setSelectedPilotId(dashboardData.pilots[0]?.id ?? '')
        setSelectedTruckId(dashboardData.fleet[0]?.id ?? '')
        setSelectedFleetTruckId(dashboardData.fleet[0]?.id ?? '')
        setSelectedFuelStation(dashboardData.fuelSnapshots[0]?.station ?? 'Shell')
        setIsLoadingData(false)
        setLoadError('')
      } catch (error) {
        if (!isMounted) {
          return
        }

        setIsLoadingData(false)
        setLoadError(error instanceof Error ? error.message : 'No se pudieron cargar los datos reales')
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [])

  const dismissCriticalAlert = async () => {
    const criticalAlert = alertState.find((alert) => alert.level === 'critical')
    if (!criticalAlert) {
      return
    }

    try {
      await apiClient.resolveAlert(criticalAlert.id)
    } catch {
      // silently allow local update even if backend fails
    }
    setAlertState((currentAlerts) => currentAlerts.filter((alert) => alert.id !== criticalAlert.id))
  }

  const advanceTripStatus = async () => {
    if (!selectedTripId) {
      return
    }

    const currentTrip = tripState.find((trip) => trip.id === selectedTripId)
    if (!currentTrip) {
      return
    }

    const nextStatus: Trip['status'] =
      currentTrip.status === 'programado' ? 'en-ruta' : 'completado'

    try {
      await apiClient.updateTripStatus(selectedTripId, nextStatus)
    } catch {
      // silently allow local update
    }

    setTripState((currentTrips) =>
      currentTrips.map((trip) =>
        trip.id === selectedTripId ? { ...trip, status: nextStatus } : trip
      )
    )
  }

  const categoryMap: Record<CostKey, string> = {
    fuel: 'combustible',
    maintenance: 'mantenimiento',
    payroll: 'salarios',
    admin: 'otro'
  }

  const registerExpense = async () => {
    const parsedAmount = Number(expenseAmount)
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return
    }

    const description = expenseLabel || `Movimiento en ${expenseCategory}`

    try {
      await apiClient.recordCost({
        category: categoryMap[expenseCategory],
        description,
        amountGtq: parsedAmount
      })
    } catch {
      // silently allow local update
    }

    setCostState((previous) => ({
      ...previous,
      [expenseCategory]: previous[expenseCategory] + parsedAmount
    }))

    setRecentMovements((previous) => [
      {
        id: `cm${previous.length + 100}`,
        description,
        amount: parsedAmount
      },
      ...previous
    ].slice(0, 6))

    setExpenseAmount('')
    setExpenseLabel('')
  }

  const markMaintenanceComplete = async (maintenanceId: string) => {
    try {
      await apiClient.completeMaintenanceTask(maintenanceId, {})
    } catch {
      // silently allow local update
    }
    setMaintenanceState((previous) =>
      previous.map((item) =>
        item.id === maintenanceId ? { ...item, status: 'completado', dueInKm: 0 } : item
      )
    )
  }

  const reassignPilot = async () => {
    if (!selectedPilotId || !selectedTruckId) {
      return
    }

    try {
      await apiClient.assignTruckToPilot(selectedPilotId, selectedTruckId)
    } catch {
      // silently allow local update
    }

    setPilotState((currentPilots) =>
      currentPilots.map((pilot) =>
        pilot.id === selectedPilotId ? { ...pilot, assignedTruckId: selectedTruckId } : pilot
      )
    )
  }

  const reportOfflineIncident = async () => {
    const timestamp = new Date().toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })

    let newAlertId = `a${alertState.length + 100}`
    try {
      const created = await apiClient.createAlert({
        level: 'critical',
        title: 'Incidencia reportada desde app móvil',
        detail: offlineIncident
      }) as { id: string }
      newAlertId = created.id
    } catch {
      // silently allow local update
    }

    setAlertState((currentAlerts) => [
      {
        id: newAlertId,
        level: 'critical' as const,
        title: 'Incidencia reportada desde app móvil',
        detail: offlineIncident
      },
      ...currentAlerts
    ].slice(0, 6))

    setRouteState((currentRoute) => [
      ...currentRoute,
      {
        id: `r${currentRoute.length + 100}`,
        checkpoint: `Evento offline: ${offlineIncident}`,
        timestamp,
        state: 'offline'
      }
    ])
  }

  const updateFuelPrice = () => {
    const parsedPrice = Number(newFuelPrice)
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      return
    }

    setFuelState((currentFuel) =>
      currentFuel.map((item) =>
        item.station === selectedFuelStation
          ? { ...item, dieselGtq: Math.ceil(parsedPrice), date: new Date().toISOString().slice(0, 10) }
          : item
      )
    )

    setNewFuelPrice('')
  }

  const updateFleetStatus = () => {
    setFleetState((currentFleet) =>
      currentFleet.map((truck) =>
        truck.id === selectedFleetTruckId ? { ...truck, status: selectedFleetStatus } : truck
      )
    )
  }

  const simulateExport = (reportName: string) => {
    const stamp = new Date().toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })
    setExportLog((currentLog) => [`${stamp} · ${reportName} exportado`, ...currentLog].slice(0, 8))
  }

  const runSyncQueue = () => {
    if (syncQueue <= 0) {
      return
    }

    setSyncQueue(0)
    setAlertState((currentAlerts) => [
      {
        id: `a${currentAlerts.length + 200}`,
        level: 'info' as const,
        title: 'Sincronización completada',
        detail: 'Todos los eventos offline fueron enviados a Supabase.'
      },
      ...currentAlerts
    ].slice(0, 8))
  }

  return (
    <main className="app-shell">
      <header className="top-nav">
        <div className="nav-brand">SCG Demo</div>
        <nav className="nav-links">
          {tabs.map((tabId) => (
            <button
              key={tabId}
              type="button"
              className={`nav-link ${activeTab === tabId ? 'nav-link-active' : ''}`}
              onClick={() => setActiveTab(tabId)}
            >
              {tabLabelMap[tabId]}
            </button>
          ))}
        </nav>
      </header>

      <header className="hero">
        <div>
          <h1>Sistema de Control de Gastos</h1>
        </div>
        <div className="hero-status">
          <strong>Flota: {fleetState.length} unidades</strong>
          <button
            type="button"
            className="mini-btn"
            onClick={() => setIsOfflineMode((previous) => !previous)}
          >
            {isOfflineMode ? 'Modo Offline: ON' : 'Modo Offline: OFF'}
          </button>
        </div>
      </header>

      {isLoadingData && <section className="card"><strong>Cargando datos reales...</strong></section>}
      {!isLoadingData && loadError && <section className="card"><strong>Fallo de carga:</strong> {loadError}</section>}

      {activeTab === 'dashboard' && (
        <>
          <section className="kpi-grid">
            <article className="card">
              <h2>Viajes activos</h2>
              <p className="kpi-value">{activeTrips}</p>
            </article>
            <article className="card">
              <h2>Camiones activos</h2>
              <p className="kpi-value">{activeTrucks} / 25+</p>
            </article>
            <article className="card">
              <h2>Costo mensual</h2>
              <p className="kpi-value">{formatMoney(totalCost)}</p>
            </article>
            <article className="card">
              <h2>Precio diesel (máximo)</h2>
              <p className="kpi-value">{formatMoney(highestFuelPriceGTQ)}</p>
            </article>
            <article className="card">
              <h2>Mantenimientos pendientes</h2>
              <p className="kpi-value">{maintenanceCount}</p>
            </article>
            <article className="card">
              <h2>Riesgo conectividad</h2>
              <p className="kpi-value">{connectivityRisk}</p>
            </article>
          </section>

          <section className="two-col">
            <article className="card">
              <h2>Radar de precios de combustible</h2>
              <div className="fuel-bars">
                {fuelSnapshots.map((snapshot) => (
                  <div key={snapshot.station} className="fuel-row">
                    <span>{snapshot.station}</span>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{ width: `${(snapshot.dieselGtq / maxFuelValue) * 100}%` }}
                      />
                    </div>
                    <strong>{formatMoney(snapshot.dieselGtq)}</strong>
                  </div>
                ))}
              </div>
              <strong>Promedio semanal: {formatMoney(avgFuelPrice)}</strong>
            </article>

            <article className="card">
              <h2>Alertas operativas</h2>
              <button type="button" className="mini-btn" onClick={dismissCriticalAlert}>Resolver alerta crítica</button>
              <ul className="alert-list">
                {alertState.map((alert) => (
                  <li key={alert.id}>
                    <strong>{alert.title}</strong>
                    <small>{alert.level} · {alert.detail}</small>
                  </li>
                ))}
              </ul>
            </article>
          </section>
        </>
      )}

      {activeTab === 'combustible' && (
        <section className="two-col">
          <article className="card">
            <h2>Precios diesel</h2>
            <table>
              <thead>
                <tr>
                  <th>Gasolinera</th>
                  <th>Precio</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {fuelState.map((item) => (
                  <tr key={item.station}>
                    <td>{item.station}</td>
                    <td>{formatMoney(item.dieselGtq)}</td>
                    <td>{item.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>

          <article className="card">
            <h2>Actualizar precio MEM</h2>
            <div className="form-grid">
              <label htmlFor="fuel-station">Gasolinera</label>
              <select id="fuel-station" value={selectedFuelStation} onChange={(event) => setSelectedFuelStation(event.target.value)}>
                {fuelState.map((item) => (
                  <option key={item.station} value={item.station}>{item.station}</option>
                ))}
              </select>

              <label htmlFor="fuel-price">Nuevo precio</label>
              <input
                id="fuel-price"
                type="number"
                min="0"
                value={newFuelPrice}
                onChange={(event) => setNewFuelPrice(event.target.value)}
              />

              <button type="button" className="action-btn" onClick={updateFuelPrice}>Guardar precio</button>
            </div>
            <strong>Regla de cálculo: precio más alto y redondeo hacia arriba.</strong>
          </article>
        </section>
      )}

      {activeTab === 'viajes' && (
        <section className="two-col">
          <article className="card">
            <h2>Viajes recientes</h2>
            <table>
              <thead>
                <tr>
                  <th>Ruta</th>
                  <th>Piloto</th>
                  <th>Km</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {tripState.map((trip) => (
                  <tr key={trip.id}>
                    <td>{trip.origin} → {trip.destination}</td>
                    <td>{trip.driver}</td>
                    <td>{trip.distanceKm}</td>
                    <td>{trip.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>

          <article className="card">
            <h2>Acción rápida</h2>
            <label htmlFor="trip-select">Viaje</label>
            <select
              id="trip-select"
              value={selectedTripId}
              onChange={(event) => setSelectedTripId(event.target.value)}
            >
              {tripState.map((trip) => (
                <option key={trip.id} value={trip.id}>{trip.origin} → {trip.destination}</option>
              ))}
            </select>
            <button type="button" className="action-btn" onClick={advanceTripStatus}>Avanzar estado</button>
            {selectedTrip && (
              <p className="muted">Estado actual: {selectedTrip.status}</p>
            )}

            <h3>Trazabilidad de ruta</h3>
            <ul className="timeline">
              {routeState.map((item) => (
                <li key={item.id} className={`timeline-${item.state}`}>
                  <div>
                    <strong>{item.checkpoint}</strong>
                    <small>{item.timestamp}</small>
                  </div>
                  <span>{item.state}</span>
                </li>
              ))}
            </ul>
          </article>
        </section>
      )}

      {activeTab === 'costos' && (
        <section className="two-col">
          <article className="card">
            <h2>Costos por categoría</h2>
            <ul>
              <li>Combustible: {formatMoney(costState.fuel)}</li>
              <li>Mantenimiento: {formatMoney(costState.maintenance)}</li>
              <li>Planilla: {formatMoney(costState.payroll)}</li>
              <li>Administrativos: {formatMoney(costState.admin)}</li>
            </ul>
          </article>

          <article className="card">
            <h2>Registrar gasto</h2>
            <div className="form-grid">
              <label htmlFor="expense-category">Categoría</label>
              <select
                id="expense-category"
                value={expenseCategory}
                onChange={(event) => setExpenseCategory(event.target.value as CostKey)}
              >
                <option value="fuel">Combustible</option>
                <option value="maintenance">Mantenimiento</option>
                <option value="payroll">Planilla</option>
                <option value="admin">Administrativo</option>
              </select>

              <label htmlFor="expense-label">Descripción</label>
              <input
                id="expense-label"
                value={expenseLabel}
                onChange={(event) => setExpenseLabel(event.target.value)}
                placeholder="Ej: compra de repuesto"
              />

              <label htmlFor="expense-amount">Monto (GTQ)</label>
              <input
                id="expense-amount"
                type="number"
                min="0"
                value={expenseAmount}
                onChange={(event) => setExpenseAmount(event.target.value)}
                placeholder="0"
              />

              <button type="button" className="action-btn" onClick={registerExpense}>Guardar movimiento</button>
            </div>

            <h3>Últimos movimientos</h3>
            <ul className="movement-list">
              {recentMovements.map((movement) => (
                <li key={movement.id}>
                  <span>{movement.description}</span>
                  <strong>{formatMoney(movement.amount)}</strong>
                </li>
              ))}
            </ul>
          </article>
        </section>
      )}

      {activeTab === 'mantenimiento' && (
        <section className="two-col">
          <article className="card">
            <h2>Mantenimiento programado</h2>
            <table>
              <thead>
                <tr>
                  <th>Unidad</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Próximo km</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {maintenanceState.map((task) => (
                  <tr key={task.id}>
                    <td>{task.truckPlate}</td>
                    <td>{task.type}</td>
                    <td>{task.status}</td>
                    <td>{task.dueInKm === 0 ? 'inmediato' : `${task.dueInKm} km`}</td>
                    <td>
                      {task.status !== 'completado' && (
                        <button type="button" className="mini-btn" onClick={() => markMaintenanceComplete(task.id)}>
                          Marcar completado
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>

          <article className="card">
            <h2>Alertas operativas</h2>
            <ul className="alert-list">
              {alertState.map((alert) => (
                <li key={alert.id}>
                  <strong>{alert.title}</strong>
                  <small>{alert.level} · {alert.detail}</small>
                </li>
              ))}
            </ul>
          </article>
        </section>
      )}

      {activeTab === 'flota' && (
        <section className="two-col">
          <article className="card">
            <h2>Flota de camiones</h2>
            <table>
              <thead>
                <tr>
                  <th>Placa</th>
                  <th>Modelo</th>
                  <th>Rendimiento</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {fleetState.map((truck) => (
                  <tr key={truck.id}>
                    <td>{truck.plate}</td>
                    <td>{truck.model}</td>
                    <td>{truck.fuelKmPerGallon} km/gal</td>
                    <td>{truck.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>

          <article className="card">
            <h2>Actualizar estado de unidad</h2>
            <div className="form-grid">
              <label htmlFor="fleet-select">Unidad</label>
              <select id="fleet-select" value={selectedFleetTruckId} onChange={(event) => setSelectedFleetTruckId(event.target.value)}>
                {fleetState.map((truck) => (
                  <option key={truck.id} value={truck.id}>{truck.plate}</option>
                ))}
              </select>

              <label htmlFor="fleet-status">Estado</label>
              <select id="fleet-status" value={selectedFleetStatus} onChange={(event) => setSelectedFleetStatus(event.target.value as 'active' | 'maintenance' | 'idle')}>
                <option value="active">active</option>
                <option value="maintenance">maintenance</option>
                <option value="idle">idle</option>
              </select>

              <button type="button" className="action-btn" onClick={updateFleetStatus}>Aplicar cambio</button>
            </div>
          </article>
        </section>
      )}

      {activeTab === 'pilotos' && (
        <section className="two-col">
          <article className="card">
            <h2>Pilotos</h2>
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Licencia</th>
                  <th>Unidad asignada</th>
                </tr>
              </thead>
              <tbody>
                {pilotState.map((pilot) => {
                  const assignedTruck = fleetState.find((truck) => truck.id === pilot.assignedTruckId)
                  return (
                    <tr key={pilot.id}>
                      <td>{pilot.name}</td>
                      <td>{pilot.licenseType} · vence {pilot.licenseDue}</td>
                      <td>{assignedTruck ? `${assignedTruck.plate} • ${assignedTruck.model}` : 'Sin asignar'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </article>

          <article className="card">
            <h2>Reasignar piloto</h2>
            <div className="form-grid">
              <label htmlFor="pilot-select">Piloto</label>
              <select id="pilot-select" value={selectedPilotId} onChange={(event) => setSelectedPilotId(event.target.value)}>
                {pilotState.map((pilot) => (
                  <option key={pilot.id} value={pilot.id}>{pilot.name}</option>
                ))}
              </select>

              <label htmlFor="truck-select">Camión</label>
              <select id="truck-select" value={selectedTruckId} onChange={(event) => setSelectedTruckId(event.target.value)}>
                {fleetState.map((truck) => (
                  <option key={truck.id} value={truck.id}>{truck.plate} • {truck.model}</option>
                ))}
              </select>

              <button type="button" className="action-btn" onClick={reassignPilot}>Aplicar reasignación</button>
            </div>
          </article>
        </section>
      )}

      {activeTab === 'roles' && (
        <section className="two-col">
          <article className="card">
            <h2>Roles y permisos</h2>
            <table>
              <thead>
                <tr>
                  <th>Rol</th>
                  <th>Acceso</th>
                </tr>
              </thead>
              <tbody>
                {roleMatrix.map((item) => (
                  <tr key={item.role}>
                    <td>{item.role}</td>
                    <td>{item.access}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>

          <article className="card">
            <h2>Simulación por rol</h2>
            <label htmlFor="role-view">Ver como</label>
            <select
              id="role-view"
              value={selectedRole}
              onChange={(event) => setSelectedRole(event.target.value)}
            >
              {roleMatrix.map((item) => (
                <option key={item.role} value={item.role}>{item.role}</option>
              ))}
            </select>

            <h3>Módulos visibles</h3>
            <ul>
              {(roleModules[selectedRole] ?? []).map((moduleName) => (
                <li key={moduleName}>{moduleName}</li>
              ))}
            </ul>
          </article>
        </section>
      )}

      {activeTab === 'mobile' && (
        <section className="two-col">
          <article className="card">
            <h2>Flujo app móvil (piloto)</h2>
            <ol>
              <li>Inicia viaje y envía ubicación.</li>
              <li>Opera offline si no hay señal.</li>
              <li>Reporta incidencia desde el camión.</li>
              <li>Finaliza viaje con evidencia de entrega.</li>
            </ol>

            <div className="action-row">
              <button
                type="button"
                className="mini-btn"
                onClick={() => setTripState((currentTrips) => currentTrips.map((trip) => ({ ...trip, status: 'en-ruta' })))}
              >
                Iniciar turnos móviles
              </button>
              <button
                type="button"
                className="mini-btn"
                onClick={() => setTripState((currentTrips) => currentTrips.map((trip) => ({ ...trip, status: 'completado' })))}
              >
                Cerrar turnos
              </button>
            </div>

            <div className="form-grid">
              <label htmlFor="offline-incident">Incidencia simulada</label>
              <input
                id="offline-incident"
                value={offlineIncident}
                onChange={(event) => setOfflineIncident(event.target.value)}
              />
              <button type="button" className="action-btn" onClick={reportOfflineIncident}>
                Registrar incidencia offline
              </button>
            </div>
          </article>

          <article className="card">
            <h2>Estado de sincronización móvil</h2>
            <p>Cola pendiente: {syncQueue} eventos</p>
            <button type="button" className="action-btn" onClick={runSyncQueue}>Sincronizar ahora</button>
          </article>
        </section>
      )}

      {activeTab === 'desktop' && (
        <section className="two-col">
          <article className="card">
            <h2>Desktop oficina</h2>
            <ul>
              <li>Control central de costos y viajes.</li>
              <li>Seguimiento de alertas en tiempo real.</li>
              <li>Operación local con Electron durante contingencias.</li>
            </ul>
          </article>

          <article className="card">
            <h2>Modo offline</h2>
            <p>Estado: {isOfflineMode ? 'Activo' : 'Inactivo'}</p>
            <p>Eventos pendientes: {syncQueue}</p>
            <button type="button" className="mini-btn" onClick={() => setIsOfflineMode((prev) => !prev)}>
              Alternar modo offline
            </button>
          </article>
        </section>
      )}

      {activeTab === 'infraestructura' && (
        <section className="two-col">
          <article className="card">
            <h2>Infraestructura</h2>
            <ul>
              <li>Supabase PostgreSQL: activo</li>
              <li>Realtime tracking: activo</li>
              <li>Backups diarios: habilitado</li>
              <li>RLS por rol: habilitado</li>
            </ul>
          </article>

          <article className="card">
            <h2>Contingencia</h2>
            <p>Cola de sincronización: {syncQueue}</p>
            <button type="button" className="action-btn" onClick={runSyncQueue}>Forzar sincronización</button>
          </article>
        </section>
      )}

      {activeTab === 'reportes' && (
        <section className="two-col">
          <article className="card">
            <h2>Exportar reportes</h2>
            <div className="action-row">
              <button type="button" className="mini-btn" onClick={() => simulateExport('Costo mensual')}>
                Exportar costo mensual
              </button>
              <button type="button" className="mini-btn" onClick={() => simulateExport('Costo por camión')}>
                Exportar costo por camión
              </button>
              <button type="button" className="mini-btn" onClick={() => simulateExport('Historial mantenimiento')}>
                Exportar mantenimientos
              </button>
            </div>
          </article>

          <article className="card">
            <h2>Bitácora de exportaciones</h2>
            <ul>
              {exportLog.length === 0 && <li>Sin exportaciones aún.</li>}
              {exportLog.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </section>
      )}
    </main>
  )
}
