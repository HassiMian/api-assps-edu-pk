"use client";

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { getPortalPathForRole } from '@/lib/roleRoutes';

type User = {
  id: string | number;
  name: string;
  email: string;
  role: string;
  designation?: string;
  school_id?: string | number;
  school_code?: string;
};

type JwtPayload = {
  id?: string | number;
  name?: string;
  email?: string;
  role?: string;
  exp?: number | string;
  school_id?: string | number;
  schoolId?: string | number;
  school_code?: string;
  schoolCode?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (token: string, refreshTokenOrUser: string | null | User, userData?: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
});
const MAX_SESSION_MS = 24 * 60 * 60 * 1000;

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}, timeoutMs = 8000) {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(input, { ...init, signal: controller.signal })
  } finally {
    window.clearTimeout(timeout)
  }
}

function parseJwt(token: string): JwtPayload | null {
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) return null
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

function isTokenExpired(token: string): boolean {
  const payload = parseJwt(token)
  if (!payload) return true
  const exp = typeof payload.exp === 'number' ? payload.exp : Number(payload.exp)
  if (!Number.isFinite(exp)) return true
  return Date.now() / 1000 > exp
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const clearSession = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    localStorage.removeItem('loginAt')
    localStorage.removeItem('al_siddique_token')
    localStorage.removeItem('al_siddique_refresh_token')
    localStorage.removeItem('al_siddique_user')
    localStorage.removeItem('schoolBranding')
    localStorage.removeItem('apex_school_branding')
    setUser(null)
  }

  const refreshAccessToken = useCallback(async (refreshToken: string) => {
    try {
      const response = await api.post('/auth/refresh', { refreshToken })
      const data = response.data
      if (data.success && data.token) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('al_siddique_token', data.token)
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken)
          localStorage.setItem('al_siddique_refresh_token', data.refreshToken)
        }
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user))
          localStorage.setItem('al_siddique_user', JSON.stringify(data.user))
          setUser(data.user)
        }
        if (data.schoolBranding) {
          const branding = JSON.stringify(data.schoolBranding)
          localStorage.setItem('schoolBranding', branding)
          localStorage.setItem('apex_school_branding', branding)
        }
        return true
      }
    } catch {
      clearSession()
    }
    return false
  }, [])

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('token') || localStorage.getItem('al_siddique_token')
      const refreshToken = localStorage.getItem('refreshToken') || localStorage.getItem('al_siddique_refresh_token')
      const savedUser = localStorage.getItem('user') || localStorage.getItem('al_siddique_user')
      const loginAt = Number(localStorage.getItem('loginAt') || 0)

      if (!token) {
        setLoading(false)
        return
      }
      localStorage.setItem('token', token)
      localStorage.setItem('al_siddique_token', token)
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken)
        localStorage.setItem('al_siddique_refresh_token', refreshToken)
      }
      if (loginAt && Date.now() - loginAt > MAX_SESSION_MS) {
        clearSession()
        setLoading(false)
        router.replace('/login')
        return
      }

      // Immediately restore from localStorage for instant UI
      let parsedSavedUser: User | null = null
      if (savedUser) {
        try {
          parsedSavedUser = JSON.parse(savedUser)
          setUser(parsedSavedUser)
        } catch {
          // ignore parse errors
        }
      }

      if (isTokenExpired(token)) {
        if (refreshToken) {
          if (parsedSavedUser) {
            setLoading(false)
          }
          const refreshed = await refreshAccessToken(refreshToken)
          if (!refreshed) {
            clearSession()
            setLoading(false)
            router.replace('/login')
            return
          }
        } else {
          clearSession()
          setLoading(false)
          router.replace('/login')
          return
        }
      }

      if (!parsedSavedUser) {
        const payload = parseJwt(token)
        if (payload) {
          setUser({
            id: payload.id ?? '0',
            name: payload.name || 'User',
            email: payload.email || '',
            role: payload.role || 'student',
          })
        }
      }

      // Sync cookies so middleware proxy (which checks userId cookie) lets the user through
      // without this, restoring from localStorage leaves cookies empty → /admin → /login loop
      try {
        await fetchWithTimeout('/api/auth/sync-session', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        })
      } catch {
        // Non-critical — client-side session still works even if cookie sync fails
      }

      setLoading(false)

      // Background refresh of user profile — do NOT redirect on failure
      try {
        const res = await api.get('/auth/me', { timeout: 8000 })
        const meUser = res.data?.user || res.data?.data?.user
        if (res.data?.success && meUser) {
          setUser(meUser)
          localStorage.setItem('user', JSON.stringify(meUser))
          localStorage.setItem('al_siddique_user', JSON.stringify(meUser))
        }
        const brandingPayload = res.data?.schoolBranding || res.data?.data?.branding
        if (brandingPayload) {
          const branding = JSON.stringify(brandingPayload)
          localStorage.setItem('schoolBranding', branding)
          localStorage.setItem('apex_school_branding', branding)
        }
      } catch {
        // Backend temporarily unreachable — keep existing session, do not log out
      }
    }

    restoreSession()
  }, [refreshAccessToken, router])

  const login = (token: string, refreshTokenOrUser: string | null | User, userData?: User) => {
    const refreshToken = typeof refreshTokenOrUser === 'string' || refreshTokenOrUser === null ? refreshTokenOrUser : null
    const user = (userData || (typeof refreshTokenOrUser === 'object' ? refreshTokenOrUser : null)) as User | null
    if (!user) return
    localStorage.setItem('token', token)
    localStorage.setItem('al_siddique_token', token)
    localStorage.setItem('loginAt', String(Date.now()))
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('al_siddique_refresh_token', refreshToken)
    }
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('al_siddique_user', JSON.stringify(user))
    setUser(user)
    // Caller performs navigation (avoids double redirect to /dashboard)
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch {
      /* still clear local session */
    }
    clearSession()
    window.location.href = '/login?cleared=1'
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
