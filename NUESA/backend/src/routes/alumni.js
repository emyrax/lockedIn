import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { ROLES } from '../config/constants.js';
import * as alumniController from '../controllers/alumni.js';

const router = Router();
const ADMIN = [ROLES.ELECTO, ROLES.SUPER_ADMIN];

router.get('/', alumniController.list);
router.get('/featured', alumniController.featured);
router.get('/profile', authenticate, requireRole(ROLES.ALUMNUS), alumniController.getMyProfile);
router.post('/profile', authenticate, requireRole(ROLES.ALUMNUS), alumniController.upsertProfile);
router.patch('/profile', authenticate, requireRole(ROLES.ALUMNUS), alumniController.upsertProfile);
router.get('/:id', alumniController.get);

router.get('/:userId/jobs', alumniController.getAlumniJobs);

router.get('/admin/all', authenticate, requireRole(...ADMIN), alumniController.adminListAlumni);
router.patch('/admin/:id/feature', authenticate, requireRole(...ADMIN), alumniController.adminToggleFeature);
router.patch('/admin/:id/visibility', authenticate, requireRole(...ADMIN), alumniController.adminToggleVisibility);

export default router;