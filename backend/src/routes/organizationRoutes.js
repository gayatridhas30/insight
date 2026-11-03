import { Router } from 'express';
import {
  createOrganization,
  getMyOrganizations,
  getOrganizationById,
  inviteMember,
  updateMemberRole,
  removeMember,
} from '../controllers/organizationController.js';
import { protect, requireOrgRole } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.post('/', createOrganization);
router.get('/my', getMyOrganizations);
router.get('/:orgId', getOrganizationById);
router.post('/:orgId/invite', requireOrgRole('owner', 'admin'), inviteMember);
router.put('/:orgId/members/:memberId', requireOrgRole('owner', 'admin'), updateMemberRole);
router.delete('/:orgId/members/:memberId', requireOrgRole('owner', 'admin'), removeMember);

export default router;
