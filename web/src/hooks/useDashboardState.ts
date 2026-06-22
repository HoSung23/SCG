import { useEffect, useMemo, useState } from 'react'
import { loadDashboardData } from '../services/dashboardData'
import type { AlertItem, CostSummary, FuelSnapshot, MaintenanceTask, Pilot, Trip, Truck } from '../types'

type TabId =
  | 'dashboard'
  | 'combustible'
  | 'viajes'
  | 'costos'
  | 'mantenimiento'
  | 'flota'
  | 'pilotos'
  | 'roles'
  | 'mobile'
  | 'desktop'
  | 'infraestructura'
  | 'reportes'

export function useDashboardState() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard')
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [trips, setTrips] = useState<Trip[]>([])
  const [maintenance, setMaintenance] = useState<MaintenanceTask[]>([])
  const [fuel, setFuel] = useState<FuelSnapshot[]>([])
  const [costs, setCosts] = useState<CostSummary>({ fuel: 0, maintenance: 0, payroll: 0, admin: 0 })
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [pilots, setPilots] = useState<Pilot[]>([])

  const [expenseForm, setExpenseForm] = useState({ type: 'maintenance', amount: '', description: '' })
  const [maintenanceForm, setMaintenanceForm] = useState({ truckId: '', type: 'preventivo', description: '', cost: '' })
  const [pilotForm, setPilotForm] = useState({ truckId: '', pilotId: '' })
  const [offlineForm, setOfflineForm] = useState({ truckId: '', reason: '' })
  const [fuelPriceForm, setFuelPriceForm] = useState({ newPrice: '' })
  const [fleetStatusForm, setFleetStatusForm] = useState({ truckId: '', newStatus: 'active' as Truck['status'] })

  const [isLoading, setIsLoading] = useState(false)
  const [offlineModeEnabled, setOfflineModeEnabled] = useState(false)

  useEffect(() => {
    const run = async () => {
      setIsLoading(true)
      try {
        const data = await loadDashboardData()
        setTrips(data.trips)
        setMaintenance(data.maintenanceQueue)
        setFuel(data.fuelSnapshots)
        setCosts(data.monthlyCosts)
        setTrucks(data.fleet)
        setPilots(data.pilots)
        setAlerts(data.alerts)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    void run()
  }, [])

  const dismissAlert = (alertId: string) => setAlerts((prev) => prev.filter((a) => a.id !== alertId))

  const advanceTripStatus = async (tripId: string) => {
    setTrips((prev) =>
      prev.map((trip) => {
        if (trip.id !== tripId) return trip
        if (trip.status === 'programado') return { ...trip, status: 'en-ruta' }
        if (trip.status === 'en-ruta') return { ...trip, status: 'completado' }
        return trip
      })
    )
  }

  const registerExpense = async () => {
    const amount = Number(expenseForm.amount)
    if (!Number.isFinite(amount) || amount <= 0) return
    setCosts((prev) =>
      expenseForm.type === 'fuel'
        ? { ...prev, fuel: prev.fuel + amount }
        : expenseForm.type === 'maintenance'
          ? { ...prev, maintenance: prev.maintenance + amount }
          : { ...prev, admin: prev.admin + amount }
    )
    setExpenseForm({ type: 'maintenance', amount: '', description: '' })
  }

  const markMaintenanceComplete = async (maintenanceId: string) => {
    setMaintenance((prev) => prev.map((item) => (item.id === maintenanceId ? { ...item, status: 'completado', dueInKm: 0 } : item)))
  }

  const reassignPilot = async () => {
    if (!pilotForm.pilotId || !pilotForm.truckId) return
    setPilots((prev) => prev.map((pilot) => (pilot.id === pilotForm.pilotId ? { ...pilot, assignedTruckId: pilotForm.truckId } : pilot)))
    setPilotForm({ truckId: '', pilotId: '' })
  }

  const reportOfflineIncident = async () => {
    setAlerts((prev) => [{ id: `alert-${Date.now()}`, level: 'critical', title: 'Incidencia móvil', detail: offlineForm.reason || 'Sin detalle' }, ...prev])
  }

  const updateFuelPrice = async () => {
    const price = Number(fuelPriceForm.newPrice)
    if (!Number.isFinite(price) || price <= 0) return
    setFuel((prev) => prev.map((item) => ({ ...item, dieselGtq: Math.ceil(price) })))
    setFuelPriceForm({ newPrice: '' })
  }

  const updateFleetStatus = async () => {
    if (!fleetStatusForm.truckId) return
    setTrucks((prev) => prev.map((truck) => (truck.id === fleetStatusForm.truckId ? { ...truck, status: fleetStatusForm.newStatus } : truck)))
    setFleetStatusForm({ truckId: '', newStatus: 'active' })
  }

  const activeTrips = useMemo(() => trips.filter((trip) => trip.status === 'en-ruta'), [trips])
  const completedTrips = useMemo(() => trips.filter((trip) => trip.status === 'completado'), [trips])
  const pendingMaintenance = useMemo(() => maintenance.filter((item) => item.status !== 'completado'), [maintenance])
  const availablePilots = useMemo(() => pilots.filter((pilot) => !pilot.assignedTruckId), [pilots])
  const activeTrucks = useMemo(() => trucks.filter((truck) => truck.status === 'active'), [trucks])
  const totalCosts = costs.fuel + costs.maintenance + costs.payroll + costs.admin

  return {
    activeTab,
    setActiveTab,
    alerts,
    trips,
    maintenance,
    fuel,
    costs,
    trucks,
    pilots,
    expenseForm,
    setExpenseForm,
    maintenanceForm,
    setMaintenanceForm,
    pilotForm,
    setPilotForm,
    offlineForm,
    setOfflineForm,
    fuelPriceForm,
    setFuelPriceForm,
    fleetStatusForm,
    setFleetStatusForm,
    isLoading,
    offlineModeEnabled,
    setOfflineModeEnabled,
    dismissAlert,
    advanceTripStatus,
    registerExpense,
    markMaintenanceComplete,
    reassignPilot,
    reportOfflineIncident,
    updateFuelPrice,
    updateFleetStatus,
    activeTrips,
    completedTrips,
    pendingMaintenance,
    availablePilots,
    activeTrucks,
    totalCosts
  }
}
