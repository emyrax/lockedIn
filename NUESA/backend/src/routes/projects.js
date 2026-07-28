import { Router } from 'express';
import { z } from 'zod';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { ROLES } from '../config/constants.js';
import * as projectController from '../controllers/projects.js';

const router = Router();

const submitSchema = z.object({
  title: z.string().min(3).max(300),
  tagline: z.string().max(200).optional(),
  description: z.string().min(20).max(10000),
  category: z.enum(['research', 'startup', 'capstone', 'hackathon', 'innovation']).optional(),
  department: z.string().length(3).optional(),
  team_members: z.array(z.object({ name: z.string(), role: z.string() })).optional(),
  mentor_name: z.string().max(200).optional(),
  cover_image: z.string().url().optional(),
  gallery: z.array(z.string().url()).optional(),
  video_url: z.string().url().optional(),
  github_url: z.string().url().optional(),
  demo_url: z.string().url().optional(),
  tech_stack: z.array(z.string()).optional(),
  sdg_tags: z.array(z.string()).optional(),
});

const collabSchema = z.object({
  message: z.string().max(500).optional(),
});

const collabResponseSchema = z.object({
  status: z.enum(['accepted', 'rejected']),
});

router.get('/', optionalAuth, projectController.list);
router.get('/featured', projectController.featured);
router.get('/my', authenticate, projectController.my);
router.get('/:id', optionalAuth, projectController.get);
router.post('/', authenticate, requireRole(ROLES.STUDENT, ROLES.ALUMNUS), validate(submitSchema), projectController.create);
router.patch('/:id', authenticate, projectController.update);
router.delete('/:id', authenticate, projectController.remove);
router.post('/:id/upvote', authenticate, projectController.upvote);
router.post('/:id/collab', authenticate, requireRole(ROLES.STUDENT), validate(collabSchema), projectController.collabRequest);
router.patch('/collabs/:collabId', authenticate, validate(collabResponseSchema), projectController.collabRespond);
router.patch('/:id/approve', authenticate, requireRole(ROLES.SUPER_ADMIN), projectController.approve);
router.patch('/:id/feature', authenticate, requireRole(ROLES.SUPER_ADMIN), projectController.feature);
router.get('/admin/all', authenticate, requireRole(ROLES.SUPER_ADMIN), projectController.adminList);

export default router;