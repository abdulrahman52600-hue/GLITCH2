const API_BASE = '/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('bridge_access_token');
  const headers = { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  let data = {};
  try { data = await res.json(); } catch { data = {}; }
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  getDemoUsers: () => request('/auth/demo-users'),
  getAuthProviders: () => request('/auth/providers'),
  exchangeOAuthCode: (code) => request('/auth/oauth/exchange', { method: 'POST', body: JSON.stringify({ code }) }),
  sendPhoneCode: (phone) => request('/auth/phone/start', { method: 'POST', body: JSON.stringify({ phone }) }),
  verifyPhoneCode: (phone, code, role, name) => request('/auth/phone/verify', { method: 'POST', body: JSON.stringify({ phone, code, role, name }) }),
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getUser: (id) => request(`/auth/user/${id}`),
  updateProfile: (id, data) => request(`/auth/profile/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${encodeURIComponent(id)}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'PATCH' }),

  getProjects: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') query.append(key, val);
    });
    return request(`/projects?${query.toString()}`);
  },
  getProjectById: (id) => request(`/projects/${id}`),
  createProject: (projectData) => request('/projects', { method: 'POST', body: JSON.stringify(projectData) }),
  updateProject: (id, data) => request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),

  getApplications: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') query.append(key, val);
    });
    return request(`/applications?${query.toString()}`);
  },
  createApplication: (data) => request('/applications', { method: 'POST', body: JSON.stringify(data) }),
  updateApplicationStatus: (id, status, feedback = '') => request(`/applications/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, feedback }) }),
  completeApplication: (id, outcome) => request(`/applications/${id}/complete`, { method: 'POST', body: JSON.stringify(outcome) }),

  getMentors: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') query.append(key, val);
    });
    return request(`/mentors?${query.toString()}`);
  },
  requestMentorship: (data) => request('/mentors/request', { method: 'POST', body: JSON.stringify(data) }),
  getMentorshipRequests: (studentId) => request(`/mentors/requests/${studentId}`),

  getAdminStats: () => request('/admin/stats'),
  getAdminUsers: (role) => request(`/admin/users${role ? `?role=${encodeURIComponent(role)}` : ''}`),
  setProjectStatus: (id, status) => request(`/admin/projects/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  getAssessmentCatalog: () => request('/assessments/catalog'),
  startAssessment: (skill, level = 'Intermediate', cameraConsent = false) => request('/assessments/start', { method: 'POST', body: JSON.stringify({ skill, level, cameraConsent }) }),
  getSecurityControls: () => request('/assessments/security-controls'),
  assessmentFocusEvent: (attemptId, action, eventId, keepalive = false) => request(`/assessments/${attemptId}/focus-event`, { method: 'POST', body: JSON.stringify({ action, eventId }), keepalive }),
  submitAssessment: (attemptId, answers) => request(`/assessments/${attemptId}/submit`, { method: 'POST', body: JSON.stringify({ answers }) })
};
