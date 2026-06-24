-- ============================================================
-- Tabla: fuel_prices_cache
-- Almacena precios de combustible obtenidos del MEM Guatemala
-- Fuente: https://www.mem.gob.gt/
-- ============================================================

CREATE TABLE IF NOT EXISTS fuel_prices_cache (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date          DATE NOT NULL,
  diesel_precio DECIMAL(8, 2) NOT NULL DEFAULT 0,
  gasolina_regular DECIMAL(8, 2) NOT NULL DEFAULT 0,
  gasolina_super   DECIMAL(8, 2) NOT NULL DEFAULT 0,
  kerosene         DECIMAL(8, 2) NOT NULL DEFAULT 0,
  source        VARCHAR(50) NOT NULL DEFAULT 'MEM',
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT now(),

  CONSTRAINT fuel_prices_cache_date_unique UNIQUE (date)
);

-- Índice para búsqueda por fecha descendente
CREATE INDEX IF NOT EXISTS idx_fuel_prices_date ON fuel_prices_cache (date DESC);

-- Insertar precio de referencia inicial (precio promedio diesel Guatemala 2026)
INSERT INTO fuel_prices_cache (date, diesel_precio, gasolina_regular, gasolina_super, kerosene, source)
VALUES (CURRENT_DATE, 37.00, 38.50, 40.00, 35.00, 'manual-seed')
ON CONFLICT (date) DO NOTHING;
