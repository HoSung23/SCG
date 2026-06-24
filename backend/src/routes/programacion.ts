import { Router } from 'express'
import * as c from '../controllers/programacion.js'

const router = Router()
router.get('/', c.listProgramacion)
router.get('/:id', c.getProgramacion)
router.post('/:id/assign-pilot', c.assignPilot)
router.post('/:id/assign-truck', c.assignTruck)
router.post('/:id/generate-trip', c.generateTrip)
router.post('/auto-assign/by-code', c.autoAssignByCodeRoute)
router.post('/auto-assign/batch', c.autoAssignBatchRoute)
router.post('/auto-assign/pending', c.autoAssignPendingRoute)
export default router
