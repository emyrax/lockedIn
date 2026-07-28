import { supabase } from '../config/database.js';

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 290);
}

export async function listPublished(query = {}) {
  let q = supabase
    .from('news_events')
    .select('*', { count: 'exact' })
    .eq('is_published', true)
    .is('deleted_at', null);

  if (query.type) q = q.eq('type', query.type);
  if (query.category) q = q.eq('category', query.category);
  if (query.search) q = q.or(`title.ilike.%${query.search}%,excerpt.ilike.%${query.search}%`);
  if (query.featured) q = q.eq('is_featured', true);

  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 20;
  const offset = (page - 1) * limit;

  q = q.order('is_featured', { ascending: false }).order('published_at', { ascending: false });

  const { data, count, error } = await q.range(offset, offset + limit - 1);
  if (error) throw error;
  return { items: data, total: count, page, limit };
}

export async function getBySlug(slug) {
  const { data, error } = await supabase
    .from('news_events')
    .select('*, profiles(full_name)')
    .eq('slug', slug)
    .eq('is_published', true)
    .is('deleted_at', null)
    .single();
  if (error) throw new Error('Not found');
  return data;
}

export async function getById(id) {
  const { data, error } = await supabase
    .from('news_events')
    .select('*, profiles(full_name)')
    .eq('id', id)
    .is('deleted_at', null)
    .single();
  if (error) throw new Error('Not found');
  return data;
}

export async function listCategories() {
  const { data, error } = await supabase
    .from('news_events')
    .select('category')
    .is('deleted_at', null)
    .not('category', 'is', null);
  if (error) throw error;

  const cats = [...new Set(data.map(r => r.category).filter(Boolean))].sort();
  return { categories: cats };
}

export async function rsvpToEvent(eventId, userId, response) {
  const { data: existing } = await supabase
    .from('rsvps').select('id').eq('event_id', eventId).eq('user_id', userId).maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from('rsvps').update({ response }).eq('id', existing.id).select().single();
    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from('rsvps').insert({ event_id: eventId, user_id: userId, response }).select().single();
  if (error) throw error;
  return data;
}

export async function getRsvpCount(eventId) {
  const { data, error } = await supabase
    .from('rsvps').select('response', { count: 'exact' }).eq('event_id', eventId);
  if (error) throw error;
  const counts = { yes: 0, maybe: 0, no: 0 };
  for (const r of data || []) { if (counts[r.response] !== undefined) counts[r.response]++; }
  return counts;
}

export async function adminList(query = {}) {
  let q = supabase
    .from('news_events')
    .select('*, profiles(full_name)', { count: 'exact' })
    .is('deleted_at', null);

  if (query.type) q = q.eq('type', query.type);
  if (query.category) q = q.eq('category', query.category);

  const { data, count, error } = await q.order('created_at', { ascending: false });
  if (error) throw error;
  return { items: data, total: count };
}

export async function adminCreate(body, userId) {
  const slug = body.slug || slugify(body.title);

  const { data, error } = await supabase
    .from('news_events')
    .insert({
      type: body.type,
      title: body.title,
      slug,
      content: body.content || null,
      excerpt: body.excerpt || null,
      cover_image: body.cover_image || null,
      category: body.category || null,
      event_date: body.event_date || null,
      event_end_date: body.event_end_date || null,
      location: body.location || null,
      rsvp_enabled: body.rsvp_enabled || false,
      max_attendees: body.max_attendees || null,
      is_published: body.is_published || false,
      is_featured: body.is_featured || false,
      published_at: body.is_published ? new Date().toISOString() : null,
      created_by: userId,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function adminUpdate(id, body) {
  const updates = { ...body, updated_at: new Date().toISOString() };
  if (body.slug) updates.slug = body.slug;
  if (body.is_published && !body.published_at) updates.published_at = new Date().toISOString();
  if (body.is_published === false) updates.published_at = null;

  delete updates.id;
  delete updates.created_at;
  delete updates.created_by;

  const { data, error } = await supabase
    .from('news_events')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function adminDelete(id) {
  const { error } = await supabase
    .from('news_events')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function adminTogglePublish(id) {
  const { data: current } = await supabase
    .from('news_events').select('is_published, published_at').eq('id', id).single();
  if (!current) throw new Error('Not found');

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('news_events')
    .update({
      is_published: !current.is_published,
      published_at: current.is_published ? null : now,
      updated_at: now,
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function adminToggleFeature(id) {
  const { data: current } = await supabase
    .from('news_events').select('is_featured').eq('id', id).single();
  if (!current) throw new Error('Not found');

  const { data, error } = await supabase
    .from('news_events')
    .update({
      is_featured: !current.is_featured,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}