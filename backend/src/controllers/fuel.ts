import { Request, Response } from 'express'
import * as db from '../utils/database.js'
import type { FuelRecord } from '../types/index.js'

export async function listFuelRecords(req: Request, res: Response) {
  try {
    const records = await db.getAllFuelRecords()
    res.json(records)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch fuel records' })
  }
}

export async function recordFuel(req: Request, res: Response) {
  try {
    const { truckId, station, dieselPriceGtq, gallonsDispensed, totalCostGtq, meterKm, notes } = req.body

    if (!truckId || !station || !dieselPriceGtq || !gallonsDispensed || !totalCostGtq) {
      res.status(400).json({ error: 'Missing required fields' })
      return
    }

    const record: Omit<FuelRecord, 'id' | 'createdAt' | 'updatedAt'> = {
      truckId,
      station,
      dieselPriceGtq,
      gallonsDispensed,
      totalCostGtq,
      meterKm,
      recordedAt: new Date().toISOString(),
      notes
    }

    const newRecord = await db.createFuelRecord(record)
    res.status(201).json(newRecord)
  } catch (error) {
    res.status(500).json({ error: 'Failed to record fuel' })
  }
}
