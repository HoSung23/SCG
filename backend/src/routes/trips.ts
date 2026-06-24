import { Router } from 'express'
import * as tripController from '../controllers/trips.js'

const router = Router()

router.get('/', tripController.listTrips)
router.post('/', tripController.createTrip)
router.get('/:id', tripController.getTrip)
router.put('/:id/status', tripController.updateTripStatus)
router.post('/:id/start', tripController.startTrip)
router.post('/:id/finish', tripController.finishTrip)

export default router
