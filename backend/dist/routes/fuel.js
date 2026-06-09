import { Router } from 'express';
import * as fuelController from '../controllers/fuel.js';
const router = Router();
router.get('/', fuelController.listFuelRecords);
router.post('/', fuelController.recordFuel);
export default router;
//# sourceMappingURL=fuel.js.map