-- 📊 SQL QUERIES - SCG Mobile Supabase
-- Ejecuta estos scripts en: Supabase Dashboard → SQL Editor

-- ============================================================
-- 1️⃣ CREAR TABLAS (Ejecutar una sola vez)
-- ============================================================

-- Tabla: pilots
CREATE TABLE pilots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  license_number TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índice para búsquedas rápidas
CREATE INDEX idx_pilots_user_id ON pilots(user_id);
CREATE INDEX idx_pilots_status ON pilots(status);

-- Tabla: trips
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assigned_pilot_id UUID NOT NULL REFERENCES pilots(id) ON DELETE CASCADE,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  distance INTEGER NOT NULL CHECK (distance > 0),
  cargo_type TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')),
  start_location TEXT,
  start_latitude FLOAT,
  start_longitude FLOAT,
  end_location TEXT,
  end_latitude FLOAT,
  end_longitude FLOAT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para queries optimizadas
CREATE INDEX idx_trips_pilot_id ON trips(assigned_pilot_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_created_at ON trips(created_at DESC);

-- ============================================================
-- 2️⃣ HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Habilitar RLS en tabla pilots
ALTER TABLE pilots ENABLE ROW LEVEL SECURITY;

-- Política 1: Pilotos ven solo sus propios datos
CREATE POLICY "Pilots can view their own data"
  ON pilots
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política 2: Admin puede ver todos (si aplica)
-- CREATE POLICY "Admin can view all pilots"
--   ON pilots
--   FOR SELECT
--   USING (auth.role() = 'authenticated' AND /* check if admin */);

-- Habilitar RLS en tabla trips
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- Política 1: Pilotos ven sus viajes asignados
CREATE POLICY "Pilots can view their assigned trips"
  ON trips
  FOR SELECT
  USING (
    assigned_pilot_id = (
      SELECT id FROM pilots WHERE user_id = auth.uid()
    )
  );

-- Política 2: Pilotos pueden actualizar sus propios viajes
CREATE POLICY "Pilots can update their assigned trips"
  ON trips
  FOR UPDATE
  USING (
    assigned_pilot_id = (
      SELECT id FROM pilots WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    assigned_pilot_id = (
      SELECT id FROM pilots WHERE user_id = auth.uid()
    )
  );

-- ============================================================
-- 3️⃣ CREAR USUARIOS DE PRUEBA
-- ============================================================

-- Nota: Los usuarios se crean en Authentication → Users en Supabase Dashboard
-- Email: pilot1@example.com
-- Password: password123

-- Después de crear el usuario, copia su user_id y úsalo aquí:

INSERT INTO pilots (
  user_id,
  name,
  phone,
  license_number,
  status
) VALUES (
  'USER_ID_AQUI', -- Reemplaza con el ID de auth.users
  'Juan Pérez',
  '+502-1234-5678',
  'LIC-001',
  'active'
);

-- ============================================================
-- 4️⃣ CREAR VIAJES DE PRUEBA
-- ============================================================

-- Antes de ejecutar, necesitas el pilot_id. Obtén con:
-- SELECT id FROM pilots WHERE name = 'Juan Pérez';

-- Viaje 1: Guatemala City → Puerto Barrios
INSERT INTO trips (
  assigned_pilot_id,
  origin,
  destination,
  distance,
  cargo_type,
  status,
  notes
) VALUES (
  (SELECT id FROM pilots WHERE name = 'Juan Pérez'),
  'Guatemala City',
  'Puerto Barrios',
  285,
  'Electrodomésticos',
  'assigned',
  'Entregas a 3 puntos diferentes'
);

-- Viaje 2: Antigua → Escuintla
INSERT INTO trips (
  assigned_pilot_id,
  origin,
  destination,
  distance,
  cargo_type,
  status,
  notes
) VALUES (
  (SELECT id FROM pilots WHERE name = 'Juan Pérez'),
  'Antigua',
  'Escuintla',
  145,
  'Frutas y vegetales',
  'pending',
  'Carga frágil - refrigerado'
);

-- Viaje 3: Zona 10 → Sacatepéquez
INSERT INTO trips (
  assigned_pilot_id,
  origin,
  destination,
  distance,
  cargo_type,
  status
) VALUES (
  (SELECT id FROM pilots WHERE name = 'Juan Pérez'),
  'Zona 10, Guatemala',
  'Sacatepéquez',
  45,
  'Documentos y paquetería',
  'assigned'
);

-- ============================================================
-- 5️⃣ QUERIES ÚTILES PARA TESTING
-- ============================================================

-- Ver todos los pilotos
SELECT id, user_id, name, phone, status, created_at FROM pilots;

-- Ver viajes de un piloto
SELECT id, origin, destination, distance, status, created_at
FROM trips
WHERE assigned_pilot_id = (SELECT id FROM pilots WHERE name = 'Juan Pérez')
ORDER BY created_at DESC;

-- Ver viajes disponibles (pending o assigned)
SELECT id, origin, destination, distance, cargo_type, status
FROM trips
WHERE assigned_pilot_id = (SELECT id FROM pilots WHERE name = 'Juan Pérez')
AND status IN ('pending', 'assigned');

-- Ver viajes en progreso
SELECT id, origin, destination, started_at, start_latitude, start_longitude
FROM trips
WHERE assigned_pilot_id = (SELECT id FROM pilots WHERE name = 'Juan Pérez')
AND status = 'in_progress';

-- Ver viajes completados
SELECT id, origin, destination, started_at, completed_at,
       ROUND(EXTRACT(EPOCH FROM (completed_at - started_at))/3600::numeric, 2) as hours_taken
FROM trips
WHERE assigned_pilot_id = (SELECT id FROM pilots WHERE name = 'Juan Pérez')
AND status = 'completed'
ORDER BY completed_at DESC;

-- ============================================================
-- 6️⃣ ACTUALIZAR VIAJE (Simular inicio de viaje)
-- ============================================================

-- Simular que un piloto inicia un viaje
UPDATE trips
SET
  status = 'in_progress',
  start_location = '14.6349,-90.5069',
  start_latitude = 14.6349,
  start_longitude = -90.5069,
  started_at = NOW()
WHERE id = 'TRIP_ID_AQUI'; -- Reemplaza con ID real

-- Simular que un piloto finaliza un viaje
UPDATE trips
SET
  status = 'completed',
  end_location = '15.7282,-88.5853',
  end_latitude = 15.7282,
  end_longitude = -88.5853,
  completed_at = NOW()
WHERE id = 'TRIP_ID_AQUI'; -- Reemplaza con ID real

-- ============================================================
-- 7️⃣ ESTADÍSTICAS Y REPORTES
-- ============================================================

-- Estadísticas de un piloto
SELECT
  COUNT(*) as total_trips,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_trips,
  SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_trips,
  SUM(CASE WHEN status IN ('pending', 'assigned') THEN 1 ELSE 0 END) as pending_trips,
  SUM(distance) as total_km
FROM trips
WHERE assigned_pilot_id = (SELECT id FROM pilots WHERE name = 'Juan Pérez');

-- Tiempo promedio por viaje completado
SELECT
  ROUND(AVG(EXTRACT(EPOCH FROM (completed_at - started_at))/3600::numeric), 2) as avg_hours,
  MIN(EXTRACT(EPOCH FROM (completed_at - started_at))/3600) as min_hours,
  MAX(EXTRACT(EPOCH FROM (completed_at - started_at))/3600) as max_hours
FROM trips
WHERE assigned_pilot_id = (SELECT id FROM pilots WHERE name = 'Juan Pérez')
AND status = 'completed';

-- ============================================================
-- 8️⃣ LIMPIEZA / RESET (Solo para desarrollo)
-- ============================================================

-- ⚠️  CUIDADO: Esto borra TODO

-- Borrar todos los viajes de un piloto
-- DELETE FROM trips
-- WHERE assigned_pilot_id = (SELECT id FROM pilots WHERE name = 'Juan Pérez');

-- Borrar todos los pilotos (incluyendo los usuarios asociados)
-- DELETE FROM pilots;

-- Resetear sequences (si usas INTEGER IDs)
-- ALTER SEQUENCE pilots_id_seq RESTART WITH 1;
-- ALTER SEQUENCE trips_id_seq RESTART WITH 1;

-- ============================================================
-- NOTAS IMPORTANTES
-- ============================================================
/*

1. PERMISOS:
   - Los pilotos SOLO ven sus propios datos (por RLS)
   - El admin puede ver todo (configura políticas adicionales si es necesario)

2. COORDINADAS GPS:
   - Formato: "latitude,longitude" en campo start_location
   - Ej: "14.6349,-90.5069"
   - Guatemala City: 14.6349, -90.5069
   - Puerto Barrios: 15.7282, -88.5853

3. TIMESTAMP:
   - Se guardan en formato ISO 8601
   - Supabase usa UTC automáticamente

4. STATES/STATUS:
   - pending: Viaje creado pero sin asignar
   - assigned: Viaje asignado, esperando inicio
   - in_progress: Viaje iniciado por el piloto
   - completed: Viaje finalizado
   - cancelled: Viaje cancelado

5. TESTING:
   - Crea 1 usuario + 1 piloto + 2-3 viajes
   - Prueba login y visualización
   - Inicia un viaje y verifica GPS

*/
