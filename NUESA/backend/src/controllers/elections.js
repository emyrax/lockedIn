import * as electionService from '../services/elections.js';

export async function list(req, res, next) {
  try {
    const includeAll = req.user && ['electo', 'super_admin'].includes(req.user.role);
    const result = await electionService.listElections(includeAll);
    res.json(result);
  } catch (err) { next(err); }
}

export async function get(req, res, next) {
  try {
    const result = await electionService.getElection(req.params.id);
    res.json(result);
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    const result = await electionService.createElection(req.body, req.user.sub);
    res.status(201).json(result);
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    const result = await electionService.updateElection(req.params.id, req.body);
    res.json(result);
  } catch (err) { next(err); }
}

export async function transitionStatus(req, res, next) {
  try {
    const result = await electionService.transitionStatus(req.params.id, req.body.status);
    res.json(result);
  } catch (err) { next(err); }
}

export async function publishResults(req, res, next) {
  try {
    const result = await electionService.publishResults(req.params.id, req.body.publish);
    res.json(result);
  } catch (err) { next(err); }
}

export async function listPositions(req, res, next) {
  try {
    const result = await electionService.listPositions(req.params.electionId);
    res.json(result);
  } catch (err) { next(err); }
}

export async function createPosition(req, res, next) {
  try {
    const result = await electionService.createPosition({ ...req.body, election_id: req.params.electionId });
    res.status(201).json(result);
  } catch (err) { next(err); }
}

export async function updatePosition(req, res, next) {
  try {
    const result = await electionService.updatePosition(req.params.id, req.body);
    res.json(result);
  } catch (err) { next(err); }
}

export async function deletePosition(req, res, next) {
  try {
    await electionService.deletePosition(req.params.id);
    res.json({ message: 'Position deleted' });
  } catch (err) { next(err); }
}

export async function apply(req, res, next) {
  try {
    const result = await electionService.applyAsCandidate(req.params.id, req.user.sub, req.body);
    res.status(201).json(result);
  } catch (err) { next(err); }
}

export async function enrollCandidate(req, res, next) {
  try {
    const result = await electionService.enrollCandidate(req.body, req.user.sub);
    res.status(201).json(result);
  } catch (err) { next(err); }
}

export async function verifyCandidate(req, res, next) {
  try {
    const result = await electionService.verifyCandidate(req.params.id, req.user.sub);
    res.json(result);
  } catch (err) { next(err); }
}

export async function rejectCandidate(req, res, next) {
  try {
    const result = await electionService.rejectCandidate(req.params.id, req.user.sub, req.body.note);
    res.json(result);
  } catch (err) { next(err); }
}

export async function adminListCandidates(req, res, next) {
  try {
    const result = await electionService.adminListCandidates(req.params.electionId, req.query.status);
    res.json(result);
  } catch (err) { next(err); }
}

export async function vote(req, res, next) {
  try {
    const result = await electionService.castVote(req.params.id, req.body.position_id, req.body.candidate_id, req.user.sub);
    res.json(result);
  } catch (err) { next(err); }
}

export async function myVoteStatus(req, res, next) {
  try {
    const result = await electionService.myVoteStatus(req.params.id, req.user.sub);
    res.json(result);
  } catch (err) { next(err); }
}

export async function verifyVote(req, res, next) {
  try {
    const result = await electionService.verifyVoteByHash(req.params.id, req.query.hash);
    res.json(result);
  } catch (err) { next(err); }
}

export async function results(req, res, next) {
  try {
    const result = await electionService.getResults(req.params.id);
    res.json(result);
  } catch (err) { next(err); }
}

export async function voterRegistry(req, res, next) {
  try {
    const result = await electionService.getVoterRegistry(req.params.id);
    res.json(result);
  } catch (err) { next(err); }
}

export async function myCandidacy(req, res, next) {
  try {
    const result = await electionService.myCandidacy(req.user.sub);
    res.json(result);
  } catch (err) { next(err); }
}

export async function phaseInfo(req, res, next) {
  try {
    const result = await electionService.getElectionPhaseInfo(req.params.id);
    res.json(result);
  } catch (err) { next(err); }
}