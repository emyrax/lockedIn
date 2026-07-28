import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { ROLES } from '../config/constants.js';
import * as alumniController from '../controllers/alumni.js';

const router = Router();
const ADMIN = [ROLES.ELECTO, ROLES.SUPER_ADMIN];

router.get('/', alumniController.listJobsPublic);
router.get('/my', authenticate, requireRole(ROLES.ALUMNUS), alumniController.myJobs);
router.post('/', authenticate, requireRole(ROLES.ALUMNUS), alumniController.createJob);
router.patch('/:id', authenticate, requireRole(ROLES.ALUMNUS), alumniController.updateJob);
router.delete('/:id', authenticate, requireRole(ROLES.ALUMNUS), alumniController.deleteJob);
router.get('/:id', alumniController.getJobPublic);

router.get('/admin/all', authenticate, requireRole(...ADMIN), alumniController.adminListJobs);
router.patch('/admin/:id/approve', authenticate, requireRole(...ADMIN), alumniController.adminApproveJob);
router.patch('/admin/:id/reject', authenticate, requireRole(...ADMIN), alumniController.adminRejectJob);

export default router;