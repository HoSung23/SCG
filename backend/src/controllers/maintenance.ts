import { Request, Response } from 'express'
import * as db from '../utils/database.js'
import type { MaintenanceTask } from '../types/index.js'

export async function listMaintenanceTasks(req: Request, res: Response) {
  try {
    const tasks = await db.getAllMaintenanceTasks()
    res.json(tasks)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch maintenance tasks' })
  }
}

export async function createMaintenanceTask(req: Request, res: Response) {
  try {
    const { truckId, type, description, dueInKm, estimatedCostGtq, scheduledDate } = req.body

    if (!truckId || !type || !description) {
      res.status(400).json({ error: 'Missing required fields' })
      return
    }

    const task: Omit<MaintenanceTask, 'id' | 'createdAt' | 'updatedAt'> = {
      truckId,
      type,
      description,
      dueInKm,
      status: 'programado',
      estimatedCostGtq,
      scheduledDate
    }

    const newTask = await db.createMaintenanceTask(task)
    res.status(201).json(newTask)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create maintenance task' })
  }
}

export async function completeMaintenanceTask(req: Request, res: Response) {
  try {
    const { actualCostGtq, notes } = req.body

    const updatedTask = await db.updateMaintenanceTask(req.params.id, {
      status: 'completado',
      completedDate: new Date().toISOString(),
      actualCostGtq,
      notes
    })

    res.json(updatedTask)
  } catch (error) {
    res.status(404).json({ error: 'Maintenance task not found' })
  }
}
