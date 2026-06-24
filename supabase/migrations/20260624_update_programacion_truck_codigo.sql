-- Migración: Actualizar tabla programacion para usar truck_codigo
-- Agregar truck_codigo y migrar datos de truck_id

-- 1. Agregar columna truck_codigo si no existe
ALTER TABLE public.programacion
  ADD COLUMN IF NOT EXISTS truck_codigo text REFERENCES public.trucks(codigo);

-- 2. Migrar datos de truck_id a truck_codigo
UPDATE public.programacion p
SET truck_codigo = t.codigo
FROM public.trucks t
WHERE p.truck_id = t.id AND p.truck_codigo IS NULL;

-- 3. Crear índice para truck_codigo
CREATE INDEX IF NOT EXISTS idx_programacion_truck_codigo ON public.programacion(truck_codigo);

-- 4. Comentario de documentación
COMMENT ON COLUMN public.programacion.truck_codigo IS 'Código único del camión asignado (referencia a trucks.codigo)';
