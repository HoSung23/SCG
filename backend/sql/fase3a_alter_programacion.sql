-- FASE 3A: ALTER programacion para operación real
-- Ejecutar en Supabase SQL Editor

ALTER TABLE public.programacion
  ADD COLUMN IF NOT EXISTS pilot_id    uuid REFERENCES public.pilots(id),
  ADD COLUMN IF NOT EXISTS truck_id    uuid REFERENCES public.trucks(id),
  ADD COLUMN IF NOT EXISTS trip_id     uuid REFERENCES public.trips(id),
  ADD COLUMN IF NOT EXISTS status      text NOT NULL DEFAULT 'pendiente',
  ADD COLUMN IF NOT EXISTS assigned_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS assigned_by text;

-- Índices para filtros frecuentes
CREATE INDEX IF NOT EXISTS programacion_status_idx   ON public.programacion (status);
CREATE INDEX IF NOT EXISTS programacion_pilot_id_idx ON public.programacion (pilot_id);
CREATE INDEX IF NOT EXISTS programacion_truck_id_idx ON public.programacion (truck_id);
CREATE INDEX IF NOT EXISTS programacion_trip_id_idx  ON public.programacion (trip_id);

-- Agregar columna fecha_programacion para filtrar por día si no existe
ALTER TABLE public.programacion
  ADD COLUMN IF NOT EXISTS fecha_programacion date;

-- Comentarios de estado válidos
-- pendiente | asignado | en_curso | finalizado | cancelado
