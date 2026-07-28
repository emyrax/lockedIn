import { supabase } from '../config/database.js';

export async function listProjects({ category, department, status, page = 1, limit = 12, search }) {
  let query = supabase
    .from('projects')
    .select('*, profiles!projects_submitted_by_fkey(full_name, avatar_url)', { count: 'exact' })
    .is('deleted_at', null);

  if (category) query = query.eq('category', category);
  if (department) query = query.eq('department', department.toUpperCase());
  if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);

  if (status) {
    query = query.eq('status', status);
  } else {
    query = query.in('status', ['approved', 'featured']);
  }

  query = query
    .order('featured_at', { ascending: false, nullsLast: true })
    .order('upvote_count', { ascending: false })
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  const { data, count, error } = await query;
  if (error) throw error;

  return { projects: data, total: count, page: Number(page), limit: Number(limit) };
}

export async function getFeatured() {
  const { data, error } = await supabase
    .from('projects')
    .select('*, profiles!projects_submitted_by_fkey(full_name, avatar_url)')
    .eq('status', 'featured')
    .is('deleted_at', null)
    .order('featured_at', { ascending: false })
    .limit(6);

  if (error) throw error;
  return data;
}

export async function getMyProjects(userId) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('submitted_by', userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getProject(id, currentUserId = null) {
  const { data, error } = await supabase
    .from('projects')
    .select('*, profiles!projects_submitted_by_fkey(full_name, avatar_url, department, linkedin_url, twitter_url)')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error) throw error;

  let userUpvoted = false;
  let userCollab = null;

  if (currentUserId) {
    const { data: upvote } = await supabase
      .from('project_upvotes')
      .select('id')
      .eq('project_id', id)
      .eq('user_id', currentUserId)
      .maybeSingle();
    userUpvoted = !!upvote;

    const { data: collab } = await supabase
      .from('project_collabs')
      .select('*')
      .eq('project_id', id)
      .eq('user_id', currentUserId)
      .maybeSingle();
    userCollab = collab;
  }

  return { ...data, userUpvoted, userCollab };
}

export async function createProject(data, userId) {
  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      title: data.title,
      tagline: data.tagline || null,
      description: data.description,
      category: data.category || null,
      department: data.department || null,
      team_members: data.team_members || [],
      mentor_name: data.mentor_name || null,
      cover_image: data.cover_image || null,
      gallery: data.gallery || [],
      video_url: data.video_url || null,
      github_url: data.github_url || null,
      demo_url: data.demo_url || null,
      tech_stack: data.tech_stack || [],
      sdg_tags: data.sdg_tags || [],
      submitted_by: userId,
      status: 'submitted',
    })
    .select()
    .single();

  if (error) throw error;

  await supabase.from('audit_log').insert({
    user_id: userId,
    action: 'project.submit',
    entity_type: 'project',
    entity_id: project.id,
    new_values: { title: data.title, category: data.category },
  });

  return project;
}

export async function updateProject(id, data, userId) {
  const { data: existing } = await supabase.from('projects').select('submitted_by, status').eq('id', id).single();

  if (!existing) throw new Error('Project not found');
  if (existing.submitted_by !== userId) throw new Error('Not authorized');

  if (existing.status === 'featured' || existing.status === 'archived') {
    throw new Error('Cannot edit a featured or archived project');
  }

  const allowed = ['title', 'tagline', 'description', 'category', 'department',
    'team_members', 'mentor_name', 'cover_image', 'gallery', 'video_url',
    'github_url', 'demo_url', 'tech_stack', 'sdg_tags'];

  const updates = {};
  for (const key of allowed) {
    if (data[key] !== undefined) updates[key] = data[key];
  }
  updates.updated_at = new Date().toISOString();

  const { data: project, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return project;
}

export async function deleteProject(id, userId) {
  const { data: existing } = await supabase.from('projects').select('submitted_by, status').eq('id', id).single();
  if (!existing) throw new Error('Project not found');
  if (existing.submitted_by !== userId) throw new Error('Not authorized');

  const { error } = await supabase.from('projects').update({ deleted_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;

  return { message: 'Project deleted' };
}

export async function toggleUpvote(projectId, userId) {
  const { data: existing } = await supabase
    .from('project_upvotes')
    .select('id')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    await supabase.from('project_upvotes').delete().eq('id', existing.id);
    await supabase.rpc('decrement_project_upvotes', { project_id: projectId });
    return { upvoted: false };
  } else {
    await supabase.from('project_upvotes').insert({ project_id: projectId, user_id: userId });
    await supabase.rpc('increment_project_upvotes', { project_id: projectId });
    return { upvoted: true };
  }
}

export async function requestCollab(projectId, userId, message) {
  const { data: existing } = await supabase
    .from('project_collabs')
    .select('id')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) throw new Error('Already requested to join this project');

  const { data, error } = await supabase
    .from('project_collabs')
    .insert({ project_id: projectId, user_id: userId, message: message || null })
    .select()
    .single();

  if (error) throw error;

  const { data: project } = await supabase.from('projects').select('submitted_by').eq('id', projectId).single();
  await supabase.from('notifications').insert({
    user_id: project.submitted_by,
    type: 'collab_request',
    title: 'New collaboration request',
    body: 'Someone wants to join your project team',
    link: `/projects/${projectId}`,
  });

  return data;
}

export async function respondCollab(collabId, status, ownerId) {
  const { data: collab } = await supabase
    .from('project_collabs')
    .select('*, projects!inner(submitted_by)')
    .eq('id', collabId)
    .single();

  if (!collab) throw new Error('Collaboration request not found');
  if (collab.projects.submitted_by !== ownerId) throw new Error('Not authorized');

  const { error } = await supabase
    .from('project_collabs')
    .update({ status })
    .eq('id', collabId);

  if (error) throw error;

  if (status === 'accepted') {
    const { data: project } = await supabase.from('projects').select('team_members').eq('id', collab.project_id).single();
    const { data: user } = await supabase.from('profiles').select('full_name').eq('id', collab.user_id).single();
    const updatedTeam = [...(project.team_members || []), { name: user.full_name, role: 'Collaborator' }];
    await supabase.from('projects').update({ team_members: updatedTeam }).eq('id', collab.project_id);

    await supabase.from('notifications').insert({
      user_id: collab.user_id,
      type: 'collab_accepted',
      title: 'Collaboration request accepted',
      body: 'You have been added to the project team!',
      link: `/projects/${collab.project_id}`,
    });
  }

  return { message: `Collaboration ${status}` };
}

export async function approveProject(id, adminId) {
  const { data, error } = await supabase
    .from('projects')
    .update({ status: 'approved', approved_by: adminId, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  await supabase.from('notifications').insert({
    user_id: data.submitted_by,
    type: 'project_approved',
    title: 'Project approved!',
    body: 'Your project has been approved and is now visible.',
    link: `/projects/${id}`,
  });

  return data;
}

export async function toggleFeatured(id, adminId) {
  const { data: existing } = await supabase.from('projects').select('status').eq('id', id).single();
  if (!existing) throw new Error('Project not found');

  const newStatus = existing.status === 'featured' ? 'approved' : 'featured';
  const updates = {
    status: newStatus,
    featured_at: newStatus === 'featured' ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from('projects').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function adminListAll({ status, category, department, page = 1, limit = 20 }) {
  let query = supabase
    .from('projects')
    .select('*, profiles!projects_submitted_by_fkey(full_name, avatar_url)', { count: 'exact' })
    .is('deleted_at', null);

  if (status) query = query.eq('status', status);
  if (category) query = query.eq('category', category);
  if (department) query = query.eq('department', department);

  query = query
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  const { data, count, error } = await query;
  if (error) throw error;
  return { projects: data, total: count, page: Number(page), limit: Number(limit) };
}