import { supabase } from '../config/database.js';
import crypto from 'crypto';

function hashVote(userId, electionId, positionId) {
  return crypto
    .createHash('sha256')
    .update(`${userId}:${electionId}:${positionId}:${process.env.VOTE_ENCRYPTION_KEY}`)
    .digest('hex');
}

export async function listElections(includeAll = false) {
  let query = supabase.from('elections').select('*', { count: 'exact' });
  if (!includeAll) {
    query = query.in('status', ['nomination', 'voting', 'completed']);
  }
  query = query.order('created_at', { ascending: false });
  const { data, count, error } = await query;
  if (error) throw error;
  return { elections: data, total: count };
}

export async function getElection(id) {
  const { data: election, error } = await supabase
    .from('elections').select('*').eq('id', id).single();
  if (error) throw error;

  const { data: positions } = await supabase
    .from('positions').select('*').eq('election_id', id).order('sort_order');
  const posIds = positions?.map(p => p.id) || [];

  const { data: candidates } = posIds.length
    ? await supabase
        .from('candidates').select('*, profiles(full_name, avatar_url, department, level)')
        .in('position_id', posIds)
        .in('status', ['verified', 'approved'])
        .order('created_at')
    : { data: [] };

  const candidatesByPos = {};
  for (const c of candidates || []) {
    if (!candidatesByPos[c.position_id]) candidatesByPos[c.position_id] = [];
    candidatesByPos[c.position_id].push(c);
  }

  return {
    ...election,
    positions: (positions || []).map(p => ({
      ...p,
      candidates: candidatesByPos[p.id] || [],
    })),
  };
}

export async function createElection(data, userId) {
  const { data: election, error } = await supabase
    .from('elections').insert({ ...data, created_by: userId }).select().single();
  if (error) throw error;
  return election;
}

export async function updateElection(id, data) {
  const { data: election, error } = await supabase
    .from('elections').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) throw error;
  return election;
}

export async function transitionStatus(id, newStatus) {
  const { data: election, error } = await supabase
    .from('elections').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return election;
}

export async function publishResults(id, publish) {
  const updates = {
    results_published: publish,
    results_published_at: publish ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from('elections').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function listPositions(electionId) {
  const { data, error } = await supabase
    .from('positions').select('*').eq('election_id', electionId).order('sort_order');
  if (error) throw error;
  return data;
}

export async function createPosition(data) {
  const { data: position, error } = await supabase
    .from('positions').insert(data).select().single();
  if (error) throw error;
  return position;
}

export async function updatePosition(id, data) {
  const { data: position, error } = await supabase
    .from('positions').update(data).eq('id', id).select().single();
  if (error) throw error;
  return position;
}

export async function deletePosition(id) {
  const { error } = await supabase.from('positions').delete().eq('id', id);
  if (error) throw error;
}

export async function applyAsCandidate(electionId, userId, body) {
  const { data: election } = await supabase
    .from('elections').select('status').eq('id', electionId).single();
  if (!election || election.status !== 'nomination') {
    throw new Error('Election is not accepting nominations');
  }

  const { data: existing } = await supabase
    .from('candidates').select('id').eq('position_id', body.position_id).eq('user_id', userId).maybeSingle();
  if (existing) throw new Error('You already applied for this position');

  const { data, error } = await supabase
    .from('candidates').insert({
      position_id: body.position_id,
      user_id: userId,
      manifesto: body.manifesto || null,
      photo_url: body.photo_url || null,
      video_url: body.video_url || null,
      status: 'pending',
    }).select('*, positions(title)').single();
  if (error) throw error;
  return data;
}

export async function enrollCandidate(input, adminId) {
  const { data: existing } = await supabase
    .from('candidates').select('id').eq('position_id', input.position_id).eq('user_id', input.user_id).maybeSingle();
  if (existing) throw new Error('Candidate already enrolled for this position');

  const { data, error } = await supabase
    .from('candidates').insert({
      position_id: input.position_id,
      user_id: input.user_id,
      manifesto: input.manifesto || null,
      photo_url: input.photo_url || null,
      status: 'verified',
      verified_by: adminId,
      verified_at: new Date().toISOString(),
    }).select('*, positions(title), profiles(full_name)').single();
  if (error) throw error;
  return data;
}

export async function verifyCandidate(id, adminId) {
  const { data, error } = await supabase
    .from('candidates').update({
      status: 'verified',
      verified_by: adminId,
      verified_at: new Date().toISOString(),
    }).eq('id', id).eq('status', 'pending').select().single();
  if (error) throw new Error('Candidate not found or already processed');
  return data;
}

export async function rejectCandidate(id, adminId, note) {
  const { data, error } = await supabase
    .from('candidates').update({
      status: 'rejected',
      approved_by: adminId,
      approved_at: new Date().toISOString(),
      approval_note: note || null,
    }).eq('id', id).eq('status', 'pending').select().single();
  if (error) throw new Error('Candidate not found or already processed');
  return data;
}

export async function adminListCandidates(electionId, statusFilter) {
  let query = supabase
    .from('candidates')
    .select('*, positions(title, sort_order), profiles(full_name, email, department, level, avatar_url)')
    .in('position_id', supabase.from('positions').select('id').eq('election_id', electionId));

  if (statusFilter) {
    query = query.eq('status', statusFilter);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function castVote(electionId, positionId, candidateId, userId) {
  const { data: election } = await supabase
    .from('elections').select('status').eq('id', electionId).single();
  if (!election || election.status !== 'voting') {
    throw new Error('Election is not accepting votes');
  }

  const { data: registry } = await supabase
    .from('voter_registry').select('id, has_voted').eq('election_id', electionId).eq('user_id', userId).maybeSingle();
  if (registry?.has_voted) {
    const existingVote = await supabase
      .from('votes').select('id').eq('election_id', electionId).eq('position_id', positionId);
    if ((existingVote.data || []).length > 0) {
      throw new Error('You already voted for this position');
    }
  }

  const voteHash = hashVote(userId, electionId, positionId);
  const { data: dupVote } = await supabase
    .from('votes').select('id').eq('vote_hash', voteHash).maybeSingle();
  if (dupVote) throw new Error('You already voted for this position');

  const { data: vote, error } = await supabase
    .from('votes').insert({
      election_id: electionId,
      position_id: positionId,
      candidate_id: candidateId,
      vote_hash: voteHash,
    }).select().single();
  if (error) throw error;

  if (!registry) {
    await supabase.from('voter_registry').insert({
      election_id: electionId,
      user_id: userId,
      has_voted: true,
      vote_token_hash: voteHash,
      voted_at: new Date().toISOString(),
    });
  } else if (!registry.has_voted) {
    await supabase.from('voter_registry').update({
      has_voted: true,
      vote_token_hash: voteHash,
      voted_at: new Date().toISOString(),
    }).eq('id', registry.id);
  }

  return { vote_hash: voteHash, message: 'Vote cast successfully' };
}

export async function myVoteStatus(electionId, userId) {
  const { data: registry } = await supabase
    .from('voter_registry').select('has_voted, voted_at').eq('election_id', electionId).eq('user_id', userId).maybeSingle();
  if (!registry) return { has_voted: false };

  const { data: positions } = await supabase
    .from('positions').select('id, title').eq('election_id', electionId);
  const positionVotes = [];
  for (const pos of positions || []) {
    const vh = hashVote(userId, electionId, pos.id);
    const { data: vote } = await supabase
      .from('votes').select('candidate_id, created_at').eq('vote_hash', vh).maybeSingle();
    if (vote) {
      const { data: cand } = await supabase
        .from('candidates').select('id, profiles(full_name)').eq('id', vote.candidate_id)
        .select('*, profiles(full_name)').single().catch(() => ({ data: null }));
      positionVotes.push({ position_title: pos.title, candidate: cand, voted_at: vote.created_at, receipt: vh });
    }
  }

  return { has_voted: registry.has_voted, voted_at: registry.voted_at, votes: positionVotes };
}

export async function verifyVoteByHash(electionId, voteHash) {
  const { data: vote, error } = await supabase
    .from('votes').select('*, candidates(id, profiles(full_name)), positions(title)')
    .eq('vote_hash', voteHash).eq('election_id', electionId).maybeSingle();
  if (error) throw error;
  if (!vote) return { verified: false, message: 'Vote not found' };
  return {
    verified: true,
    position: vote.positions?.title,
    candidate: vote.candidates?.profiles?.full_name,
    timestamp: vote.created_at,
  };
}

export async function getResults(electionId) {
  const { data: election } = await supabase
    .from('elections').select('results_published, status').eq('id', electionId).single();
  if (!election) throw new Error('Election not found');

  const { data: positions } = await supabase
    .from('positions').select('id, title').eq('election_id', electionId).order('sort_order');

  const results = [];
  for (const pos of positions || []) {
    const { data: tally } = await supabase
      .from('votes')
      .select('candidate_id')
      .eq('election_id', electionId)
      .eq('position_id', pos.id);

    const counts = {};
    for (const v of tally || []) {
      counts[v.candidate_id] = (counts[v.candidate_id] || 0) + 1;
    }

    const { data: candidates } = await supabase
      .from('candidates')
      .select('id, profiles(full_name, avatar_url, department), manifesto')
      .in('id', Object.keys(counts))
      .in('status', ['verified', 'approved']);

    const candMap = {};
    for (const c of candidates || []) candMap[c.id] = c;

    const sorted = Object.entries(counts)
      .map(([candidateId, count]) => ({
        candidate: candMap[candidateId] || { id: candidateId },
        votes: count,
      }))
      .sort((a, b) => b.votes - a.votes);

    results.push({ position: pos.title, candidates: sorted, total_votes: tally?.length || 0 });
  }

  return { election, results };
}

export async function getVoterRegistry(electionId) {
  const { data: eligible } = await supabase
    .from('profiles')
    .select('id', { count: 'exact' })
    .in('role', ['student', 'alumnus']);

  const { data: registered, error } = await supabase
    .from('voter_registry')
    .select('*, profiles(full_name, email, department, level)')
    .eq('election_id', electionId)
    .order('voted_at', { ascending: false, nullsFirst: false });
  if (error) throw error;

  const voted = (registered || []).filter(r => r.has_voted);
  const totalEligible = eligible?.length || 0;

  return {
    total_eligible: totalEligible,
    total_voted: voted.length,
    turnout_pct: totalEligible ? Math.round((voted.length / totalEligible) * 100) : 0,
    voters: registered || [],
  };
}

export async function myCandidacy(userId) {
  const { data, error } = await supabase
    .from('candidates')
    .select('*, positions(title, election_id), elections(title as election_title)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getElectionPhaseInfo(electionId) {
  const { data: election } = await supabase
    .from('elections').select('*').eq('id', electionId).single();
  if (!election) throw new Error('Election not found');

  const now = new Date();
  const phases = [
    { key: 'draft', label: 'Draft', active: election.status === 'draft', passed: false },
    { key: 'pending', label: 'Pending', active: election.status === 'pending', passed: election.status !== 'draft' && election.status !== 'pending' ? true : ['nomination', 'voting', 'completed', 'cancelled'].includes(election.status) },
    { key: 'nomination', label: 'Nomination', active: election.status === 'nomination', passed: ['voting', 'completed'].includes(election.status) },
    { key: 'voting', label: 'Voting', active: election.status === 'voting', passed: election.status === 'completed' },
    { key: 'completed', label: 'Completed', active: election.status === 'completed', passed: false },
  ];

  return { election, phases };
}