# SCG Backend - Setup Guide

## Overview

El backend de SCG es un servidor Node.js/Express que se conecta a Supabase para gestionar:

- **Gestión de flota**: camiones, estados, GPS, mantenimiento
- **Gestión de pilotos**: asignaciones, licencias, documentos
- **Viajes**: programación, trazabilidad, costos
- **Combustible**: registros de carga, precios, consumo
- **Costos**: registros por categoría, análisis
- **Alertas**: críticas, advertencias, información
- **Usuarios**: roles, permisos, sesiones

## Arquitectura

```
Backend (Node.js + Express)
    ↓
API REST (http://localhost:3000/api/*)
    ↓
Supabase PostgreSQL
    ↓
Frontend (React + Vite)
```

**Sistema de Identificación de Unidades (Camiones)**
- Cada camión tiene un `codigo` único (ej: `T-000001`) que es el identificador principal en todo el sistema
- En lugar de usar `truck_id` (UUID), usamos `truck_codigo` (texto) para:
  - Viajes (`trips.truck_codigo`)
  - Mantenimiento (`maintenance_costs.truck_codigo`)
  - Costos (`general_costs.truck_codigo`)
  - Incidentes (`incidents.truck_codigo`)
  - Fuel records (`fuel_prices.truck_codigo`)
  - Programación (`programacion.truck_codigo`)
- Esto permite referencias más legibles y un seguimiento más sencillo de la flota

## Requisitos previos

1. **Cuenta Supabase**: https://supabase.com
2. **Node.js 20+**
3. **Variables de entorno configuradas** (ver más abajo)

## Configuración local

### 1. Crear proyecto en Supabase

1. Ve a https://supabase.com y crea una cuenta
2. Crea un nuevo proyecto (ej: "SCG Demo")
3. Copia las credenciales:
   - `SUPABASE_URL`: URL del proyecto
   - `SUPABASE_KEY`: Anon key (pública)
   - `SUPABASE_SERVICE_ROLE_KEY`: Service role key (privada, solo server)

### 2. Configurar .env en backend

```powershell
cd c:\Users\yoshi\Desktop\SCG\backend
cp .env.example .env
```

Edita `.env` con tus credenciales:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
PORT=3000
NODE_ENV=development

# Gmail sync
GMAIL_CLIENT_ID=...
GMAIL_CLIENT_SECRET=...
GMAIL_REFRESH_TOKEN=...
GMAIL_USER_ID=me
GMAIL_QUERY=subject:"Reporte" newer_than:7d
GMAIL_MESSAGE_ID=
GMAIL_COLUMN_MAP={"fecha":"recorded_at","total":"amount_gtq"}
SUPABASE_DESTINATION_TABLE=nombre_de_tu_tabla
SUPABASE_UPSERT=false
SUPABASE_UPSERT_COLUMNS=id
```

### 3.1 Configurar Gmail API

Para extraer una tabla desde un correo de Gmail necesitas credenciales OAuth2:

1. Crea un proyecto en Google Cloud.
2. Habilita la **Gmail API**.
3. Crea credenciales OAuth 2.0.
4. Genera un `refresh token` con acceso a `https://www.googleapis.com/auth/gmail.readonly`.
5. Coloca `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET` y `GMAIL_REFRESH_TOKEN` en tu `.env`.

La sincronización funciona de dos maneras:

- **Por búsqueda**: define `GMAIL_QUERY` y el script tomará el correo más reciente que coincida.
- **Por ID exacto**: define `GMAIL_MESSAGE_ID` si ya conoces el mensaje.

Si la tabla del correo no usa los mismos nombres de columnas que Supabase, usa `GMAIL_COLUMN_MAP` con JSON. El script normaliza los encabezados de la tabla a minúsculas con `_`.

### 3. Crear tablas en Supabase

Ve a **SQL Editor** en Supabase y ejecuta:

```sql
-- Trucks table
CREATE TABLE trucks (
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
);

-- Pilots table
CREATE TABLE pilots (
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
);

-- Trips table
CREATE TABLE trips (
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
);

-- Maintenance tasks table
CREATE TABLE maintenance_tasks (
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
);

-- Fuel records table
CREATE TABLE fuel_records (
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
);

-- Cost records table
CREATE TABLE cost_records (
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
);

-- Alerts table
CREATE TABLE alerts (
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
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'piloto',
  status VARCHAR(20) DEFAULT 'active',
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear indexes para mejorar queries
CREATE INDEX idx_trucks_status ON trucks(status);
CREATE INDEX idx_pilots_status ON pilots(status);
CREATE INDEX idx_pilots_assigned_truck ON pilots(assigned_truck_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_truck ON trips(truck_id);
CREATE INDEX idx_trips_pilot ON trips(pilot_id);
CREATE INDEX idx_fuel_truck ON fuel_records(truck_id);
CREATE INDEX idx_costs_category ON cost_records(category);
CREATE INDEX idx_alerts_level ON alerts(level);
```

### 4. Habilitar Row Level Security (RLS) [Opcional pero recomendado]

```sql
-- Enable RLS
ALTER TABLE trucks ENABLE ROW LEVEL SECURITY;
ALTER TABLE pilots ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- Example: Anyone can read, only authenticated can write
CREATE POLICY "trucks_select" ON trucks FOR SELECT USING (true);
CREATE POLICY "trucks_insert" ON trucks FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

### 5. Seedear datos iniciales [Opcional]

Para desarrollo, puedes usar el SQL editor para insertar datos de prueba:

```sql
-- Insert sample trucks
INSERT INTO trucks (plate, model, year, fuel_km_per_gallon, status, ownership_type) VALUES
('C-001BCD', 'Freightliner Cascadia', 2022, 8.5, 'active', 'propia'),
('C-002BCD', 'Kenworth T680', 2021, 7.8, 'active', 'propia'),
('C-003BCD', 'International LT', 2023, 9.2, 'active', 'arrendada');
-- ... agregar más camiones

-- Insert sample pilots
INSERT INTO pilots (name, license_type, license_number, license_due, license_status, status) VALUES
('Carlos Pérez', 'D', 'DLN-123456', '2027-12-31', 'valid', 'active'),
('María López', 'D', 'DLN-234567', '2026-06-30', 'valid', 'active'),
('José Martínez', 'C', 'DLN-345678', '2025-03-15', 'about_to_expire', 'active');
-- ... agregar más pilotos
```

## Ejecutar backend localmente

```powershell
# Instalar dependencias (ya hecho)
cd c:\Users\yoshi\Desktop\SCG
npm install --workspace backend

# Desarrollo con hot-reload
npm run dev:backend
# → Server running on http://localhost:3000

# Build para producción
npm run build:backend

# Producción
npm run start:backend

# Sync Gmail -> Supabase desde la tabla de un correo
npm run sync:gmail-table
```

Para correr el watch de Gmail en el servidor con ventanas horarias (5pm y 10pm cada 15 minutos), configura en `.env`:

```dotenv
GMAIL_WATCH_ON_START=true
GMAIL_WATCH_MODE=windowed-schedule
GMAIL_WATCH_WINDOW_HOURS=17,22
GMAIL_WATCH_WINDOW_INTERVAL_MINUTES=15
```

Notas:
- El horario usa la **zona horaria local del servidor**.
- Con esta configuración se ejecuta a `17:00, 17:15, 17:30, 17:45` y `22:00, 22:15, 22:30, 22:45`.
- Si quieres el comportamiento anterior por polling continuo, usa `GMAIL_WATCH_MODE=poll`.

Ejemplo rápido:

```powershell
cd c:\Users\yoshi\Desktop\SCG\backend
$env:GMAIL_QUERY='subject:"Reporte" newer_than:7d'
$env:SUPABASE_DESTINATION_TABLE='cost_records'
npm run sync:gmail-table
```

## API Endpoints

### Camiones
- `GET /api/trucks` - Listar todos
- `GET /api/trucks/:id` - Obtener uno
- `POST /api/trucks` - Crear
- `PUT /api/trucks/:id` - Actualizar
- `DELETE /api/trucks/:id` - Marcar como retired

### Pilotos
- `GET /api/pilots` - Listar
- `POST /api/pilots` - Crear
- `PUT /api/pilots/:id` - Actualizar
- `POST /api/pilots/:id/assign-truck` - Asignar camión

### Programación (Auto-Asignación por Código)
- `GET /api/programacion` - Listar todas (filtros: `status`, `fecha`, `fechaInicio`, `fechaFin`)
  - Ejemplo: `/api/programacion?fechaInicio=2026-06-01&fechaFin=2026-06-30&status=asignado`
- `GET /api/programacion/:id` - Obtener con relaciones
- `POST /api/programacion/:id/assign-pilot` - Asignar piloto manual
  - Body: `{ pilotId, assignedBy? }`
- `POST /api/programacion/:id/assign-truck` - Asignar camión por código
  - Body: `{ truckCodigo, assignedBy? }`
  - ⚠️ Usa `truck_codigo` (ej: `T-000001`), NO id
- `POST /api/programacion/:id/generate-trip` - Generar viaje
  - ⚠️ **Validación:** No permite crear viajes el domingo después de las 12:00pm
- `POST /api/programacion/auto-assign/by-code` - Auto-asignar por código
  - Body: `{ codigo, pilotName?, truckPlate? }`
  - Busca piloto por nombre y camión por placa automáticamente
- `POST /api/programacion/auto-assign/batch` - Auto-asignar múltiples
  - Body: `{ codigos: ["COD-001", "COD-002"] }`
- `POST /api/programacion/auto-assign/pending` - Auto-asignar todas las pendientes

**Nota:** Cuando Gmail sync inserta programaciones, se activa auto-asignación automáticamente buscando:
- Piloto: nombres en campos `nombre` o `transportista`
- Camión: placa en campo `placa` → se convierte a `truck_codigo`
- Si ambos se asignan, status cambia a `asignado` con timestamp

### Viajes
- `GET /api/trips` - Listar todas (filtros: `fechaInicio`, `fechaFin`, `status`)
  - Ejemplo: `/api/trips?fechaInicio=2026-06-01&fechaFin=2026-06-30&status=completado`
- `POST /api/trips` - Crear
  - Body: `{ truckCodigo, pilotId, origin, destination, distanceKm, estimatedTimeHours? }`
  - ⚠️ Usa `truckCodigo` (ej: `T-000001`), NO truckId
- `PUT /api/trips/:id/status` - Cambiar estado

### Mantenimiento
- `GET /api/maintenance` - Listar
- `POST /api/maintenance` - Crear tarea
- `PUT /api/maintenance/:id/complete` - Marcar completado

### Combustible
- `GET /api/fuel` - Listar registros de combustible
- `POST /api/fuel` - Registrar carga de combustible
  - Body:
    ```json
    {
      "truckId": "uuid-del-camion",
      "station": "Shell|UNO|Puma|Otro",
      "dieselPriceGtq": 8.50,
      "gallonsDispensed": 100,
      "meterKm": 125000,
      "serviceType": "pump|puma_credit",
      "handlerCodigo": "EMP-001",
      "handlerName": "Juan Pérez",
      "creditVoucherNumber": "VALE-2026-0001",
      "notes": "Carga de combustible",
      "notesExtended": "Notas adicionales"
    }
    ```
  - **Servicios disponibles:**
    - `pump` — Bomba propia (no requiere `creditVoucherNumber`)
    - `puma_credit` — Puma con vale de crédito (requiere `creditVoucherNumber`)
  - `handlerCodigo` y `handlerName` identifican quién manejó el servicio

#### Asignación automática de combustible diario
- `POST /api/fuel/allocate/calculate` - Calcular galones para un camión específico
  - Body: `{ truckCodigo, estimatedKm, fuelEfficiency? }`
  - Retorna: galones necesarios con 10% de buffer
  - Ejemplo: `{ truckCodigo: "T-000001", estimatedKm: 250 }` → 35 galones (con eficiencia 8km/gal)
- `GET /api/fuel/allocate/today` - Obtener necesidades de combustible para todos los viajes de HOY
  - Agrupa viajes por camión, suma km, calcula galones totales
  - Ideal para generar lista de carga antes de salir del predio
- `GET /api/fuel/allocate/report` - Generar reporte completo diario
  - Detalle por camión, total de galones, timestamp de generación

### Costos
- `GET /api/costs` - Listar
- `GET /api/costs/summary/by-category` - Resumen por categoría
- `POST /api/costs` - Registrar costo

## Próximos pasos

1. **Autenticación**: Integrar Supabase Auth (JWT, login/registro)
2. **Sincronización offline**: Implementar queue de cambios para modo offline
3. **GPS tracking**: Conectar dispositivos GPS reales
4. **Reportes**: Generar PDF/Excel con históricos
5. **Webhooks**: Configurar notificaciones en tiempo real

## Troubleshooting

### Error: "Missing Supabase credentials"
- Asegúrate de que `.env` esté en `SCG/backend/`
- Verifica que `SUPABASE_URL` y `SUPABASE_KEY` no estén vacíos

### Error: "Cannot connect to database"
- Verifica que Supabase Project esté activo
- Usa la anon key en el cliente (SUPABASE_KEY), no la service role key

### Port 3000 ya está en uso
- Cambiar puerto en `.env`: `PORT=3001`

## Referencias

- Supabase Docs: https://supabase.com/docs
- Express Docs: https://expressjs.com/
- TypeScript: https://www.typescriptlang.org/
