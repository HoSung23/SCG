import { Router } from 'express';
import * as alertController from '../controllers/alerts.js';
const router = Router();
router.get('/', alertController.listAlerts);
router.post('/', alertController.createAlert);
router.put('/:id/resolve', alertController.resolveAlert);
export default router;
//# sourceMappingURL=alerts.js.map