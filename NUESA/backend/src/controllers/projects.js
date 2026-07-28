import * as projectService from '../services/projects.js';

export async function list(req, res, next) {
  try {
    const result = await projectService.listProjects(req.query);
    res.json(result);
  } catch (err) { next(err); }
}

export async function featured(req, res, next) {
  try {
    const data = await projectService.getFeatured();
    res.json(data);
  } catch (err) { next(err); }
}

export async function my(req, res, next) {
  try {
    const data = await projectService.getMyProjects(req.user.sub);
    res.json(data);
  } catch (err) { next(err); }
}

export async function get(req, res, next) {
  try {
    const data = await projectService.getProject(req.params.id, req.user?.sub || null);
    res.json(data);
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    const project = await projectService.createProject(req.body, req.user.sub);
    res.status(201).json(project);
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    const project = await projectService.updateProject(req.params.id, req.body, req.user.sub);
    res.json(project);
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    const result = await projectService.deleteProject(req.params.id, req.user.sub);
    res.json(result);
  } catch (err) { next(err); }
}

export async function upvote(req, res, next) {
  try {
    const result = await projectService.toggleUpvote(req.params.id, req.user.sub);
    res.json(result);
  } catch (err) { next(err); }
}

export async function collabRequest(req, res, next) {
  try {
    const result = await projectService.requestCollab(req.params.id, req.user.sub, req.body.message);
    res.status(201).json(result);
  } catch (err) { next(err); }
}

export async function collabRespond(req, res, next) {
  try {
    const result = await projectService.respondCollab(req.params.collabId, req.body.status, req.user.sub);
    res.json(result);
  } catch (err) { next(err); }
}

export async function approve(req, res, next) {
  try {
    const project = await projectService.approveProject(req.params.id, req.user.sub);
    res.json(project);
  } catch (err) { next(err); }
}

export async function feature(req, res, next) {
  try {
    const project = await projectService.toggleFeatured(req.params.id, req.user.sub);
    res.json(project);
  } catch (err) { next(err); }
}

export async function adminList(req, res, next) {
  try {
    const result = await projectService.adminListAll(req.query);
    res.json(result);
  } catch (err) { next(err); }
}