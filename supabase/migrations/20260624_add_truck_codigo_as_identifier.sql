-- Migración: Agregar código único a trucks y convertir a identificador principal
-- Este cambio permite usar truck_codigo en lugar de truck_id en todo el sistema

-- 1. Agregar columna codigo si no existe (nullable primero)
ALTER TABLE public.trucks
  ADD COLUMN IF NOT EXISTS codigo text UNIQUE;

-- 2. Generar códigos para trucks existentes (formato: T-XXXXXX basado en plate)
UPDATE public.trucks
SET codigo = CASE
  WHEN codigo IS NULL THEN 'T-' || LPAD(CAST(ROW_NUMBER() OVER (ORDER BY created_at) AS text), 6, '0')
  ELSE codigo
END
WHERE codigo IS NULL;

-- 3. Hacer codigo NOT NULL después de generar valores
ALTER TABLE public.trucks
  ALTER COLUMN codigo SET NOT NULL;

-- 4. Agregar columna truck_codigo a tablas que lo necesiten
ALTER TABLE public.drivers
  ADD COLUMN IF NOT EXISTS truck_codigo text REFERENCES public.trucks(codigo);

ALTER TABLE public.fuel_prices
  ADD COLUMN IF NOT EXISTS truck_codigo text REFERENCES public.trucks(codigo);

ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS truck_codigo text REFERENCES public.trucks(codigo);

ALTER TABLE public.trip_locations
  ADD COLUMN IF NOT EXISTS truck_codigo text;

ALTER TABLE public.maintenance_costs
  ADD COLUMN IF NOT EXISTS truck_codigo text REFERENCES public.trucks(codigo);

ALTER TABLE public.general_costs
  ADD COLUMN IF NOT EXISTS truck_codigo text REFERENCES public.trucks(codigo);

ALTER TABLE public.incidents
  ADD COLUMN IF NOT EXISTS truck_codigo text REFERENCES public.trucks(codigo);

-- 5. Migrar datos de truck_id a truck_codigo en las tablas que ya usen truck_id
UPDATE public.drivers d
SET truck_codigo = t.codigo
FROM public.trucks t
WHERE d.truck_id = t.id AND d.truck_codigo IS NULL;

UPDATE public.trips tr
SET truck_codigo = t.codigo
FROM public.trucks t
WHERE tr.truck_id = t.id AND tr.truck_codigo IS NULL;

UPDATE public.maintenance_costs mc
SET truck_codigo = t.codigo
FROM public.trucks t
WHERE mc.truck_id = t.id AND mc.truck_codigo IS NULL;

UPDATE public.general_costs gc
SET truck_codigo = t.codigo
FROM public.trucks t
WHERE gc.truck_id = t.id AND gc.truck_codigo IS NULL;

UPDATE public.incidents i
SET truck_codigo = t.codigo
FROM public.trucks t
WHERE i.truck_id = t.id AND i.truck_codigo IS NULL;

-- 6. Crear índices para truck_codigo
CREATE INDEX IF NOT EXISTS idx_drivers_truck_codigo ON public.drivers(truck_codigo);
CREATE INDEX IF NOT EXISTS idx_trips_truck_codigo ON public.trips(truck_codigo);
CREATE INDEX IF NOT EXISTS idx_maintenance_costs_truck_codigo ON public.maintenance_costs(truck_codigo);
CREATE INDEX IF NOT EXISTS idx_general_costs_truck_codigo ON public.general_costs(truck_codigo);
CREATE INDEX IF NOT EXISTS idx_incidents_truck_codigo ON public.incidents(truck_codigo);
CREATE INDEX IF NOT EXISTS idx_trucks_codigo ON public.trucks(codigo);

-- 7. Comentarios para documentación
COMMENT ON COLUMN public.trucks.codigo IS 'Identificador único del camión (ej: T-000001). Este es el identificador principal del sistema.';
COMMENT ON COLUMN public.drivers.truck_codigo IS 'Referencia al código único del camión asignado';
COMMENT ON COLUMN public.trips.truck_codigo IS 'Código del camión que realiza el viaje';
COMMENT ON COLUMN public.maintenance_costs.truck_codigo IS 'Código del camión en mantenimiento';
COMMENT ON COLUMN public.general_costs.truck_codigo IS 'Código del camión asociado al costo (si aplica)';
COMMENT ON COLUMN public.incidents.truck_codigo IS 'Código del camión involucrado en el incidente';
