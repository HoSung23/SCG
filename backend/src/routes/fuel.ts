import { Router } from 'express'
import * as fuelController from '../controllers/fuel.js'
import * as fuelAllocationController from '../controllers/fuelAllocation.js'

const router = Router()

router.get('/', fuelController.listFuelRecords)
router.post('/', fuelController.recordFuel)
router.post('/allocate/calculate', fuelAllocationController.allocateFuelForTruck)
router.get('/allocate/today', fuelAllocationController.getTodaysFuelAllocation)
router.get('/allocate/report', fuelAllocationController.getDailyFuelReportRoute)

export default router
