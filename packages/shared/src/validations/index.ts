import { z } from 'zod'
import { TRIP_STATUSES, TRUCK_STATUSES, USER_ROLES } from '../constants'

export const userRoleSchema = z.enum(USER_ROLES)
export const truckStatusSchema = z.enum(TRUCK_STATUSES)
export const tripStatusSchema = z.enum(TRIP_STATUSES)

export const truckSchema = z.object({
  plate: z.string().min(1),
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1990),
  capacityTons: z.number().min(0),
  fuelEfficiency: z.number().min(0),
  status: truckStatusSchema,
  mileage: z.number().int().min(0)
})

export const tripSchema = z.object({
  truckId: z.string().min(1),
  driverId: z.string().min(1),
  origin: z.string().min(1),
  destination: z.string().min(1),
  status: tripStatusSchema
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})
