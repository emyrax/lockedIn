import * as newsEventsService from '../services/newsEvents.js';

export async function listPublished(req, res, next) {
  try {
    const result = await newsEventsService.listPublished(req.query);
    res.json(result);
  } catch (err) { next(err); }
}

export async function getBySlug(req, res, next) {
  try {
    const result = await newsEventsService.getBySlug(req.params.slug);
    res.json(result);
  } catch (err) { next(err); }
}

export async function getById(req, res, next) {
  try {
    const result = await newsEventsService.getById(req.params.id);
    res.json(result);
  } catch (err) { next(err); }
}

export async function listCategories(req, res, next) {
  try {
    const result = await newsEventsService.listCategories();
    res.json(result);
  } catch (err) { next(err); }
}

export async function rsvp(req, res, next) {
  try {
    const result = await newsEventsService.rsvpToEvent(req.params.id, req.user.sub, req.body.response);
    res.json(result);
  } catch (err) { next(err); }
}

export async function rsvpCount(req, res, next) {
  try {
    const result = await newsEventsService.getRsvpCount(req.params.id);
    res.json(result);
  } catch (err) { next(err); }
}

export async function adminList(req, res, next) {
  try {
    const result = await newsEventsService.adminList(req.query);
    res.json(result);
  } catch (err) { next(err); }
}

export async function adminCreate(req, res, next) {
  try {
    const result = await newsEventsService.adminCreate(req.body, req.user.sub);
    res.status(201).json(result);
  } catch (err) { next(err); }
}

export async function adminUpdate(req, res, next) {
  try {
    const result = await newsEventsService.adminUpdate(req.params.id, req.body);
    res.json(result);
  } catch (err) { next(err); }
}

export async function adminDelete(req, res, next) {
  try {
    await newsEventsService.adminDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
}

export async function adminTogglePublish(req, res, next) {
  try {
    const result = await newsEventsService.adminTogglePublish(req.params.id);
    res.json(result);
  } catch (err) { next(err); }
}

export async function adminToggleFeature(req, res, next) {
  try {
    const result = await newsEventsService.adminToggleFeature(req.params.id);
    res.json(result);
  } catch (err) { next(err); }
}