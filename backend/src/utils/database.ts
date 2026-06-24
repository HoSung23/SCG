import { supabaseAdmin } from './supabase.js'
import type { Truck, Pilot, Trip, MaintenanceTask, FuelRecord, CostRecord, AlertItem } from '../types/index.js'

// ============ TRUCKS ============
export async function getAllTrucks() {
  const { data, error } = await supabaseAdmin.from('trucks').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data as Truck[]
}

export async function getTruckById(id: string) {
  const { data, error } = await supabaseAdmin.from('trucks').select('*').eq('id', id).single()
  if (error) throw error
  return data as Truck
}

export async function createTruck(truck: Omit<Truck, 'id' | 'createdAt' | 'updatedAt'>) {
  const { data, error } = await supabaseAdmin
    .from('trucks')
    .insert([{ ...truck, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
    .select()
    .single()
  if (error) throw error
  return data as Truck
}

export async function updateTruck(id: string, updates: Partial<Truck>) {
  const { data, error } = await supabaseAdmin
    .from('trucks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Truck
}

// ============ PILOTS ============
export async function getAllPilots() {
  const { data, error } = await supabaseAdmin.from('pilots').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data as Pilot[]
}

export async function getPilotById(id: string) {
  const { data, error } = await supabaseAdmin.from('pilots').select('*').eq('id', id).single()
  if (error) throw error
  return data as Pilot
}

export async function createPilot(pilot: Omit<Pilot, 'id' | 'createdAt' | 'updatedAt'>) {
  const { data, error } = await supabaseAdmin
    .from('pilots')
    .insert([{ ...pilot, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
    .select()
    .single()
  if (error) throw error
  return data as Pilot
}

export async function updatePilot(id: string, updates: Partial<Pilot>) {
  const { data, error } = await supabaseAdmin
    .from('pilots')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Pilot
}

// ============ TRIPS ============
export async function getAllTrips() {
  const { data, error } = await supabaseAdmin.from('trips').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data as Trip[]
}

export async function getTripsByDateRange(startDate?: string, endDate?: string, status?: string) {
  let query = supabaseAdmin
    .from('trips')
    .select('*')
    .order('scheduled_start', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(500)

  if (startDate) query = query.gte('scheduled_start', `${startDate}T00:00:00`)
  if (endDate) query = query.lte('scheduled_start', `${endDate}T23:59:59`)
  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) throw error
  return data as Trip[]
}

export async function getTripById(id: string) {
  const { data, error } = await supabaseAdmin.from('trips').select('*').eq('id', id).single()
  if (error) throw error
  return data as Trip
}

export async function createTrip(trip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) {
  const { data, error } = await supabaseAdmin
    .from('trips')
    .insert([{ ...trip, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
    .select()
    .single()
  if (error) throw error
  return data as Trip
}

export async function updateTrip(id: string, updates: Partial<Trip>) {
  const { data, error } = await supabaseAdmin
    .from('trips')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Trip
}

// ============ MAINTENANCE ============
export async function getAllMaintenanceTasks() {
  const { data, error } = await supabaseAdmin
    .from('maintenance_tasks')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as MaintenanceTask[]
}

export async function createMaintenanceTask(task: Omit<MaintenanceTask, 'id' | 'createdAt' | 'updatedAt'>) {
  const { data, error } = await supabaseAdmin
    .from('maintenance_tasks')
    .insert([{ ...task, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
    .select()
    .single()
  if (error) throw error
  return data as MaintenanceTask
}

export async function updateMaintenanceTask(id: string, updates: Partial<MaintenanceTask>) {
  const { data, error } = await supabaseAdmin
    .from('maintenance_tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as MaintenanceTask
}

// ============ FUEL RECORDS ============
export async function getAllFuelRecords() {
  const { data, error } = await supabaseAdmin
    .from('fuel_records')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as FuelRecord[]
}

export async function createFuelRecord(record: Omit<FuelRecord, 'id' | 'createdAt' | 'updatedAt'>) {
  const { data, error } = await supabaseAdmin
    .from('fuel_records')
    .insert([{ ...record, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
    .select()
    .single()
  if (error) throw error
  return data as FuelRecord
}

// ============ COST RECORDS ============
export async function getAllCostRecords() {
  const { data, error } = await supabaseAdmin
    .from('cost_records')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as CostRecord[]
}

export async function createCostRecord(record: Omit<CostRecord, 'id' | 'createdAt' | 'updatedAt'>) {
  const { data, error } = await supabaseAdmin
    .from('cost_records')
    .insert([{ ...record, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
    .select()
    .single()
  if (error) throw error
  return data as CostRecord
}

// ============ ALERTS ============
export async function getAllAlerts() {
  const { data, error } = await supabaseAdmin.from('alerts').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data as AlertItem[]
}

export async function createAlert(alert: Omit<AlertItem, 'id' | 'createdAt' | 'updatedAt'>) {
  const { data, error } = await supabaseAdmin
    .from('alerts')
    .insert([{ ...alert, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
    .select()
    .single()
  if (error) throw error
  return data as AlertItem
}

export async function resolveAlert(id: string) {
  const { data, error } = await supabaseAdmin
    .from('alerts')
    .update({ resolved: true, resolved_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as AlertItem
}
