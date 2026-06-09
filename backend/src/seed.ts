import { supabaseAdmin } from './utils/supabase.js'

const TRUCKS = [
  { plate: 'C-001BCD', model: 'Freightliner Cascadia 2022', year: 2022, fuelKmPerGallon: 8.5, ownershipType: 'propia' },
  { plate: 'C-002BCD', model: 'Kenworth T680 2021', year: 2021, fuelKmPerGallon: 7.8, ownershipType: 'propia' },
  { plate: 'C-003BCD', model: 'International LT 2023', year: 2023, fuelKmPerGallon: 9.2, ownershipType: 'arrendada' },
  { plate: 'C-004BCD', model: 'Volvo FH16 2020', year: 2020, fuelKmPerGallon: 7.5, ownershipType: 'propia' },
  { plate: 'C-005BCD', model: 'Scania R490 2022', year: 2022, fuelKmPerGallon: 8.1, ownershipType: 'propia' },
  { plate: 'C-006BCD', model: 'MAN TGX 2021', year: 2021, fuelKmPerGallon: 7.9, ownershipType: 'arrendada' },
  { plate: 'C-007BCD', model: 'Freightliner Cascadia 2023', year: 2023, fuelKmPerGallon: 8.8, ownershipType: 'propia' },
  { plate: 'C-008BCD', model: 'Kenworth W900 2020', year: 2020, fuelKmPerGallon: 7.2, ownershipType: 'propia' },
  { plate: 'C-009BCD', model: 'International Lonestar 2022', year: 2022, fuelKmPerGallon: 8.3, ownershipType: 'arrendada' },
  { plate: 'C-010BCD', model: 'Peterbilt 389 2021', year: 2021, fuelKmPerGallon: 7.7, ownershipType: 'propia' },
]

const PILOTS = [
  { name: 'Carlos Pérez López', licenseType: 'D', licenseNumber: 'DL-001-2022', licenseDue: '2027-12-31' },
  { name: 'María López García', licenseType: 'D', licenseNumber: 'DL-002-2021', licenseDue: '2026-06-30' },
  { name: 'José Martínez Rodríguez', licenseType: 'C', licenseNumber: 'DL-003-2023', licenseDue: '2028-03-15' },
  { name: 'Juan Morales Hernández', licenseType: 'D', licenseNumber: 'DL-004-2020', licenseDue: '2025-09-20' },
  { name: 'Antonio Ramírez Silva', licenseType: 'D', licenseNumber: 'DL-005-2022', licenseDue: '2027-05-10' },
  { name: 'Roberto Quispe Yurani', licenseType: 'C', licenseNumber: 'DL-006-2023', licenseDue: '2028-11-25' },
  { name: 'Miguel Ortiz Castro', licenseType: 'D', licenseNumber: 'DL-007-2021', licenseDue: '2026-02-14' },
  { name: 'Luis González López', licenseType: 'D', licenseNumber: 'DL-008-2022', licenseDue: '2027-08-30' },
  { name: 'Fernando Flores Carrillo', licenseType: 'C', licenseNumber: 'DL-009-2023', licenseDue: '2029-01-05' },
  { name: 'Diego Reyes Santana', licenseType: 'D', licenseNumber: 'DL-010-2022', licenseDue: '2027-04-18' },
]

const ROUTES = [
  { origin: 'Guatemala City', destination: 'Puerto San José' },
  { origin: 'Puerto San José', destination: 'Guatemala City' },
  { origin: 'Guatemala City', destination: 'Quetzaltenango' },
  { origin: 'Quetzaltenango', destination: 'Guatemala City' },
  { origin: 'Guatemala City', destination: 'Escuintla' },
  { origin: 'Escuintla', destination: 'Guatemala City' },
]

async function insertRow(table: string, row: Record<string, unknown>) {
  const { error } = await supabaseAdmin.from(table).insert([row])
  if (error) {
    throw new Error(`[${table}] ${error.message}`)
  }
}

async function selectIds(table: string) {
  const { data, error } = await supabaseAdmin.from(table).select('id')
  if (error) {
    throw new Error(`[${table}] ${error.message}`)
  }

  return (data ?? []).map((item: { id: string }) => item.id)
}

async function clearTable(table: string) {
  const { error } = await supabaseAdmin.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (error) {
    throw new Error(`[${table}] ${error.message}`)
  }
}

export async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...')

    console.log('🧹 Clearing existing data...')
    await clearTable('alerts')
    await clearTable('cost_records')
    await clearTable('fuel_records')
    await clearTable('maintenance_tasks')
    await clearTable('trips')
    await clearTable('pilots')
    await clearTable('trucks')

    // Seed trucks
    console.log('📦 Seeding trucks...')
    for (const truck of TRUCKS) {
      await insertRow('trucks', {
        plate: truck.plate,
        model: truck.model,
        year: truck.year,
        fuel_km_per_gallon: truck.fuelKmPerGallon,
        ownership_type: truck.ownershipType,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }

    // Get all trucks for assignment
    const truckIds = await selectIds('trucks')
    if (truckIds.length === 0) {
      throw new Error('No trucks available after seeding')
    }

    // Seed pilots
    console.log('👨‍✈️ Seeding pilots...')
    for (let i = 0; i < PILOTS.length; i++) {
      const pilot = PILOTS[i]
      const assignedTruckId = truckIds[i % truckIds.length]

      await insertRow('pilots', {
        name: pilot.name,
        license_type: pilot.licenseType,
        license_number: pilot.licenseNumber,
        license_due: pilot.licenseDue,
        license_status: new Date(pilot.licenseDue) > new Date() ? 'valid' : 'expired',
        assigned_truck_id: assignedTruckId,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }

    // Get all pilots and trucks for trip creation
    const pilotIds = await selectIds('pilots')
    if (pilotIds.length === 0) {
      throw new Error('No pilots available after seeding')
    }

    // Seed trips
    console.log('✈️ Seeding trips...')
    for (let i = 0; i < 15; i++) {
      const route = ROUTES[i % ROUTES.length]
      const truckId = truckIds[i % truckIds.length]
      const pilotId = pilotIds[i % pilotIds.length]
      const statuses = ['programado', 'en-ruta', 'completado']
      const status = statuses[Math.floor(Math.random() * statuses.length)]

      const distanceKm = Math.floor(Math.random() * 300) + 50

      await insertRow('trips', {
        truck_id: truckId,
        pilot_id: pilotId,
        origin: route.origin,
        destination: route.destination,
        distance_km: distanceKm,
        estimated_time_hours: Math.ceil(distanceKm / 80),
        status,
        started_at: status !== 'programado' ? new Date(Date.now() - Math.random() * 86400000).toISOString() : null,
        completed_at: status === 'completado' ? new Date().toISOString() : null,
        fuel_consumption_gallons: status === 'completado' ? Math.round((distanceKm / 8) * 10) / 10 : null,
        cost_gtq: status === 'completado' ? distanceKm * 15 : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }

    // Seed maintenance tasks
    console.log('🔧 Seeding maintenance tasks...')
    for (let i = 0; i < 8; i++) {
      const types = ['preventivo', 'correctivo', 'emergencia']
      const type = types[Math.floor(Math.random() * types.length)]
      const truckId = truckIds[i % truckIds.length]

      await insertRow('maintenance_tasks', {
        truck_id: truckId,
        type,
        description: `${type === 'preventivo' ? 'Cambio de aceite' : type === 'correctivo' ? 'Reparación de frenos' : 'Emergencia de motor'}`,
        due_in_km: type === 'preventivo' ? 10000 : null,
        status: Math.random() > 0.5 ? 'programado' : 'completado',
        estimated_cost_gtq: Math.random() * 2000 + 500,
        scheduled_date: new Date(Date.now() + Math.random() * 30 * 86400000).toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }

    // Seed fuel records
    console.log('⛽ Seeding fuel records...')
    const stations = ['Shell', 'UNO', 'Puma', 'Texaco']
    for (let i = 0; i < 20; i++) {
      const truckId = truckIds[i % truckIds.length]
      const station = stations[Math.floor(Math.random() * stations.length)]
      const dieselPrice = Math.random() * 2 + 36 // 36-38 GTQ/gal
      const gallons = Math.random() * 40 + 20

      await insertRow('fuel_records', {
        truck_id: truckId,
        station,
        diesel_price_gtq: dieselPrice,
        gallons_dispensed: gallons,
        total_cost_gtq: dieselPrice * gallons,
        meter_km: Math.floor(Math.random() * 500000) + 50000,
        recorded_at: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }

    // Seed cost records
    console.log('💰 Seeding cost records...')
    const categories = ['combustible', 'mantenimiento', 'salarios', 'seguros', 'tolls', 'otro']
    for (let i = 0; i < 25; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)]
      const truckId = Math.random() > 0.5 ? truckIds[Math.floor(Math.random() * truckIds.length)] : null
      const pilotId = Math.random() > 0.5 ? pilotIds[Math.floor(Math.random() * pilotIds.length)] : null

      let amount = 100
      if (category === 'combustible') amount = Math.random() * 1000 + 500
      else if (category === 'mantenimiento') amount = Math.random() * 2000 + 500
      else if (category === 'salarios') amount = Math.random() * 3000 + 2000
      else if (category === 'seguros') amount = Math.random() * 500 + 100
      else if (category === 'tolls') amount = Math.random() * 100 + 20

      await insertRow('cost_records', {
        category,
        description: `${category} cost record`,
        amount_gtq: amount,
        related_truck_id: truckId,
        related_pilot_id: pilotId,
        recorded_at: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }

    // Seed alerts
    console.log('🚨 Seeding alerts...')
    const levels = ['critical', 'warning', 'info']
    for (let i = 0; i < 10; i++) {
      const level = levels[Math.floor(Math.random() * levels.length)]
      const truckId = Math.random() > 0.3 ? truckIds[Math.floor(Math.random() * truckIds.length)] : null

      await insertRow('alerts', {
        level,
        title: `${level === 'critical' ? 'Critical' : level === 'warning' ? 'Warning' : 'Info'} Alert`,
        detail: 'Alert detail for monitoring',
        related_truck_id: truckId,
        resolved: Math.random() > 0.5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }

    console.log(`✅ Database seeding completed successfully! Trucks available: ${truckIds.length}`)
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exitCode = 1
  }
}

await seedDatabase()
