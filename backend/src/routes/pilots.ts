import { Router } from 'express'
import * as pilotController from '../controllers/pilots.js'

const router = Router()

router.get('/', pilotController.listPilots)
router.post('/', pilotController.createPilot)
router.get('/:id', pilotController.getPilot)
router.put('/:id', pilotController.updatePilot)
router.post('/:id/assign-truck', pilotController.assignTruckToPilot)

export default router
