-- gmail_processing_logs: traza cada correo procesado por el Gmail sync
-- Ejecutar en Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.gmail_processing_logs (
  id              uuid NOT NULL DEFAULT gen_random_uuid(),
  gmail_message_id text NOT NULL,
  subject         text,
  received_at     timestamp with time zone,
  processed_at    timestamp with time zone DEFAULT now(),
  rows_inserted   integer DEFAULT 0,
  status          text NOT NULL DEFAULT 'success',   -- 'success' | 'error' | 'skipped'
  error_message   text,
  raw_snippet     text,
  CONSTRAINT gmail_processing_logs_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS gmail_processing_logs_message_id_idx
  ON public.gmail_processing_logs (gmail_message_id);

CREATE INDEX IF NOT EXISTS gmail_processing_logs_status_idx
  ON public.gmail_processing_logs (status);

CREATE INDEX IF NOT EXISTS gmail_processing_logs_processed_at_idx
  ON public.gmail_processing_logs (processed_at DESC);

COMMENT ON TABLE public.gmail_processing_logs IS
  'Registro de cada correo procesado por el watcher Gmail → programacion';
