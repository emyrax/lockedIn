import { Router } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { ROLES } from '../config/constants.js';
import * as electionController from '../controllers/elections.js';

const router = Router();

const ADMIN = [ROLES.ELECTO, ROLES.SUPER_ADMIN];
const VOTER = [ROLES.STUDENT, ROLES.ALUMNUS];

router.get('/', optionalAuth, electionController.list);
router.get('/my-candidacy', authenticate, electionController.myCandidacy);
router.get('/:id', optionalAuth, electionController.get);
router.get('/:id/results', optionalAuth, electionController.results);
router.get('/:id/verify', electionController.verifyVote);
router.post('/:id/apply', authenticate, requireRole(...VOTER), electionController.apply);
router.post('/:id/vote', authenticate, requireRole(...VOTER), electionController.vote);
router.get('/:id/my-status', authenticate, electionController.myVoteStatus);

router.post('/', authenticate, requireRole(...ADMIN), electionController.create);
router.patch('/:id', authenticate, requireRole(...ADMIN), electionController.update);
router.patch('/:id/status', authenticate, requireRole(...ADMIN), electionController.transitionStatus);
router.patch('/:id/results', authenticate, requireRole(...ADMIN), electionController.publishResults);
router.get('/:id/phase', authenticate, requireRole(...ADMIN), electionController.phaseInfo);

router.get('/:electionId/positions', optionalAuth, electionController.listPositions);
router.post('/:electionId/positions', authenticate, requireRole(...ADMIN), electionController.createPosition);
router.patch('/positions/:id', authenticate, requireRole(...ADMIN), electionController.updatePosition);
router.delete('/positions/:id', authenticate, requireRole(...ADMIN), electionController.deletePosition);

router.get('/:electionId/candidates', authenticate, requireRole(...ADMIN), electionController.adminListCandidates);
router.post('/candidates/enroll', authenticate, requireRole(...ADMIN), electionController.enrollCandidate);
router.patch('/candidates/:id/verify', authenticate, requireRole(...ADMIN), electionController.verifyCandidate);
router.patch('/candidates/:id/reject', authenticate, requireRole(...ADMIN), electionController.rejectCandidate);

router.get('/:id/voters', authenticate, requireRole(...ADMIN), electionController.voterRegistry);

export default router;