import { Router } from 'express'
import * as m from '../controllers/materials.js'

const router = Router()
router.get('/', m.listMaterials)
router.post('/', m.createMaterial)
router.get('/:id', m.getMaterial)
router.put('/:id', m.updateMaterial)
router.post('/:id/toggle', m.toggleMaterial)
export default router
