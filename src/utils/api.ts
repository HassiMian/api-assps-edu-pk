import axios from 'axios';

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';
let refreshPromise: Promise<string | null> | null = null;

function clearLocalSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('al_siddique_token');
  localStorage.removeItem('al_siddique_refresh_token');
  localStorage.removeItem('al_siddique_user');
}

function getStoredToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token') || localStorage.getItem('al_siddique_token');
}

function getStoredRefreshToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken') || localStorage.getItem('al_siddique_refresh_token');
}

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = getStoredToken();
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config
    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error)
    }

    const requestUrl = String(originalRequest.url || '')
    const isAuthEndpoint = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/refresh')

    if (error.response?.status === 401 && !isAuthEndpoint) {
      const refreshToken = getStoredRefreshToken()
      if (!refreshToken) {
        clearLocalSession()
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          // Use replace + cleared=1 so login page does NOT auto-redirect back → breaks loop
          window.location.replace('/login?cleared=1')
        }
        return Promise.reject(error)
      }

      originalRequest._retry = true
      try {
        if (!refreshPromise) {
          refreshPromise = axios.post(`${API_BASE}/auth/refresh`, { refreshToken }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 8000,
          }).then((refreshResponse) => {
            if (refreshResponse.data?.success && refreshResponse.data.token) {
              localStorage.setItem('token', refreshResponse.data.token)
              localStorage.setItem('al_siddique_token', refreshResponse.data.token)
              if (refreshResponse.data.refreshToken) {
                localStorage.setItem('refreshToken', refreshResponse.data.refreshToken)
                localStorage.setItem('al_siddique_refresh_token', refreshResponse.data.refreshToken)
              }
              return refreshResponse.data.token as string
            }
            return null
          }).catch(() => null).finally(() => {
            refreshPromise = null
          })
        }

        const newToken = await refreshPromise
        if (newToken) {
          originalRequest.headers = originalRequest.headers || {}
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return axios(originalRequest)
        }
      } catch {
        // fall through to session clear below
      }

      clearLocalSession()
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        // Use replace + cleared=1 so login page does NOT auto-redirect back → breaks loop
        window.location.replace('/login?cleared=1')
      }
    }
    return Promise.reject(error)
  }
)

export default api;
