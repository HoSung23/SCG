import { supabaseAdmin } from '../utils/supabase.js'

/**
 * Servicio para obtener precios de combustible desde MEM Guatemala
 * Fuente: https://www.mem.gob.gt/
 * Parsea automáticamente los precios publicados diariamente
 */

export interface FuelPrice {
  date: string
  dieselPrecio: number
  gasolinaRegular: number
  gasolinaSuper: number
  kerosene: number
  lastUpdated: string
}

export async function fetchMemPrices(): Promise<FuelPrice | null> {
  try {
    // Intentar obtener desde página oficial MEM
    // URL base: https://www.mem.gob.gt/ (tiene publicados los precios diarios)
    const response = await fetch('https://www.mem.gob.gt/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    if (!response.ok) {
      console.error('[MEM] Error fetching prices:', response.status)
      return getCachedMemPrice()
    }

    const html = await response.text()

    // Parsear precios del HTML (estructura típica de MEM)
    // Patrones comunes: buscar números después de "Diésel", "Gasolina", etc.
    const dieselMatch = html.match(/diésel[:\s]*Q[\s]*(\d+[\.,]\d{2})/i) ||
                       html.match(/diesel[:\s]*Q[\s]*(\d+[\.,]\d{2})/i)
    const gasolinaMatch = html.match(/gasolina\s+regular[:\s]*Q[\s]*(\d+[\.,]\d{2})/i) ||
                         html.match(/gasolina[:\s]*Q[\s]*(\d+[\.,]\d{2})/i)

    if (!dieselMatch) {
      console.warn('[MEM] Could not parse prices from HTML')
      return getCachedMemPrice()
    }

    const prices: FuelPrice = {
      date: new Date().toISOString().split('T')[0],
      dieselPrecio: parseFloat(dieselMatch[1].replace(',', '.')),
      gasolinaRegular: gasolinaMatch ? parseFloat(gasolinaMatch[1].replace(',', '.')) : 0,
      gasolinaSuper: 0,
      kerosene: 0,
      lastUpdated: new Date().toISOString()
    }

    // Cachear en Supabase
    await cacheMemPrice(prices)
    return prices
  } catch (error) {
    console.error('[MEM] Error in fetchMemPrices:', error)
    return getCachedMemPrice()
  }
}

async function cacheMemPrice(prices: FuelPrice): Promise<void> {
  try {
    // Almacenar en tabla fuel_prices_cache
    await supabaseAdmin
      .from('fuel_prices_cache')
      .upsert({
        date: prices.date,
        diesel_precio: prices.dieselPrecio,
        gasolina_regular: prices.gasolinaRegular,
        gasolina_super: prices.gasolinaSuper,
        kerosene: prices.kerosene,
        source: 'MEM',
        updated_at: prices.lastUpdated
      }, { onConflict: 'date' })
  } catch (error) {
    console.error('[MEM] Error caching prices:', error)
  }
}

async function getCachedMemPrice(): Promise<FuelPrice | null> {
  try {
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabaseAdmin
      .from('fuel_prices_cache')
      .select('*')
      .eq('date', today)
      .single()

    if (data) {
      return {
        date: data.date,
        dieselPrecio: data.diesel_precio || 0,
        gasolinaRegular: data.gasolina_regular || 0,
        gasolinaSuper: data.gasolina_super || 0,
        kerosene: data.kerosene || 0,
        lastUpdated: data.updated_at
      }
    }

    // Si no hay precio de hoy, obtener el más reciente
    const { data: latest } = await supabaseAdmin
      .from('fuel_prices_cache')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .single()

    if (latest) {
      return {
        date: latest.date,
        dieselPrecio: latest.diesel_precio || 0,
        gasolinaRegular: latest.gasolina_regular || 0,
        gasolinaSuper: latest.gasolina_super || 0,
        kerosene: latest.kerosene || 0,
        lastUpdated: latest.updated_at
      }
    }

    return null
  } catch (error) {
    console.error('[MEM] Error getting cached price:', error)
    return null
  }
}

/**
 * Obtener precio diésel actual
 * Retorna precio de hoy si existe, sino el más reciente
 */
export async function getDieselPrice(): Promise<number> {
  const prices = await fetchMemPrices()
  return prices?.dieselPrecio || 0
}

/**
 * Obtener todos los precios del día
 */
export async function getTodayPrices(): Promise<FuelPrice | null> {
  return fetchMemPrices()
}

/**
 * Endpoint para actualizar precios manualmente
 */
export async function refreshMemPrices(): Promise<FuelPrice | null> {
  // Evitar llamadas frecuentes (máximo 1 vez por hora)
  const cacheKey = 'mem_prices_last_fetch'
  const lastFetch = await getCache(cacheKey)
  const now = Date.now()

  if (lastFetch && now - lastFetch < 60 * 60 * 1000) {
    console.log('[MEM] Using cached prices, rate limited')
    return getCachedMemPrice()
  }

  await setCache(cacheKey, now)
  return fetchMemPrices()
}

// Simple in-memory cache (en producción usar Redis)
const memCache: Record<string, any> = {}

async function getCache(key: string) {
  return memCache[key]
}

async function setCache(key: string, value: any) {
  memCache[key] = value
}
