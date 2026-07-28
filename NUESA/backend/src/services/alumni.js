import { supabase } from '../config/database.js';

export async function listAlumni(query = {}) {
  let q = supabase
    .from('alumni_directory')
    .select('*, profiles(full_name, email, department, avatar_url)', { count: 'exact' })
    .is('deleted_at', null)
    .eq('is_visible', true);

  if (query.search) {
    q = q.or(`profiles.full_name.ilike.%${query.search}%,current_company.ilike.%${query.search}%,current_position.ilike.%${query.search}%`);
  }
  if (query.industry) q = q.eq('industry', query.industry);
  if (query.year) q = q.eq('graduation_year', parseInt(query.year));
  if (query.department) q = q.eq('profiles.department', query.department);

  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 20;
  const offset = (page - 1) * limit;

  const { data, count, error } = await q
    .order('is_featured', { ascending: false })
    .order('graduation_year', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return { alumni: data, total: count, page, limit };
}

export async function getFeaturedAlumni() {
  const { data, error } = await supabase
    .from('alumni_directory')
    .select('*, profiles(full_name, email, department, avatar_url)')
    .is('deleted_at', null)
    .eq('is_visible', true)
    .eq('is_featured', true)
    .order('graduation_year', { ascending: false })
    .limit(6);
  if (error) throw error;
  return data;
}

export async function getAlumniProfile(userId) {
  const { data, error } = await supabase
    .from('alumni_directory')
    .select('*, profiles(full_name, email, department, level, avatar_url)')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .single();
  if (error) throw new Error('Alumni profile not found');
  return data;
}

export async function getMyProfile(userId) {
  const { data, error } = await supabase
    .from('alumni_directory')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

export async function createOrUpdateProfile(userId, body) {
  const { data: existing } = await supabase
    .from('alumni_directory')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from('alumni_directory')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;

    await supabase.from('profiles').update({ role: 'alumnus' }).eq('id', userId);
    return data;
  }

  const { data, error } = await supabase
    .from('alumni_directory')
    .insert({ ...body, user_id: userId })
    .select()
    .single();
  if (error) throw error;

  await supabase.from('profiles').update({ role: 'alumnus' }).eq('id', userId);
  return data;
}

export async function listJobsPublic(query = {}) {
  let q = supabase
    .from('job_postings')
    .select('*, profiles(full_name)')
    .eq('status', 'approved')
    .gte('expires_at', new Date().toISOString())
    .is('expires_at', null);

  if (query.search) {
    q = q.or(`title.ilike.%${query.search}%,company.ilike.%${query.search}%,location.ilike.%${query.search}%`);
  }

  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 20;
  const offset = (page - 1) * limit;

  const { data, count, error } = await q
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return { jobs: data, total: count, page, limit };
}

export async function getJobPublic(id) {
  const { data, error } = await supabase
    .from('job_postings')
    .select('*, profiles(full_name, email, avatar_url)')
    .eq('id', id)
    .eq('status', 'approved')
    .single();
  if (error) throw new Error('Job not found');
  return data;
}

export async function createJob(userId, body) {
  const { data, error } = await supabase
    .from('job_postings')
    .insert({
      ...body,
      posted_by: userId,
      status: 'pending',
      expires_at: body.expires_at ? new Date(body.expires_at).toISOString() : null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateJob(jobId, userId, body) {
  const { data: existing } = await supabase
    .from('job_postings')
    .select('posted_by')
    .eq('id', jobId)
    .single();
  if (!existing || existing.posted_by !== userId) throw new Error('Not authorized');

  const updates = { ...body };
  if (body.expires_at) updates.expires_at = new Date(body.expires_at).toISOString();
  if (body.expires_at === null) updates.expires_at = null;

  const { data, error } = await supabase
    .from('job_postings')
    .update(updates)
    .eq('id', jobId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteJob(jobId, userId) {
  const { data: existing } = await supabase
    .from('job_postings')
    .select('posted_by')
    .eq('id', jobId)
    .single();
  if (!existing || existing.posted_by !== userId) throw new Error('Not authorized');

  const { error } = await supabase.from('job_postings').delete().eq('id', jobId);
  if (error) throw error;
}

export async function myJobs(userId) {
  const { data, error } = await supabase
    .from('job_postings')
    .select('*')
    .eq('posted_by', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getAlumniJobs(userId) {
  const { data, error } = await supabase
    .from('job_postings')
    .select('*')
    .eq('posted_by', userId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function adminListAlumni(query = {}) {
  let q = supabase
    .from('alumni_directory')
    .select('*, profiles(full_name, email, department, level, avatar_url, role)', { count: 'exact' })
    .is('deleted_at', null);

  if (query.search) {
    q = q.or(`profiles.full_name.ilike.%${query.search}%,current_company.ilike.%${query.search}%`);
  }
  if (query.industry) q = q.eq('industry', query.industry);

  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 50;
  const offset = (page - 1) * limit;

  const { data, count, error } = await q
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return { alumni: data, total: count, page, limit };
}

export async function adminToggleFeature(id) {
  const { data: current } = await supabase
    .from('alumni_directory').select('is_featured').eq('id', id).single();
  if (!current) throw new Error('Not found');

  const { data, error } = await supabase
    .from('alumni_directory')
    .update({ is_featured: !current.is_featured, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function adminToggleVisibility(id) {
  const { data: current } = await supabase
    .from('alumni_directory').select('is_visible').eq('id', id).single();
  if (!current) throw new Error('Not found');

  const { data, error } = await supabase
    .from('alumni_directory')
    .update({ is_visible: !current.is_visible, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function adminListJobs(query = {}) {
  let q = supabase
    .from('job_postings')
    .select('*, profiles(full_name, email)', { count: 'exact' });

  if (query.status) q = q.eq('status', query.status);
  if (query.search) q = q.or(`title.ilike.%${query.search}%,company.ilike.%${query.search}%`);

  const { data, count, error } = await q
    .order('created_at', { ascending: false });
  if (error) throw error;
  return { jobs: data, total: count };
}

export async function adminApproveJob(id) {
  const { data, error } = await supabase
    .from('job_postings')
    .update({ status: 'approved' })
    .eq('id', id)
    .eq('status', 'pending')
    .select()
    .single();
  if (error) throw new Error('Job not found or already processed');
  return data;
}

export async function adminRejectJob(id) {
  const { data, error } = await supabase
    .from('job_postings')
    .update({ status: 'rejected' })
    .eq('id', id)
    .eq('status', 'pending')
    .select()
    .single();
  if (error) throw new Error('Job not found or already processed');
  return data;
}