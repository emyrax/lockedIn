const API_BASE = '/api/v1';

let authToken = null;

export function setAuthToken(token) {
  authToken = token;
  if (token) {
    localStorage.setItem('nuesa_token', token);
  } else {
    localStorage.removeItem('nuesa_token');
  }
}

export function getAuthToken() {
  if (!authToken) {
    authToken = localStorage.getItem('nuesa_token');
  }
  return authToken;
}

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export const api = {
  get: (url, opts) => request(url, { ...opts, method: 'GET' }),
  post: (url, body, opts) => request(url, { ...opts, method: 'POST', body: JSON.stringify(body) }),
  patch: (url, body, opts) => request(url, { ...opts, method: 'PATCH', body: JSON.stringify(body) }),
  delete: (url, opts) => request(url, { ...opts, method: 'DELETE' }),

  // Auth
  register: (data) => api.post('/auth/register', data),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  login: (data) => api.post('/auth/login', data),
  verifyLoginOtp: (data) => api.post('/auth/verify-login-otp', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/me', data),

  // Sections
  getSections: () => api.get('/sections'),
  getSection: (slug) => api.get(`/sections/${slug}`),
  getSectionVersions: (slug) => api.get(`/sections/${slug}/versions`),
  createVersion: (slug, data) => api.post(`/sections/${slug}/versions`, data),
  publishVersion: (slug, versionId) => api.patch(`/sections/${slug}/versions/${versionId}/publish`),
  deleteVersion: (slug, versionId) => api.delete(`/sections/${slug}/versions/${versionId}`),

  // Users
  getUsers: (params) => api.get(`/users?${new URLSearchParams(params)}`),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.patch(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),

  // Elections
  listElections: () => api.get('/elections'),
  getElection: (id) => api.get(`/elections/${id}`),
  createElection: (data) => api.post('/elections', data),
  updateElection: (id, data) => api.patch(`/elections/${id}`, data),
  transitionStatus: (id, status) => api.patch(`/elections/${id}/status`, { status }),
  publishResults: (id, publish) => api.patch(`/elections/${id}/results`, { publish }),
  getPhaseInfo: (id) => api.get(`/elections/${id}/phase`),
  getPositions: (electionId) => api.get(`/elections/${electionId}/positions`),
  createPosition: (electionId, data) => api.post(`/elections/${electionId}/positions`, data),
  updatePosition: (id, data) => api.patch(`/elections/positions/${id}`, data),
  deletePosition: (id) => api.delete(`/elections/positions/${id}`),
  applyCandidate: (electionId, data) => api.post(`/elections/${electionId}/apply`, data),
  enrollCandidate: (data) => api.post('/elections/candidates/enroll', data),
  verifyCandidate: (id) => api.patch(`/elections/candidates/${id}/verify`),
  rejectCandidate: (id, note) => api.patch(`/elections/candidates/${id}/reject`, { note }),
  adminListCandidates: (electionId, status) =>
    api.get(`/elections/${electionId}/candidates${status ? `?status=${status}` : ''}`),
  castVote: (electionId, positionId, candidateId) =>
    api.post(`/elections/${electionId}/vote`, { position_id: positionId, candidate_id: candidateId }),
  myVoteStatus: (electionId) => api.get(`/elections/${electionId}/my-status`),
  verifyVote: (electionId, hash) => api.get(`/elections/${electionId}/verify?hash=${hash}`),
  getResults: (electionId) => api.get(`/elections/${electionId}/results`),
  getVoterRegistry: (electionId) => api.get(`/elections/${electionId}/voters`),
  myCandidacy: () => api.get('/elections/my-candidacy'),

  // Alumni
  listAlumni: (params) => api.get(`/alumni?${new URLSearchParams(params || {})}`),
  getFeaturedAlumni: () => api.get('/alumni/featured'),
  getAlumniProfile: (id) => api.get(`/alumni/${id}`),
  getMyAlumniProfile: () => api.get('/alumni/profile'),
  upsertAlumniProfile: (data) => api.post('/alumni/profile', data),

  // Jobs
  listJobs: (params) => api.get(`/jobs?${new URLSearchParams(params || {})}`),
  getJob: (id) => api.get(`/jobs/${id}`),
  createJob: (data) => api.post('/jobs', data),
  updateJob: (id, data) => api.patch(`/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  myJobs: () => api.get('/jobs/my'),
  getAlumniJobs: (userId) => api.get(`/alumni/${userId}/jobs`),

  // Admin Alumni
  adminListAlumni: (params) => api.get(`/alumni/admin/all?${new URLSearchParams(params || {})}`),
  adminToggleFeature: (id) => api.patch(`/alumni/admin/${id}/feature`),
  adminToggleVisibility: (id) => api.patch(`/alumni/admin/${id}/visibility`),
  adminListJobs: (params) => api.get(`/jobs/admin/all?${new URLSearchParams(params || {})}`),
  adminApproveJob: (id) => api.patch(`/jobs/admin/${id}/approve`),
  adminRejectJob: (id) => api.patch(`/jobs/admin/${id}/reject`),

  // News & Events
  listNewsEvents: (params) => api.get(`/news-events?${new URLSearchParams(params || {})}`),
  getNewsEvent: (slug) => api.get(`/news-events/${slug}`),
  getCategories: () => api.get('/news-events/categories'),
  rsvpEvent: (id, response) => api.post(`/news-events/${id}/rsvp`, { response }),
  getRsvpCount: (id) => api.get(`/news-events/${id}/rsvp-count`),

  // Admin News & Events
  adminListNewsEvents: (params) => api.get(`/news-events/admin/all?${new URLSearchParams(params || {})}`),
  adminCreateNewsEvent: (data) => api.post('/news-events/admin', data),
  adminUpdateNewsEvent: (id, data) => api.patch(`/news-events/admin/${id}`, data),
  adminDeleteNewsEvent: (id) => api.delete(`/news-events/admin/${id}`),
  adminTogglePublish: (id) => api.patch(`/news-events/admin/${id}/publish`),
  adminToggleFeature: (id) => api.patch(`/news-events/admin/${id}/feature`),
};
