import { Request, Response } from 'express'
import * as db from '../utils/database.js'
import { v4 as uuidv4 } from 'uuid'
import type { Truck } from '../types/index.js'

export async function listTrucks(req: Request, res: Response) {
  try {
    const trucks = await db.getAllTrucks()
    res.json(trucks)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trucks' })
  }
}

export async function getTruck(req: Request, res: Response) {
  try {
    const truck = await db.getTruckById(req.params.id)
    res.json(truck)
  } catch (error) {
    res.status(404).json({ error: 'Truck not found' })
  }
}

export async function createTruck(req: Request, res: Response) {
  try {
    const { plate, model, year, fuelKmPerGallon, ownershipType } = req.body

    if (!plate || !model || !year || !fuelKmPerGallon) {
      res.status(400).json({ error: 'Missing required fields' })
      return
    }

    const truck: Omit<Truck, 'id' | 'createdAt' | 'updatedAt'> = {
      plate,
      model,
      year,
      fuelKmPerGallon,
      ownershipType: ownershipType || 'propia',
      status: 'active'
    }

    const newTruck = await db.createTruck(truck)
    res.status(201).json(newTruck)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create truck' })
  }
}

export async function updateTruck(req: Request, res: Response) {
  try {
    const updatedTruck = await db.updateTruck(req.params.id, req.body)
    res.json(updatedTruck)
  } catch (error) {
    res.status(404).json({ error: 'Truck not found' })
  }
}

export async function deleteTruck(req: Request, res: Response) {
  try {
    await db.updateTruck(req.params.id, { status: 'retired' })
    res.json({ message: 'Truck marked as retired' })
  } catch (error) {
    res.status(404).json({ error: 'Truck not found' })
  }
}
