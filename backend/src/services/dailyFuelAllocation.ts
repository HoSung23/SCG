import { supabaseAdmin } from '../utils/supabase.js'

export type DailyFuelAllocation = {
  success: boolean
  truckCodigo: string
  truckId: string
  allocatedGallons: number
  estimatedKm: number
  fuelEfficiency: number
  message: string
  timestamp: string
}

/**
 * Calcula galones necesarios basado en km estimados del día y eficiencia del camión.
 * Retorna la asignación de combustible que se debe hacer antes de salir del predio.
 */
export async function calculateDailyFuelAllocation(
  truckCodigo: string,
  estimatedKm: number,
  fuelEfficiencyOverride?: number
): Promise<DailyFuelAllocation> {
  // 1. Obtener camión y su eficiencia de combustible
  const { data: truck, error: truckError } = await supabaseAdmin
    .from('trucks')
    .select('id, codigo, fuel_km_per_gallon')
    .eq('codigo', truckCodigo)
    .single()

  if (truckError || !truck) {
    return {
      success: false,
      truckCodigo,
      truckId: '',
      allocatedGallons: 0,
      estimatedKm,
      fuelEfficiency: 0,
      message: `Camión con código ${truckCodigo} no encontrado`,
      timestamp: new Date().toISOString()
    }
  }

  const fuelEfficiency = fuelEfficiencyOverride ?? truck.fuel_km_per_gallon ?? 8

  // 2. Calcular galones necesarios: km / eficiencia + 10% buffer
  const gallonsNeeded = (estimatedKm / fuelEfficiency) * 1.1 // 10% de buffer
  const allocatedGallons = Math.ceil(gallonsNeeded)

  return {
    success: true,
    truckCodigo,
    truckId: truck.id,
    allocatedGallons,
    estimatedKm,
    fuelEfficiency,
    message: `✓ Asignación de ${allocatedGallons} galones para ${estimatedKm}km (eficiencia: ${fuelEfficiency}km/gal)`,
    timestamp: new Date().toISOString()
  }
}

/**
 * Obtiene todos los viajes programados para hoy y calcula el combustible total requerido por camión.
 */
export async function calculateTodaysFuelNeeds(): Promise<Map<string, DailyFuelAllocation>> {
  const today = new Date().toISOString().split('T')[0]

  // 1. Obtener viajes de hoy (programado o en ruta)
  const { data: trips, error } = await supabaseAdmin
    .from('trips')
    .select('truck_codigo, distance_km, trucks(fuel_km_per_gallon)')
    .or('status.eq.programado, status.eq.en_ruta')
    .gte('scheduled_start', `${today}T00:00:00`)
    .lte('scheduled_start', `${today}T23:59:59`)

  if (error) {
    console.error('Error fetching today trips:', error)
    return new Map()
  }

  // 2. Agrupar por truck_codigo y sumar km
  const truckKmMap = new Map<string, { totalKm: number; fuelEfficiency: number }>()

  trips.forEach((trip: any) => {
    if (!trip.truck_codigo) return

    const current = truckKmMap.get(trip.truck_codigo) || { totalKm: 0, fuelEfficiency: 8 }
    current.totalKm += trip.distance_km || 0
    if (trip.trucks?.fuel_km_per_gallon) {
      current.fuelEfficiency = trip.trucks.fuel_km_per_gallon
    }
    truckKmMap.set(trip.truck_codigo, current)
  })

  // 3. Calcular asignaciones por camión
  const allocations = new Map<string, DailyFuelAllocation>()

  for (const [truckCodigo, { totalKm, fuelEfficiency }] of truckKmMap) {
    const allocation = await calculateDailyFuelAllocation(truckCodigo, totalKm, fuelEfficiency)
    allocations.set(truckCodigo, allocation)
  }

  return allocations
}

/**
 * Retorna recomendaciones de combustible para todo el día.
 * Se ejecuta típicamente antes de que salgan del predio (6am-7am).
 */
export async function getDailyFuelReport(): Promise<{
  date: string
  generatedAt: string
  totalAllocations: number
  trucks: DailyFuelAllocation[]
  totalGallonsNeeded: number
  message: string
}> {
  const allocations = await calculateTodaysFuelNeeds()
  const trucks = Array.from(allocations.values())
  const totalGallons = trucks.reduce((sum, a) => sum + a.allocatedGallons, 0)

  return {
    date: new Date().toISOString().split('T')[0],
    generatedAt: new Date().toISOString(),
    totalAllocations: trucks.length,
    trucks,
    totalGallonsNeeded: totalGallons,
    message: `Reporte de combustible para ${trucks.length} camión(es). Total: ${totalGallons} galones recomendados.`
  }
}
