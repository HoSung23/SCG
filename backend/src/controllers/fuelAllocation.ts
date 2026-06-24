import { Request, Response } from 'express'
import {
  calculateDailyFuelAllocation,
  calculateTodaysFuelNeeds,
  getDailyFuelReport
} from '../services/dailyFuelAllocation.js'

/**
 * Calcula asignación de combustible para un camión específico
 */
export async function allocateFuelForTruck(req: Request, res: Response) {
  try {
    const { truckCodigo, estimatedKm, fuelEfficiency } = req.body

    if (!truckCodigo || !estimatedKm) {
      res.status(400).json({ error: 'truckCodigo y estimatedKm son requeridos' })
      return
    }

    const allocation = await calculateDailyFuelAllocation(
      truckCodigo,
      Number(estimatedKm),
      fuelEfficiency ? Number(fuelEfficiency) : undefined
    )

    res.status(allocation.success ? 200 : 400).json(allocation)
  } catch (error) {
    res.status(500).json({ error: 'Failed to allocate fuel' })
  }
}

/**
 * Calcula necesidades de combustible para todos los viajes de hoy
 */
export async function getTodaysFuelAllocation(req: Request, res: Response) {
  try {
    const allocations = await calculateTodaysFuelNeeds()
    const trucks = Array.from(allocations.values())

    res.json({
      date: new Date().toISOString().split('T')[0],
      generatedAt: new Date().toISOString(),
      totalTrucks: trucks.length,
      allocations: trucks,
      totalGallonsNeeded: trucks.reduce((sum, a) => sum + a.allocatedGallons, 0),
      message: `${trucks.length} camión(es) requieren combustible hoy`
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate fuel needs' })
  }
}

/**
 * Genera reporte diario completo de combustible
 */
export async function getDailyFuelReportRoute(req: Request, res: Response) {
  try {
    const report = await getDailyFuelReport()
    res.json(report)
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate fuel report' })
  }
}
