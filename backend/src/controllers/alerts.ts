import { Request, Response } from 'express'
import * as db from '../utils/database.js'
import type { AlertItem } from '../types/index.js'

export async function listAlerts(req: Request, res: Response) {
  try {
    const alerts = await db.getAllAlerts()
    res.json(alerts)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alerts' })
  }
}

export async function createAlert(req: Request, res: Response) {
  try {
    const { level, title, detail, relatedTruckId, relatedPilotId, relatedTripId } = req.body

    if (!level || !title) {
      res.status(400).json({ error: 'Missing required fields' })
      return
    }

    const alert: Omit<AlertItem, 'id' | 'createdAt' | 'updatedAt'> = {
      level,
      title,
      detail: detail ?? '',
      relatedTruckId,
      relatedPilotId,
      relatedTripId,
      resolved: false
    }

    const newAlert = await db.createAlert(alert)
    res.status(201).json(newAlert)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create alert' })
  }
}

export async function resolveAlert(req: Request, res: Response) {
  try {
    const updatedAlert = await db.resolveAlert(req.params.id)
    res.json(updatedAlert)
  } catch (error) {
    res.status(404).json({ error: 'Alert not found' })
  }
}
