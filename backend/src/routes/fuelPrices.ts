import { Router } from 'express'
import { getDieselPrice, getTodayPrices, refreshMemPrices } from '../services/memPrices.js'

const router = Router()

/**
 * GET /api/fuel-prices/diesel
 * Obtiene el precio actual de diésel
 */
router.get('/diesel', async (req, res) => {
  try {
    const price = await getDieselPrice()
    res.json({ price, currency: 'GTQ', source: 'MEM' })
  } catch (error) {
    res.status(500).json({ error: 'Error fetching diesel price' })
  }
})

/**
 * GET /api/fuel-prices/today
 * Obtiene todos los precios de hoy
 */
router.get('/today', async (req, res) => {
  try {
    const prices = await getTodayPrices()
    if (!prices) {
      // Retornar precio de referencia cuando no hay datos de MEM
      const fallback = {
        date: new Date().toISOString().split('T')[0],
        dieselPrecio: 37.0,
        gasolinaRegular: 38.5,
        gasolinaSuper: 40.0,
        kerosene: 35.0,
        lastUpdated: new Date().toISOString(),
        source: 'fallback'
      }
      res.json(fallback)
      return
    }
    res.json(prices)
  } catch (error) {
    res.status(500).json({ error: 'Error fetching prices' })
  }
})

/**
 * POST /api/fuel-prices/refresh
 * Fuerza actualización de precios desde MEM
 * (máximo 1 vez por hora por rate limiting)
 */
router.post('/refresh', async (req, res) => {
  try {
    const prices = await refreshMemPrices()
    if (!prices) {
      res.status(404).json({ error: 'Could not fetch prices' })
      return
    }
    res.json({ ...prices, refreshed: true })
  } catch (error) {
    res.status(500).json({ error: 'Error refreshing prices' })
  }
})

export default router
