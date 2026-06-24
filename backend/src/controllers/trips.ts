import { Request, Response } from 'express'
import * as db from '../utils/database.js'
import type { Trip } from '../types/index.js'

export async function listTrips(req: Request, res: Response) {
  try {
    const { fechaInicio, fechaFin, status } = req.query

    let trips: Trip[]
    if (fechaInicio || fechaFin || status) {
      trips = await db.getTripsByDateRange(
        String(fechaInicio ?? ''),
        String(fechaFin ?? ''),
        String(status ?? '')
      )
    } else {
      trips = await db.getAllTrips()
    }
    res.json(trips)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trips' })
  }
}

export async function getTrip(req: Request, res: Response) {
  try {
    const trip = await db.getTripById(req.params.id)
    res.json(trip)
  } catch (error) {
    res.status(404).json({ error: 'Trip not found' })
  }
}

export async function createTrip(req: Request, res: Response) {
  try {
    const { truckCodigo, pilotId, origin, destination, distanceKm, estimatedTimeHours, notes } = req.body

    if (!truckCodigo || !pilotId || !origin || !destination || !distanceKm) {
      res.status(400).json({ error: 'Missing required fields' })
      return
    }

    const trip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'> = {
      truckCodigo,
      pilotId,
      origin,
      destination,
      distanceKm,
      estimatedTimeHours: estimatedTimeHours || 4,
      status: 'programado',
      notes
    }

    const newTrip = await db.createTrip(trip)
    res.status(201).json(newTrip)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create trip' })
  }
}

export async function updateTripStatus(req: Request, res: Response) {
  try {
    const { status } = req.body

    if (!status) {
      res.status(400).json({ error: 'status is required' })
      return
    }

    const updates: Record<string, any> = { status }

    if (status === 'en-ruta') {
      updates.startedAt = new Date().toISOString()
    } else if (status === 'completado') {
      updates.completedAt = new Date().toISOString()
    }

    const updatedTrip = await db.updateTrip(req.params.id, updates)
    res.json(updatedTrip)
  } catch (error) {
    res.status(404).json({ error: 'Trip not found' })
  }
}

export async function startTrip(req: Request, res: Response) {
  try {
    const { gpsInicio, odometroInicio, observaciones } = req.body
    const updates: Record<string, any> = {
      status: 'en-ruta',
      started_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    if (gpsInicio)     updates.gps_inicio      = gpsInicio
    if (odometroInicio !== undefined) updates.odometro_inicio = Number(odometroInicio)
    if (observaciones) updates.notes           = observaciones

    const trip = await db.updateTrip(req.params.id, updates)
    res.json(trip)
  } catch {
    res.status(500).json({ error: 'Error al iniciar viaje' })
  }
}

export async function finishTrip(req: Request, res: Response) {
  try {
    const { gpsFin, odometroFin, observaciones, fuelConsumptionGallons, costGtq } = req.body

    // Obtener viaje actual para calcular km reales
    const { data: current, error: fetchErr } = await (await import('../utils/supabase.js')).supabaseAdmin
      .from('trips')
      .select('odometro_inicio, started_at')
      .eq('id', req.params.id)
      .single()
    if (fetchErr) throw fetchErr

    const kmReales = current?.odometro_inicio && odometroFin
      ? Number(odometroFin) - Number(current.odometro_inicio)
      : null

    const now = new Date()
    const tiempoReal = current?.started_at
      ? Math.round((now.getTime() - new Date(current.started_at).getTime()) / 60000)
      : null

    const updates: Record<string, any> = {
      status: 'completado',
      completed_at: now.toISOString(),
      updated_at: now.toISOString()
    }
    if (gpsFin)     updates.gps_fin          = gpsFin
    if (odometroFin !== undefined) updates.odometro_fin    = Number(odometroFin)
    if (kmReales !== null)  updates.km_reales           = kmReales
    if (tiempoReal !== null) updates.tiempo_real_minutos = tiempoReal
    if (observaciones) updates.notes                  = observaciones
    if (fuelConsumptionGallons) updates.fuel_consumption_gallons = Number(fuelConsumptionGallons)
    if (costGtq) updates.cost_gtq = Number(costGtq)

    const trip = await db.updateTrip(req.params.id, updates)
    res.json(trip)
  } catch {
    res.status(500).json({ error: 'Error al finalizar viaje' })
  }
}
