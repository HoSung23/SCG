import { supabaseAdmin } from './utils/supabase.js'

const MIGRATIONS = [
  // Trucks table
  `
    CREATE TABLE IF NOT EXISTS trucks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      plate VARCHAR(20) UNIQUE NOT NULL,
      model VARCHAR(100) NOT NULL,
      year INTEGER NOT NULL,
      fuel_km_per_gallon DECIMAL(5, 2) NOT NULL,
      status VARCHAR(20) DEFAULT 'active',
      ownership_type VARCHAR(20) DEFAULT 'propia',
      gps_device_id VARCHAR(100),
      last_gps_update TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )
  `,

  // Pilots table
  `
    CREATE TABLE IF NOT EXISTS pilots (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100) NOT NULL,
      license_type VARCHAR(5) NOT NULL,
      license_number VARCHAR(50) NOT NULL,
      license_due DATE NOT NULL,
      license_status VARCHAR(20) DEFAULT 'valid',
      assigned_truck_id UUID REFERENCES trucks(id),
      status VARCHAR(20) DEFAULT 'active',
      phone_number VARCHAR(20),
      email VARCHAR(100),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )
  `,

  // Trips table
  `
    CREATE TABLE IF NOT EXISTS trips (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      truck_id UUID NOT NULL REFERENCES trucks(id),
      pilot_id UUID NOT NULL REFERENCES pilots(id),
      origin VARCHAR(100) NOT NULL,
      destination VARCHAR(100) NOT NULL,
      distance_km DECIMAL(8, 2) NOT NULL,
      estimated_time_hours INTEGER DEFAULT 4,
      status VARCHAR(20) DEFAULT 'programado',
      started_at TIMESTAMP WITH TIME ZONE,
      completed_at TIMESTAMP WITH TIME ZONE,
      fuel_consumption_gallons DECIMAL(8, 2),
      cost_gtq DECIMAL(10, 2),
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )
  `,

  // Maintenance tasks table
  `
    CREATE TABLE IF NOT EXISTS maintenance_tasks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      truck_id UUID NOT NULL REFERENCES trucks(id),
      type VARCHAR(20) NOT NULL,
      description TEXT NOT NULL,
      due_in_km INTEGER,
      current_km INTEGER,
      status VARCHAR(20) DEFAULT 'programado',
      estimated_cost_gtq DECIMAL(10, 2),
      actual_cost_gtq DECIMAL(10, 2),
      scheduled_date DATE,
      completed_date DATE,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )
  `,

  // Fuel records table
  `
    CREATE TABLE IF NOT EXISTS fuel_records (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      truck_id UUID NOT NULL REFERENCES trucks(id),
      station VARCHAR(50) NOT NULL,
      diesel_price_gtq DECIMAL(8, 2) NOT NULL,
      gallons_dispensed DECIMAL(8, 2) NOT NULL,
      total_cost_gtq DECIMAL(10, 2) NOT NULL,
      meter_km INTEGER,
      recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )
  `,

  // Cost records table
  `
    CREATE TABLE IF NOT EXISTS cost_records (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      category VARCHAR(50) NOT NULL,
      description TEXT NOT NULL,
      amount_gtq DECIMAL(10, 2) NOT NULL,
      related_truck_id UUID REFERENCES trucks(id),
      related_pilot_id UUID REFERENCES pilots(id),
      recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )
  `,

  // Alerts table
  `
    CREATE TABLE IF NOT EXISTS alerts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      level VARCHAR(20) NOT NULL,
      title VARCHAR(255) NOT NULL,
      detail TEXT,
      related_truck_id UUID REFERENCES trucks(id),
      related_pilot_id UUID REFERENCES pilots(id),
      related_trip_id UUID REFERENCES trips(id),
      resolved BOOLEAN DEFAULT FALSE,
      resolved_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )
  `,

  // Users table
  `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      role VARCHAR(20) DEFAULT 'piloto',
      status VARCHAR(20) DEFAULT 'active',
      last_login_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )
  `
]

export async function runMigrations() {
  try {
    console.log('Running migrations...')

    for (const migration of MIGRATIONS) {
      const { error } = await supabaseAdmin.rpc('execute_sql', { sql: migration })
      if (error) {
        throw new Error(error.message)
      }
    }

    console.log('✓ Migrations completed successfully')
  } catch (error) {
    console.error('✗ Migration failed:', error)
    process.exitCode = 1
  }
}

await runMigrations()
