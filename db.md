-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.trucks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  plate character varying NOT NULL UNIQUE,
  model character varying NOT NULL,
  year integer NOT NULL,
  fuel_km_per_gallon numeric NOT NULL,
  status character varying DEFAULT 'active'::character varying,
  ownership_type character varying DEFAULT 'propia'::character varying,
  gps_device_id character varying,
  last_gps_update timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT trucks_pkey PRIMARY KEY (id)
);
CREATE TABLE public.pilots (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  license_type character varying NOT NULL,
  license_number character varying NOT NULL,
  license_due date NOT NULL,
  license_status character varying DEFAULT 'valid'::character varying,
  assigned_truck_id uuid,
  status character varying DEFAULT 'active'::character varying,
  phone_number character varying,
  email character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT pilots_pkey PRIMARY KEY (id),
  CONSTRAINT pilots_assigned_truck_id_fkey FOREIGN KEY (assigned_truck_id) REFERENCES public.trucks(id)
);
CREATE TABLE public.trips (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  truck_id uuid NOT NULL,
  pilot_id uuid NOT NULL,
  origin character varying NOT NULL,
  destination character varying NOT NULL,
  distance_km numeric NOT NULL,
  estimated_time_hours integer DEFAULT 4,
  status character varying DEFAULT 'programado'::character varying,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  fuel_consumption_gallons numeric,
  cost_gtq numeric,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  trip_code character varying,
  customer character varying,
  material character varying,
  order_number character varying,
  delivery_number character varying,
  transport_company character varying,
  tons numeric,
  assigned_trips integer,
  completed_trips integer,
  price_per_ton numeric,
  total_without_tax numeric,
  pilot_payment numeric,
  CONSTRAINT trips_pkey PRIMARY KEY (id),
  CONSTRAINT trips_truck_id_fkey FOREIGN KEY (truck_id) REFERENCES public.trucks(id),
  CONSTRAINT trips_pilot_id_fkey FOREIGN KEY (pilot_id) REFERENCES public.pilots(id)
);
CREATE TABLE public.maintenance_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  truck_id uuid NOT NULL,
  type character varying NOT NULL,
  description text NOT NULL,
  due_in_km integer,
  current_km integer,
  status character varying DEFAULT 'programado'::character varying,
  estimated_cost_gtq numeric,
  actual_cost_gtq numeric,
  scheduled_date date,
  completed_date date,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT maintenance_tasks_pkey PRIMARY KEY (id),
  CONSTRAINT maintenance_tasks_truck_id_fkey FOREIGN KEY (truck_id) REFERENCES public.trucks(id)
);
CREATE TABLE public.fuel_records (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  truck_id uuid NOT NULL,
  station character varying NOT NULL,
  diesel_price_gtq numeric NOT NULL,
  gallons_dispensed numeric NOT NULL,
  total_cost_gtq numeric NOT NULL,
  meter_km integer,
  recorded_at timestamp with time zone DEFAULT now(),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT fuel_records_pkey PRIMARY KEY (id),
  CONSTRAINT fuel_records_truck_id_fkey FOREIGN KEY (truck_id) REFERENCES public.trucks(id)
);
CREATE TABLE public.cost_records (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  category character varying NOT NULL,
  description text NOT NULL,
  amount_gtq numeric NOT NULL,
  related_truck_id uuid,
  related_pilot_id uuid,
  recorded_at timestamp with time zone DEFAULT now(),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT cost_records_pkey PRIMARY KEY (id),
  CONSTRAINT cost_records_related_truck_id_fkey FOREIGN KEY (related_truck_id) REFERENCES public.trucks(id),
  CONSTRAINT cost_records_related_pilot_id_fkey FOREIGN KEY (related_pilot_id) REFERENCES public.pilots(id)
);
CREATE TABLE public.alerts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  level character varying NOT NULL,
  title character varying NOT NULL,
  detail text,
  related_truck_id uuid,
  related_pilot_id uuid,
  related_trip_id uuid,
  resolved boolean DEFAULT false,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT alerts_pkey PRIMARY KEY (id),
  CONSTRAINT alerts_related_truck_id_fkey FOREIGN KEY (related_truck_id) REFERENCES public.trucks(id),
  CONSTRAINT alerts_related_pilot_id_fkey FOREIGN KEY (related_pilot_id) REFERENCES public.pilots(id),
  CONSTRAINT alerts_related_trip_id_fkey FOREIGN KEY (related_trip_id) REFERENCES public.trips(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email character varying NOT NULL UNIQUE,
  name character varying NOT NULL,
  role character varying DEFAULT 'piloto'::character varying,
  status character varying DEFAULT 'active'::character varying,
  last_login_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
CREATE TABLE public.auth_users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  name text NOT NULL,
  role text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT auth_users_pkey PRIMARY KEY (id)
);
CREATE TABLE public.programacion (
  id bigint NOT NULL DEFAULT nextval('programacion_id_seq'::regclass),
  transportista character varying,
  codigo character varying,
  placa character varying,
  nombre character varying,
  origen character varying,
  destino character varying,
  material character varying,
  pedido character varying,
  entrega character varying,
  transporte character varying,
  created_at timestamp with time zone DEFAULT now(),
  orden integer,
  pilot_id uuid,
  truck_id uuid,
  trip_id uuid,
  status text NOT NULL DEFAULT 'pendiente'::text,
  assigned_at timestamp with time zone,
  assigned_by text,
  fecha_programacion date,
  CONSTRAINT programacion_pkey PRIMARY KEY (id),
  CONSTRAINT programacion_pilot_id_fkey FOREIGN KEY (pilot_id) REFERENCES public.pilots(id),
  CONSTRAINT programacion_truck_id_fkey FOREIGN KEY (truck_id) REFERENCES public.trucks(id),
  CONSTRAINT programacion_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id)
);
CREATE TABLE public.clients (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  nit character varying,
  contact_name character varying,
  phone character varying,
  email character varying,
  address text,
  status character varying DEFAULT 'active'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT clients_pkey PRIMARY KEY (id)
);
CREATE TABLE public.materials (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL UNIQUE,
  unit character varying DEFAULT 'TN'::character varying,
  description text,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT materials_pkey PRIMARY KEY (id)
);
CREATE TABLE public.tires (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  truck_id uuid NOT NULL,
  brand character varying NOT NULL,
  model character varying,
  serial_number character varying,
  position character varying NOT NULL,
  purchase_cost_gtq numeric,
  installed_km integer,
  current_km integer DEFAULT 0,
  installation_date date,
  expected_life_km integer,
  status character varying DEFAULT 'active'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tires_pkey PRIMARY KEY (id),
  CONSTRAINT tires_truck_id_fkey FOREIGN KEY (truck_id) REFERENCES public.trucks(id)
);
CREATE TABLE public.tire_incidents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tire_id uuid NOT NULL,
  incident_type character varying NOT NULL,
  incident_date date NOT NULL,
  cost_gtq numeric,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tire_incidents_pkey PRIMARY KEY (id),
  CONSTRAINT tire_incidents_tire_id_fkey FOREIGN KEY (tire_id) REFERENCES public.tires(id)
);
CREATE TABLE public.pilot_payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  pilot_id uuid NOT NULL,
  week_number integer NOT NULL,
  month integer NOT NULL,
  year integer NOT NULL,
  trips_completed integer DEFAULT 0,
  kilometers numeric DEFAULT 0,
  base_payment_gtq numeric DEFAULT 0,
  bonus_gtq numeric DEFAULT 0,
  deductions_gtq numeric DEFAULT 0,
  total_payment_gtq numeric DEFAULT 0,
  status character varying DEFAULT 'pending'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT pilot_payments_pkey PRIMARY KEY (id),
  CONSTRAINT pilot_payments_pilot_id_fkey FOREIGN KEY (pilot_id) REFERENCES public.pilots(id)
);
CREATE TABLE public.bonuses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  pilot_id uuid,
  description text NOT NULL,
  amount_gtq numeric NOT NULL,
  bonus_date date NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT bonuses_pkey PRIMARY KEY (id),
  CONSTRAINT bonuses_pilot_id_fkey FOREIGN KEY (pilot_id) REFERENCES public.pilots(id)
);
CREATE TABLE public.production_records (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  trip_id uuid,
  trip_date date NOT NULL,
  tons numeric NOT NULL,
  income_gtq numeric DEFAULT 0,
  cost_gtq numeric DEFAULT 0,
  profit_gtq numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT production_records_pkey PRIMARY KEY (id),
  CONSTRAINT production_records_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id)
);
CREATE TABLE public.imports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  file_name character varying NOT NULL,
  total_rows integer DEFAULT 0,
  processed_rows integer DEFAULT 0,
  success_rows integer DEFAULT 0,
  failed_rows integer DEFAULT 0,
  status character varying DEFAULT 'processing'::character varying,
  started_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  CONSTRAINT imports_pkey PRIMARY KEY (id)
);
CREATE TABLE public.import_errors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  import_id uuid NOT NULL,
  row_number integer,
  error_message text,
  raw_data jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT import_errors_pkey PRIMARY KEY (id),
  CONSTRAINT import_errors_import_id_fkey FOREIGN KEY (import_id) REFERENCES public.imports(id)
);
CREATE TABLE public.trip_locations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  speed_kmh numeric,
  recorded_at timestamp with time zone DEFAULT now(),
  CONSTRAINT trip_locations_pkey PRIMARY KEY (id),
  CONSTRAINT trip_locations_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id)
);
CREATE TABLE public.gmail_processing_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  gmail_message_id text NOT NULL,
  subject text,
  received_at timestamp with time zone,
  processed_at timestamp with time zone DEFAULT now(),
  rows_inserted integer DEFAULT 0,
  status text NOT NULL DEFAULT 'success'::text,
  error_message text,
  raw_snippet text,
  CONSTRAINT gmail_processing_logs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.fuel_prices_cache (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  diesel_precio numeric NOT NULL DEFAULT 0,
  gasolina_regular numeric NOT NULL DEFAULT 0,
  gasolina_super numeric NOT NULL DEFAULT 0,
  kerosene numeric NOT NULL DEFAULT 0,
  source character varying NOT NULL DEFAULT 'MEM'::character varying,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT fuel_prices_cache_pkey PRIMARY KEY (id)
);