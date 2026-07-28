import * as alumniService from '../services/alumni.js';

export async function list(req, res, next) {
  try {
    const result = await alumniService.listAlumni(req.query);
    res.json(result);
  } catch (err) { next(err); }
}

export async function featured(req, res, next) {
  try {
    const result = await alumniService.getFeaturedAlumni();
    res.json(result);
  } catch (err) { next(err); }
}

export async function get(req, res, next) {
  try {
    const result = await alumniService.getAlumniProfile(req.params.id);
    res.json(result);
  } catch (err) { next(err); }
}

export async function getMyProfile(req, res, next) {
  try {
    const result = await alumniService.getMyProfile(req.user.sub);
    res.json(result || {});
  } catch (err) { next(err); }
}

export async function upsertProfile(req, res, next) {
  try {
    const result = await alumniService.createOrUpdateProfile(req.user.sub, req.body);
    res.json(result);
  } catch (err) { next(err); }
}

export async function listJobsPublic(req, res, next) {
  try {
    const result = await alumniService.listJobsPublic(req.query);
    res.json(result);
  } catch (err) { next(err); }
}

export async function getJobPublic(req, res, next) {
  try {
    const result = await alumniService.getJobPublic(req.params.id);
    res.json(result);
  } catch (err) { next(err); }
}

export async function createJob(req, res, next) {
  try {
    const result = await alumniService.createJob(req.user.sub, req.body);
    res.status(201).json(result);
  } catch (err) { next(err); }
}

export async function updateJob(req, res, next) {
  try {
    const result = await alumniService.updateJob(req.params.id, req.user.sub, req.body);
    res.json(result);
  } catch (err) { next(err); }
}

export async function deleteJob(req, res, next) {
  try {
    await alumniService.deleteJob(req.params.id, req.user.sub);
    res.json({ message: 'Job deleted' });
  } catch (err) { next(err); }
}

export async function myJobs(req, res, next) {
  try {
    const result = await alumniService.myJobs(req.user.sub);
    res.json(result);
  } catch (err) { next(err); }
}

export async function getAlumniJobs(req, res, next) {
  try {
    const result = await alumniService.getAlumniJobs(req.params.userId);
    res.json(result);
  } catch (err) { next(err); }
}

export async function adminListAlumni(req, res, next) {
  try {
    const result = await alumniService.adminListAlumni(req.query);
    res.json(result);
  } catch (err) { next(err); }
}

export async function adminToggleFeature(req, res, next) {
  try {
    const result = await alumniService.adminToggleFeature(req.params.id);
    res.json(result);
  } catch (err) { next(err); }
}

export async function adminToggleVisibility(req, res, next) {
  try {
    const result = await alumniService.adminToggleVisibility(req.params.id);
    res.json(result);
  } catch (err) { next(err); }
}

export async function adminListJobs(req, res, next) {
  try {
    const result = await alumniService.adminListJobs(req.query);
    res.json(result);
  } catch (err) { next(err); }
}

export async function adminApproveJob(req, res, next) {
  try {
    const result = await alumniService.adminApproveJob(req.params.id);
    res.json(result);
  } catch (err) { next(err); }
}

export async function adminRejectJob(req, res, next) {
  try {
    const result = await alumniService.adminRejectJob(req.params.id);
    res.json(result);
  } catch (err) { next(err); }
}