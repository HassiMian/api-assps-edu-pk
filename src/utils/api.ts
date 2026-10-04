import axios from 'axios';

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';
let refreshPromise: Promise<boolean> | null = null;

function clearLegacySession() {
  if (typeof window === 'undefined') return;
  for (const key of ['token','refreshToken','al_siddique_token','al_siddique_refresh_token']) {
    localStorage.removeItem(key);
  }
}

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest || originalRequest._retry) return Promise.reject(error);

    const requestUrl = String(originalRequest.url || '');
    const isAuthEndpoint = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/refresh');
    if (error.response?.status === 401 && !isAuthEndpoint) {
      originalRequest._retry = true;
      if (!refreshPromise) {
        refreshPromise = axios.post(`${API_BASE}/auth/refresh`, {}, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 8000,
          withCredentials: true,
        }).then(r => Boolean(r.data?.success)).catch(() => false).finally(() => {
          refreshPromise = null;
        });
      }
      const refreshed = await refreshPromise;
      if (refreshed) return api(originalRequest);
      clearLegacySession();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.replace('/login?cleared=1');
      }
    }
    return Promise.reject(error);
  }
);

if (typeof window !== 'undefined') clearLegacySession();

export default api;
