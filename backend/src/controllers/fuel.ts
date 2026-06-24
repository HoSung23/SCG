import { Request, Response } from 'express'
import * as db from '../utils/database.js'
import { supabaseAdmin } from '../utils/supabase.js'
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
    const { 
      truckId, 
      station, 
      dieselPriceGtq, 
      gallonsDispensed, 
      meterKm, 
      notes,
      serviceType = 'pump',
      handlerCodigo,
      handlerName,
      creditVoucherNumber,
      notesExtended
    } = req.body

    if (!truckId || !station || !dieselPriceGtq || !gallonsDispensed) {
      res.status(400).json({ error: 'truckId, station, dieselPriceGtq y gallonsDispensed son requeridos' })
      return
    }
    if (Number(gallonsDispensed) <= 0) {
      res.status(400).json({ error: 'Galones debe ser mayor a 0' })
      return
    }
    if (Number(dieselPriceGtq) <= 0) {
      res.status(400).json({ error: 'Precio debe ser mayor a 0' })
      return
    }

    // Validar serviceType
    if (!['pump', 'puma_credit'].includes(serviceType)) {
      res.status(400).json({ error: 'serviceType debe ser "pump" o "puma_credit"' })
      return
    }

    // Si es Puma con vale, requiere número de vale
    if (serviceType === 'puma_credit' && !creditVoucherNumber) {
      res.status(400).json({ error: 'creditVoucherNumber es requerido para servicio Puma' })
      return
    }

    // Validar que odómetro sea mayor al registro anterior del mismo camión
    if (meterKm !== undefined && meterKm !== null) {
      const { data: lastRecord } = await supabaseAdmin
        .from('fuel_records')
        .select('meter_km')
        .eq('truck_id', truckId)
        .not('meter_km', 'is', null)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .single()

      if (lastRecord?.meter_km && Number(meterKm) <= Number(lastRecord.meter_km)) {
        res.status(400).json({ error: `Odómetro debe ser mayor al registro anterior: ${lastRecord.meter_km} km` })
        return
      }
    }

    const totalCostGtq = Number(dieselPriceGtq) * Number(gallonsDispensed)

    const record: Omit<FuelRecord, 'id' | 'createdAt' | 'updatedAt'> = {
      truckId,
      station,
      serviceType: serviceType as 'pump' | 'puma_credit',
      handlerCodigo,
      handlerName,
      creditVoucherNumber: serviceType === 'puma_credit' ? creditVoucherNumber : undefined,
      dieselPriceGtq: Number(dieselPriceGtq),
      gallonsDispensed: Number(gallonsDispensed),
      totalCostGtq,
      meterKm: meterKm ? Number(meterKm) : undefined,
      recordedAt: new Date().toISOString(),
      notes,
      notesExtended
    }

    const newRecord = await db.createFuelRecord(record)
    res.status(201).json(newRecord)
  } catch (error) {
    res.status(500).json({ error: 'Failed to record fuel' })
  }
}
