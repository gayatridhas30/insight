import { Router } from 'express';
import {
  getPlatformStats,
  getAllUsers,
  toggleUserStatus,
  getAllOrganizations,
  getAllEvents,
  getAuditLogs,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getPlatformStats);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.get('/organizations', getAllOrganizations);
router.get('/events', getAllEvents);
router.get('/audit-logs', getAuditLogs);

export default router;
