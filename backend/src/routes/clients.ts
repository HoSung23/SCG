import { Router } from 'express'
import * as c from '../controllers/clients.js'

const router = Router()
router.get('/', c.listClients)
router.post('/', c.createClient)
router.get('/:id', c.getClient)
router.put('/:id', c.updateClient)
router.delete('/:id', c.deleteClient)
export default router
