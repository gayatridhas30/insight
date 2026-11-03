import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('insightloop_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const activeOrgId = localStorage.getItem('insightloop_active_org_id');
  if (activeOrgId) {
    config.headers['x-organization-id'] = activeOrgId;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't auto-redirect on public feedback endpoints
      if (!window.location.pathname.startsWith('/feedback/')) {
        // localStorage.removeItem('insightloop_token');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
