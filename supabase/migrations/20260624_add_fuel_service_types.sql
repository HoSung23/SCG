-- Migración: Agregar servicios de combustible (Puma con vale + Bomba propia)
-- Agregar campos para identificar el tipo de servicio y quién lo maneja

ALTER TABLE public.fuel_records
  ADD COLUMN IF NOT EXISTS service_type text DEFAULT 'pump'::text,
  ADD COLUMN IF NOT EXISTS handler_codigo text,
  ADD COLUMN IF NOT EXISTS handler_name text,
  ADD COLUMN IF NOT EXISTS credit_voucher_number text,
  ADD COLUMN IF NOT EXISTS notes_extended text;

-- Comentarios de documentación
COMMENT ON COLUMN public.fuel_records.service_type IS 'Tipo de servicio: pump (bomba propia) o puma_credit (Puma con vale de crédito)';
COMMENT ON COLUMN public.fuel_records.handler_codigo IS 'Código del encargado del servicio (ej: empleado, conductor)';
COMMENT ON COLUMN public.fuel_records.handler_name IS 'Nombre del encargado del servicio';
COMMENT ON COLUMN public.fuel_records.credit_voucher_number IS 'Número de vale de crédito (aplica para Puma)';
COMMENT ON COLUMN public.fuel_records.notes_extended IS 'Notas adicionales sobre el servicio';

-- Crear índice para búsquedas por tipo de servicio
CREATE INDEX IF NOT EXISTS idx_fuel_records_service_type ON public.fuel_records(service_type);
CREATE INDEX IF NOT EXISTS idx_fuel_records_handler_codigo ON public.fuel_records(handler_codigo);
