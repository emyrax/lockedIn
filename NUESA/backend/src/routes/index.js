import { Router } from 'express';

import authRoutes from './auth.js';
import userRoutes from './users.js';
import sectionRoutes from './sections.js';
import projectRoutes from './projects.js';
import electionRoutes from './elections.js';
import alumniRoutes from './alumni.js';
import jobRoutes from './jobs.js';
import newsEventsRoutes from './newsEvents.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/sections', sectionRoutes);
router.use('/projects', projectRoutes);
router.use('/elections', electionRoutes);
router.use('/alumni', alumniRoutes);
router.use('/jobs', jobRoutes);
router.use('/news-events', newsEventsRoutes);

export default router;
