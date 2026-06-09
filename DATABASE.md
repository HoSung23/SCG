# 🗄️ SCG Database Architecture

## Overview

PostgreSQL database hosted on Supabase with 8 tables covering fleet management, operations, and financials.

---

## 📊 Entity Relationship Diagram (ERD)

```
┌─────────────┐         ┌─────────────┐
│   TRUCKS    │◄────────┤   PILOTS    │
├─────────────┤         ├─────────────┤
│ id (PK)     │         │ id (PK)     │
│ plate       │         │ name        │
│ model       │         │ license_no  │
│ year        │         │ truck_id(FK)│
│ status      │         │ status      │
└─────────────┘         └─────────────┘
        │                       ▲
        │                       │
        ▼                       │
┌──────────────┐        ┌──────────────┐
│    TRIPS     │────────┤ MAINTENANCE  │
├──────────────┤        ├──────────────┤
│ id (PK)      │        │ id (PK)      │
│ truck_id (FK)│        │ truck_id(FK) │
│ pilot_id(FK) │        │ type         │
│ status       │        │ status       │
│ distance_km  │        │ cost_gtq     │
└──────────────┘        └──────────────┘
        │
        ├─► FUEL_RECORDS
        │   ├─ truck_id (FK)
        │   └─ cost_gtq
        │
        ├─► COST_RECORDS
        │   ├─ truck_id (FK)
        │   ├─ pilot_id (FK)
        │   └─ category
        │
        └─► ALERTS
            ├─ truck_id (FK)
            ├─ pilot_id (FK)
            └─ trip_id (FK)
```

---

## 🔑 Tables

### 1. **TRUCKS** — Fleet inventory

```sql
CREATE TABLE trucks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plate VARCHAR(20) UNIQUE NOT NULL,          -- License plate (C-001BCD)
  model VARCHAR(100) NOT NULL,                 -- Model name (Freightliner Cascadia)
  year INTEGER NOT NULL,                       -- Year (2022)
  fuel_km_per_gallon DECIMAL(5, 2) NOT NULL,  -- Fuel efficiency (8.5)
  status VARCHAR(20) DEFAULT 'active',        -- active|maintenance|idle|retired
  ownership_type VARCHAR(20) DEFAULT 'propia', -- propia|arrendada
  gps_device_id VARCHAR(100),                 -- GPS tracker ID
  last_gps_update TIMESTAMP WITH TIME ZONE,   -- Last position update
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_trucks_status ON trucks(status);
```

**Example**:
```json
{
  "id": "a1b2c3d4-e5f6-7890",
  "plate": "C-001BCD",
  "model": "Freightliner Cascadia 2022",
  "year": 2022,
  "fuel_km_per_gallon": 8.5,
  "status": "active",
  "ownership_type": "propia"
}
```

---

### 2. **PILOTS** — Driver management

```sql
CREATE TABLE pilots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,                  -- Full name (Carlos Pérez)
  license_type VARCHAR(5) NOT NULL,            -- C|D (license class)
  license_number VARCHAR(50) NOT NULL,         -- DL-001-2022
  license_due DATE NOT NULL,                   -- 2027-12-31
  license_status VARCHAR(20) DEFAULT 'valid',  -- valid|expired|about_to_expire
  assigned_truck_id UUID REFERENCES trucks(id), -- Assigned vehicle
  status VARCHAR(20) DEFAULT 'active',        -- active|inactive|on_leave
  phone_number VARCHAR(20),                   -- +502 7123 4567
  email VARCHAR(100),                         -- carlos@company.com
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_pilots_assigned_truck ON pilots(assigned_truck_id);
CREATE INDEX idx_pilots_status ON pilots(status);
```

**Example**:
```json
{
  "id": "b2c3d4e5-f6a7-b890",
  "name": "Carlos Pérez López",
  "license_type": "D",
  "license_number": "DL-001-2022",
  "license_due": "2027-12-31",
  "license_status": "valid",
  "assigned_truck_id": "a1b2c3d4-e5f6-7890",
  "status": "active"
}
```

---

### 3. **TRIPS** — Journey tracking

```sql
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  truck_id UUID NOT NULL REFERENCES trucks(id),
  pilot_id UUID NOT NULL REFERENCES pilots(id),
  origin VARCHAR(100) NOT NULL,               -- Starting location
  destination VARCHAR(100) NOT NULL,          -- Final destination
  distance_km DECIMAL(8, 2) NOT NULL,        -- Route distance
  estimated_time_hours INTEGER DEFAULT 4,    -- ETA (hours)
  status VARCHAR(20) DEFAULT 'programado',   -- programado|en-ruta|completado|cancelado
  started_at TIMESTAMP WITH TIME ZONE,        -- When trip began
  completed_at TIMESTAMP WITH TIME ZONE,      -- When trip ended
  fuel_consumption_gallons DECIMAL(8, 2),    -- Actual fuel used (only when completed)
  cost_gtq DECIMAL(10, 2),                   -- Total cost (only when completed)
  notes TEXT,                                 -- Free-text observations
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_truck ON trips(truck_id);
CREATE INDEX idx_trips_pilot ON trips(pilot_id);
```

**Example**:
```json
{
  "id": "c3d4e5f6-a7b8-c901",
  "truck_id": "a1b2c3d4-e5f6-7890",
  "pilot_id": "b2c3d4e5-f6a7-b890",
  "origin": "Guatemala City",
  "destination": "Puerto San José",
  "distance_km": 145,
  "estimated_time_hours": 2,
  "status": "en-ruta",
  "started_at": "2026-06-08T08:30:00Z",
  "fuel_consumption_gallons": 18.5,
  "cost_gtq": 2175
}
```

---

### 4. **MAINTENANCE_TASKS** — Preventive and corrective maintenance

```sql
CREATE TABLE maintenance_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  truck_id UUID NOT NULL REFERENCES trucks(id),
  type VARCHAR(20) NOT NULL,                  -- preventivo|correctivo|emergencia
  description TEXT NOT NULL,                  -- What needs to be done
  due_in_km INTEGER,                         -- Service due at kilometer mark
  current_km INTEGER,                        -- Current odometer reading
  status VARCHAR(20) DEFAULT 'programado',   -- programado|en-progreso|completado|cancelado
  estimated_cost_gtq DECIMAL(10, 2),         -- Budget estimate
  actual_cost_gtq DECIMAL(10, 2),            -- Real cost (after completion)
  scheduled_date DATE,                       -- Planned service date
  completed_date DATE,                       -- When service was done
  notes TEXT,                                 -- Technician notes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Example**:
```json
{
  "id": "d4e5f6a7-b8c9-d012",
  "truck_id": "a1b2c3d4-e5f6-7890",
  "type": "preventivo",
  "description": "Oil change, filter replacement",
  "due_in_km": 10000,
  "current_km": 95000,
  "status": "programado",
  "estimated_cost_gtq": 1200,
  "scheduled_date": "2026-06-15"
}
```

---

### 5. **FUEL_RECORDS** — Fuel tracking

```sql
CREATE TABLE fuel_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  truck_id UUID NOT NULL REFERENCES trucks(id),
  station VARCHAR(50) NOT NULL,               -- Gas station name (Shell, UNO, etc.)
  diesel_price_gtq DECIMAL(8, 2) NOT NULL,   -- Price per gallon
  gallons_dispensed DECIMAL(8, 2) NOT NULL,  -- Quantity purchased
  total_cost_gtq DECIMAL(10, 2) NOT NULL,    -- Total paid
  meter_km INTEGER,                          -- Truck odometer at fill-up
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT,                                 -- Card used, payment method, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_fuel_truck ON fuel_records(truck_id);
```

**Example**:
```json
{
  "id": "e5f6a7b8-c9d0-e123",
  "truck_id": "a1b2c3d4-e5f6-7890",
  "station": "Shell",
  "diesel_price_gtq": 36.9,
  "gallons_dispensed": 50,
  "total_cost_gtq": 1845,
  "meter_km": 95000,
  "recorded_at": "2026-06-08T14:30:00Z"
}
```

---

### 6. **COST_RECORDS** — General expenses

```sql
CREATE TABLE cost_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL,              -- combustible|mantenimiento|salarios|seguros|tolls|otro
  description TEXT NOT NULL,                  -- What was purchased/paid
  amount_gtq DECIMAL(10, 2) NOT NULL,        -- Cost in GTQ
  related_truck_id UUID REFERENCES trucks(id),   -- Which truck (if applicable)
  related_pilot_id UUID REFERENCES pilots(id),   -- Which pilot (if applicable)
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT,                                 -- Invoice #, vendor, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_costs_category ON cost_records(category);
```

**Example**:
```json
{
  "id": "f6a7b8c9-d0e1-f234",
  "category": "seguros",
  "description": "Monthly vehicle insurance premium",
  "amount_gtq": 2500,
  "related_truck_id": "a1b2c3d4-e5f6-7890",
  "recorded_at": "2026-06-01T00:00:00Z"
}
```

---

### 7. **ALERTS** — Operational alerts

```sql
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level VARCHAR(20) NOT NULL,                 -- critical|warning|info
  title VARCHAR(255) NOT NULL,                -- Short alert title
  detail TEXT,                                -- Full description
  related_truck_id UUID REFERENCES trucks(id),
  related_pilot_id UUID REFERENCES pilots(id),
  related_trip_id UUID REFERENCES trips(id),
  resolved BOOLEAN DEFAULT FALSE,             -- Has alert been addressed?
  resolved_at TIMESTAMP WITH TIME ZONE,       -- When it was resolved
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_alerts_level ON alerts(level);
```

**Example**:
```json
{
  "id": "g7b8c9d0-e1f2-g345",
  "level": "critical",
  "title": "License Expiration Alert",
  "detail": "Pilot José Martínez license expires in 7 days (2026-06-15)",
  "related_pilot_id": "c3d4e5f6-a7b8-c901",
  "resolved": false
}
```

---

### 8. **USERS** — System users (for future auth)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,        -- Login email
  name VARCHAR(100) NOT NULL,                 -- Display name
  role VARCHAR(20) DEFAULT 'piloto',         -- superadmin|admin|gerente|piloto|contador
  status VARCHAR(20) DEFAULT 'active',       -- active|inactive
  last_login_at TIMESTAMP WITH TIME ZONE,    -- Last authentication
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

---

## 📈 Data Relationships

### Foreign Keys

| Table | FK Column | References | Purpose |
|-------|-----------|-----------|---------|
| pilots | assigned_truck_id | trucks.id | Pilot assigned to truck |
| trips | truck_id | trucks.id | Trip uses this truck |
| trips | pilot_id | pilots.id | Trip driven by this pilot |
| maintenance_tasks | truck_id | trucks.id | Maintenance for this truck |
| fuel_records | truck_id | trucks.id | Fuel purchase for this truck |
| cost_records | related_truck_id | trucks.id | Expense for this truck |
| cost_records | related_pilot_id | pilots.id | Expense for this pilot |
| alerts | related_truck_id | trucks.id | Alert about this truck |
| alerts | related_pilot_id | pilots.id | Alert about this pilot |
| alerts | related_trip_id | trips.id | Alert about this trip |

### Sample Queries

```sql
-- Get all active trucks
SELECT * FROM trucks WHERE status = 'active';

-- Get all pilots and their assigned trucks
SELECT p.name, p.license_due, t.plate, t.model
FROM pilots p
LEFT JOIN trucks t ON p.assigned_truck_id = t.id;

-- Get trips for today
SELECT * FROM trips 
WHERE DATE(started_at) = CURRENT_DATE;

-- Get fuel costs by truck for this month
SELECT 
  t.plate,
  SUM(f.total_cost_gtq) as monthly_fuel_cost
FROM trucks t
JOIN fuel_records f ON t.id = f.truck_id
WHERE DATE_TRUNC('month', f.recorded_at) = DATE_TRUNC('month', NOW())
GROUP BY t.plate;

-- Get pending maintenance tasks
SELECT * FROM maintenance_tasks 
WHERE status = 'programado' 
ORDER BY scheduled_date ASC;

-- Get critical alerts (unresolved)
SELECT * FROM alerts 
WHERE level = 'critical' AND resolved = FALSE
ORDER BY created_at DESC;
```

---

## 🛡️ Data Integrity Rules

### Constraints

1. **Unique plates**: No two trucks can have the same license plate
2. **Valid status values**: Only predefined status strings allowed (enforced in application)
3. **Date constraints**: 
   - `license_due` > TODAY for valid licenses
   - `completed_at` > `started_at` for finished trips
4. **Positive amounts**: Cost and fuel amounts must be ≥ 0
5. **Foreign key integrity**: Cannot delete truck with active pilots or trips assigned

### Recommended RLS Policies (Phase 2)

```sql
-- Pilots can only see their own record and assigned truck
CREATE POLICY "pilot_self_read" ON pilots
  FOR SELECT USING (auth.uid()::text = id::text);

-- Only admins can modify pilot records
CREATE POLICY "admin_pilot_all" ON pilots
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Anyone authenticated can read costs
CREATE POLICY "cost_read" ON cost_records
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only gerente can create new trips
CREATE POLICY "gerente_trip_insert" ON trips
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'gerente');
```

---

## 📊 Indexes for Performance

```sql
-- Already created for common queries:
CREATE INDEX idx_trucks_status ON trucks(status);
CREATE INDEX idx_pilots_status ON pilots(status);
CREATE INDEX idx_pilots_assigned_truck ON pilots(assigned_truck_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_truck ON trips(truck_id);
CREATE INDEX idx_trips_pilot ON trips(pilot_id);
CREATE INDEX idx_fuel_truck ON fuel_records(truck_id);
CREATE INDEX idx_costs_category ON cost_records(category);
CREATE INDEX idx_alerts_level ON alerts(level);

-- Consider adding:
-- CREATE INDEX idx_trips_created ON trips(created_at DESC);
-- CREATE INDEX idx_fuel_recorded ON fuel_records(recorded_at DESC);
-- CREATE INDEX idx_costs_recorded ON cost_records(recorded_at DESC);
```

---

## 🔄 Typical Query Patterns

### Dashboard KPIs
```sql
-- Active trips
SELECT COUNT(*) FROM trips WHERE status = 'en-ruta';

-- Active trucks
SELECT COUNT(*) FROM trucks WHERE status = 'active';

-- Monthly costs
SELECT SUM(amount_gtq) FROM cost_records 
WHERE DATE_TRUNC('month', recorded_at) = DATE_TRUNC('month', NOW());

-- Recent fuel records
SELECT * FROM fuel_records ORDER BY recorded_at DESC LIMIT 10;
```

### Reporting
```sql
-- Fuel expenses by truck
SELECT 
  t.plate, 
  SUM(f.total_cost_gtq) as fuel_cost,
  SUM(f.gallons_dispensed) as gallons
FROM trucks t
JOIN fuel_records f ON t.id = f.truck_id
GROUP BY t.id, t.plate;

-- Maintenance pending
SELECT * FROM maintenance_tasks 
WHERE status != 'completado' 
ORDER BY due_in_km DESC;
```

---

**Version**: 0.1.0  
**Last Updated**: June 2026
