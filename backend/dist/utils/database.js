import { supabaseAdmin } from './supabase.js';
// ============ TRUCKS ============
export async function getAllTrucks() {
    const { data, error } = await supabaseAdmin.from('trucks').select('*').order('created_at', { ascending: false });
    if (error)
        throw error;
    return data;
}
export async function getTruckById(id) {
    const { data, error } = await supabaseAdmin.from('trucks').select('*').eq('id', id).single();
    if (error)
        throw error;
    return data;
}
export async function createTruck(truck) {
    const { data, error } = await supabaseAdmin
        .from('trucks')
        .insert([{ ...truck, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
        .select()
        .single();
    if (error)
        throw error;
    return data;
}
export async function updateTruck(id, updates) {
    const { data, error } = await supabaseAdmin
        .from('trucks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
    if (error)
        throw error;
    return data;
}
// ============ PILOTS ============
export async function getAllPilots() {
    const { data, error } = await supabaseAdmin.from('pilots').select('*').order('created_at', { ascending: false });
    if (error)
        throw error;
    return data;
}
export async function getPilotById(id) {
    const { data, error } = await supabaseAdmin.from('pilots').select('*').eq('id', id).single();
    if (error)
        throw error;
    return data;
}
export async function createPilot(pilot) {
    const { data, error } = await supabaseAdmin
        .from('pilots')
        .insert([{ ...pilot, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
        .select()
        .single();
    if (error)
        throw error;
    return data;
}
export async function updatePilot(id, updates) {
    const { data, error } = await supabaseAdmin
        .from('pilots')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
    if (error)
        throw error;
    return data;
}
// ============ TRIPS ============
export async function getAllTrips() {
    const { data, error } = await supabaseAdmin.from('trips').select('*').order('created_at', { ascending: false });
    if (error)
        throw error;
    return data;
}
export async function getTripById(id) {
    const { data, error } = await supabaseAdmin.from('trips').select('*').eq('id', id).single();
    if (error)
        throw error;
    return data;
}
export async function createTrip(trip) {
    const { data, error } = await supabaseAdmin
        .from('trips')
        .insert([{ ...trip, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
        .select()
        .single();
    if (error)
        throw error;
    return data;
}
export async function updateTrip(id, updates) {
    const { data, error } = await supabaseAdmin
        .from('trips')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
    if (error)
        throw error;
    return data;
}
// ============ MAINTENANCE ============
export async function getAllMaintenanceTasks() {
    const { data, error } = await supabaseAdmin
        .from('maintenance_tasks')
        .select('*')
        .order('created_at', { ascending: false });
    if (error)
        throw error;
    return data;
}
export async function createMaintenanceTask(task) {
    const { data, error } = await supabaseAdmin
        .from('maintenance_tasks')
        .insert([{ ...task, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
        .select()
        .single();
    if (error)
        throw error;
    return data;
}
export async function updateMaintenanceTask(id, updates) {
    const { data, error } = await supabaseAdmin
        .from('maintenance_tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
    if (error)
        throw error;
    return data;
}
// ============ FUEL RECORDS ============
export async function getAllFuelRecords() {
    const { data, error } = await supabaseAdmin
        .from('fuel_records')
        .select('*')
        .order('created_at', { ascending: false });
    if (error)
        throw error;
    return data;
}
export async function createFuelRecord(record) {
    const { data, error } = await supabaseAdmin
        .from('fuel_records')
        .insert([{ ...record, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
        .select()
        .single();
    if (error)
        throw error;
    return data;
}
// ============ COST RECORDS ============
export async function getAllCostRecords() {
    const { data, error } = await supabaseAdmin
        .from('cost_records')
        .select('*')
        .order('created_at', { ascending: false });
    if (error)
        throw error;
    return data;
}
export async function createCostRecord(record) {
    const { data, error } = await supabaseAdmin
        .from('cost_records')
        .insert([{ ...record, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
        .select()
        .single();
    if (error)
        throw error;
    return data;
}
// ============ ALERTS ============
export async function getAllAlerts() {
    const { data, error } = await supabaseAdmin.from('alerts').select('*').order('created_at', { ascending: false });
    if (error)
        throw error;
    return data;
}
export async function createAlert(alert) {
    const { data, error } = await supabaseAdmin
        .from('alerts')
        .insert([{ ...alert, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
        .select()
        .single();
    if (error)
        throw error;
    return data;
}
export async function resolveAlert(id) {
    const { data, error } = await supabaseAdmin
        .from('alerts')
        .update({ resolved: true, resolved_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
    if (error)
        throw error;
    return data;
}
//# sourceMappingURL=database.js.map