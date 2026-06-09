create extension if not exists pgcrypto;

create type user_role as enum ('superadmin', 'admin', 'gerente', 'contador', 'piloto');
create type truck_status as enum ('activo', 'mantenimiento', 'inactivo');
create type trip_status as enum ('programado', 'en_ruta', 'completado', 'cancelado');
create type fuel_station as enum ('Shell', 'UNO', 'Puma', 'Otro');
create type fuel_type as enum ('diesel', 'regular', 'super');
create type maintenance_type as enum ('preventivo', 'correctivo', 'emergencia');
create type cost_category as enum ('planilla', 'seguro', 'permiso', 'viatico', 'administrativo', 'combustible_directo', 'otro');

create table if not exists users (
  id uuid primary key,
  name text not null,
  email text not null unique,
  role user_role not null,
  phone text,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists trucks (
  id uuid primary key default gen_random_uuid(),
  plate text not null unique,
  brand text not null,
  model text not null,
  year integer not null,
  capacity_tons numeric(8,2),
  fuel_efficiency numeric(8,2),
  status truck_status not null default 'activo',
  current_driver_id uuid references users(id),
  mileage integer not null default 0,
  last_maintenance_date date,
  next_maintenance_mileage integer,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists drivers (
  id uuid primary key references users(id) on delete cascade,
  license_number text not null,
  license_expiry date not null,
  license_type text,
  truck_id uuid references trucks(id),
  emergency_contact text,
  emergency_phone text
);

create table if not exists fuel_prices (
  id uuid primary key default gen_random_uuid(),
  station fuel_station not null,
  fuel_type fuel_type not null,
  price_per_gallon numeric(10,4) not null,
  price_date date not null,
  source_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists trips (
  id uuid primary key default gen_random_uuid(),
  truck_id uuid not null references trucks(id),
  driver_id uuid not null references users(id),
  origin text not null,
  destination text not null,
  cargo_description text,
  cargo_weight_tons numeric(8,2),
  status trip_status not null default 'programado',
  scheduled_start timestamptz,
  actual_start timestamptz,
  actual_end timestamptz,
  distance_km numeric(10,2),
  fuel_cost numeric(10,2),
  toll_cost numeric(10,2) default 0,
  other_cost numeric(10,2) default 0,
  total_cost numeric(10,2) generated always as (coalesce(fuel_cost,0) + coalesce(toll_cost,0) + coalesce(other_cost,0)) stored,
  start_photo_url text,
  end_photo_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists trip_locations (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  latitude numeric(10,8) not null,
  longitude numeric(11,8) not null,
  speed_kmh numeric(6,2),
  recorded_at timestamptz not null,
  is_offline_sync boolean not null default false
);

create table if not exists maintenance_costs (
  id uuid primary key default gen_random_uuid(),
  truck_id uuid not null references trucks(id),
  type maintenance_type not null,
  description text not null,
  workshop text,
  technician text,
  cost numeric(10,2) not null,
  service_date date not null,
  mileage_at_service integer,
  next_service_mileage integer,
  next_service_date date,
  invoice_number text,
  invoice_photo_url text,
  parts_replaced jsonb,
  created_by uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists general_costs (
  id uuid primary key default gen_random_uuid(),
  category cost_category not null,
  subcategory text,
  description text not null,
  amount numeric(10,2) not null,
  cost_date date not null,
  period_month integer,
  period_year integer,
  truck_id uuid references trucks(id),
  driver_id uuid references users(id),
  invoice_number text,
  attachment_url text,
  created_by uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists incidents (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips(id) on delete set null,
  truck_id uuid not null references trucks(id),
  driver_id uuid not null references users(id),
  type text not null,
  description text not null,
  resolved boolean not null default false,
  resolution_notes text,
  cost numeric(10,2) not null default 0,
  reported_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  action text not null,
  table_name text not null,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address inet,
  created_at timestamptz not null default now()
);

create index if not exists idx_trucks_status on trucks(status);
create index if not exists idx_trips_status on trips(status);
create index if not exists idx_fuel_prices_active on fuel_prices(is_active, price_date desc);
create index if not exists idx_incidents_resolved on incidents(resolved);
