import api from './client';

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const organizationService = {
  getMyOrganizations: () => api.get('/organizations/my'),
  createOrganization: (data) => api.post('/organizations', data),
  getOrganization: (id) => api.get(`/organizations/${id}`),
  inviteMember: (orgId, data) => api.post(`/organizations/${orgId}/invite`, data),
  updateMemberRole: (orgId, memberId, data) => api.put(`/organizations/${orgId}/members/${memberId}`, data),
  removeMember: (orgId, memberId) => api.delete(`/organizations/${orgId}/members/${memberId}`),
};

export const eventService = {
  getEvents: (params) => api.get('/events', { params }),
  createEvent: (data) => api.post('/events', data),
  getEventById: (id) => api.get(`/events/${id}`),
  getEventByCode: (code) => api.get(`/events/code/${code}`),
  updateEvent: (id, data) => api.put(`/events/${id}`, data),
  deleteEvent: (id) => api.delete(`/events/${id}`),
  compareEvents: (eventIds) => api.post('/events/compare', { eventIds }),
  createSession: (eventId, data) => api.post(`/events/${eventId}/sessions`, data),
};

export const formService = {
  getFormByEventId: (eventId) => api.get(`/forms/event/${eventId}`),
  getPublicForm: (eventId) => api.get(`/forms/event/${eventId}/public`),
  updateSettings: (eventId, data) => api.put(`/forms/event/${eventId}/settings`, data),
  saveQuestions: (eventId, questions) => api.put(`/forms/event/${eventId}/questions`, { questions }),
  generateAIQuestions: (eventId) => api.post(`/forms/event/${eventId}/ai-generate`),
};

export const feedbackService = {
  submitFeedback: (data) => api.post('/feedback/submit', data),
  getResponsesByEvent: (eventId, params) => api.get(`/feedback/event/${eventId}`, { params }),
  getResponseById: (id) => api.get(`/feedback/${id}`),
};

export const aiIntelligenceService = {
  runAnalysis: (eventId) => api.post(`/ai/events/${eventId}/analyze`),
  getAnalysis: (eventId) => api.get(`/ai/events/${eventId}/analysis`),
  queryRAG: (data) => api.post('/ai/rag/query', data),
};

export const improvementTaskService = {
  getTasks: (params) => api.get('/tasks', { params }),
  createTask: (data) => api.post('/tasks', data),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
};

export const bhashiniService = {
  getStatus: () => api.get('/bhashini/status'),
  translateText: (data) => api.post('/bhashini/translate', data),
  transcribeAudio: (data) => api.post('/bhashini/transcribe', data),
};

export const reportService = {
  downloadExcel: (eventId) =>
    api.get(`/reports/events/${eventId}/excel`, { responseType: 'blob' }),
  downloadPDF: (eventId) =>
    api.get(`/reports/events/${eventId}/pdf`, { responseType: 'blob' }),
};

export const adminService = {
  getPlatformStats: () => api.get('/admin/stats'),
  getAllUsers: (params) => api.get('/admin/users', { params }),
  toggleUserStatus: (id) => api.put(`/admin/users/${id}/toggle-status`),
  getAllOrganizations: (params) => api.get('/admin/organizations', { params }),
  getAllEvents: (params) => api.get('/admin/events', { params }),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
};
