import { Router } from 'express';
import * as truckController from '../controllers/trucks.js';
const router = Router();
router.get('/', truckController.listTrucks);
router.post('/', truckController.createTruck);
router.get('/:id', truckController.getTruck);
router.put('/:id', truckController.updateTruck);
router.delete('/:id', truckController.deleteTruck);
export default router;
//# sourceMappingURL=trucks.js.map