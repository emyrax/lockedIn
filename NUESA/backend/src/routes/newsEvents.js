import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { ROLES } from '../config/constants.js';
import * as newsEventsController from '../controllers/newsEvents.js';

const router = Router();
const EDITORS = [ROLES.ELECTO, ROLES.SUPER_ADMIN, ROLES.STAFF];

router.get('/', newsEventsController.listPublished);
router.get('/categories', newsEventsController.listCategories);
router.get('/:slug', newsEventsController.getBySlug);
router.post('/:id/rsvp', authenticate, newsEventsController.rsvp);
router.get('/:id/rsvp-count', newsEventsController.rsvpCount);

router.get('/admin/all', authenticate, requireRole(...EDITORS), newsEventsController.adminList);
router.post('/admin', authenticate, requireRole(...EDITORS), newsEventsController.adminCreate);
router.patch('/admin/:id', authenticate, requireRole(...EDITORS), newsEventsController.adminUpdate);
router.delete('/admin/:id', authenticate, requireRole(...EDITORS), newsEventsController.adminDelete);
router.patch('/admin/:id/publish', authenticate, requireRole(...EDITORS), newsEventsController.adminTogglePublish);
router.patch('/admin/:id/feature', authenticate, requireRole(...EDITORS), newsEventsController.adminToggleFeature);

export default router;