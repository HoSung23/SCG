import { Router } from 'express';
import * as costController from '../controllers/costs.js';
const router = Router();
router.get('/', costController.listCostRecords);
router.get('/summary/by-category', costController.getCostsByCategory);
router.post('/', costController.recordCost);
export default router;
//# sourceMappingURL=costs.js.map