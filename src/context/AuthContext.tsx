"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import api from '@/utils/api';

type User = {
  id: string | number;
  name: string;
  email: string;
  role: string;
  designation?: string;
  school_id?: string | number;
  school_code?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (token: string, refreshTokenOrUser: string | null | User, userData?: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, login: () => {}, logout: () => {} });

function clearLegacyLocalAuth() {
  if (typeof window === 'undefined') return;
  for (const key of ['token','refreshToken','al_siddique_token','al_siddique_refresh_token']) localStorage.removeItem(key);
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const clearSession = () => {
    clearLegacyLocalAuth();
    localStorage.removeItem('user');
    localStorage.removeItem('al_siddique_user');
    localStorage.removeItem('loginAt');
    localStorage.removeItem('schoolBranding');
    localStorage.removeItem('apex_school_branding');
    setUser(null);
  };

  useEffect(() => {
    let cancelled = false;
    clearLegacyLocalAuth();
    api.get('/auth/me', { timeout: 8000 })
      .then((res) => {
        if (cancelled) return;
        const meUser = res.data?.user || res.data?.data?.user;
        if (res.data?.success && meUser) {
          setUser(meUser);
          localStorage.setItem('user', JSON.stringify(meUser));
          localStorage.setItem('al_siddique_user', JSON.stringify(meUser));
        }
        const branding = res.data?.schoolBranding || res.data?.data?.branding;
        if (branding) {
          const raw = JSON.stringify(branding);
          localStorage.setItem('schoolBranding', raw);
          localStorage.setItem('apex_school_branding', raw);
        }
      })
      .catch(() => { if (!cancelled) clearSession(); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const login = (_token: string, refreshTokenOrUser: string | null | User, userData?: User) => {
    const nextUser = (userData || (typeof refreshTokenOrUser === 'object' ? refreshTokenOrUser : null)) as User | null;
    clearLegacyLocalAuth();
    if (!nextUser) return;
    localStorage.setItem('user', JSON.stringify(nextUser));
    localStorage.setItem('al_siddique_user', JSON.stringify(nextUser));
    localStorage.setItem('loginAt', String(Date.now()));
    setUser(nextUser);
  };

  const logout = async () => {
    try { await api.post('/auth/logout', {}); } catch { /* clear locally regardless */ }
    clearSession();
    window.location.href = '/login?cleared=1';
  };

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
