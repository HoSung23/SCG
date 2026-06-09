import { Router } from 'express';
import * as maintenanceController from '../controllers/maintenance.js';
const router = Router();
router.get('/', maintenanceController.listMaintenanceTasks);
router.post('/', maintenanceController.createMaintenanceTask);
router.put('/:id/complete', maintenanceController.completeMaintenanceTask);
export default router;
//# sourceMappingURL=maintenance.js.map