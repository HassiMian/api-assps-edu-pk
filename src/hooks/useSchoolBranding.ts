"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';
import { resolveAssetUrl } from '@/utils/media';

type BrandingConfig = {
  primaryColor?: string;
  typography?: string;
  darkMode?: boolean;
  glassEffect?: boolean;
  animations?: boolean;
  loginBackground?: string | null;
};

type BrandingPayload = {
  school_name?: string;
  school_logo?: string | null;
  school_code?: string | null;
  branding_config?: BrandingConfig | null;
};

export type SchoolBranding = {
  schoolName: string;
  schoolLogo: string | null;
  schoolCode: string | null;
  loading: boolean;
  brandingConfig: BrandingConfig | null;
};

const DEFAULT_SCHOOL_NAME = 'Al Siddique Scholars Public School';

export function useSchoolBranding(): SchoolBranding {
  const { user, loading: authLoading } = useAuth();
  
  // Hydrate from localStorage immediately to prevent flicker
  const initialBranding = (() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = window.localStorage.getItem('apex_school_branding');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  const [schoolName, setSchoolName] = useState(initialBranding?.school_name || initialBranding?.schoolName || DEFAULT_SCHOOL_NAME);
  const [schoolLogo, setSchoolLogo] = useState<string | null>(resolveAssetUrl(initialBranding?.school_logo || initialBranding?.schoolLogo || null));
  const [schoolCode, setSchoolCode] = useState<string | null>(initialBranding?.school_code || initialBranding?.schoolCode || null);
  const [brandingConfig, setBrandingConfig] = useState<BrandingConfig | null>(initialBranding?.branding_config || initialBranding?.brandingConfig || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const applyBranding = (data: BrandingPayload) => {
      if (!mounted || !data) return;
      const parsedName = data.school_name ? String(data.school_name) : DEFAULT_SCHOOL_NAME;
      const parsedLogo = resolveAssetUrl(data.school_logo);
      const parsedCode = data.school_code ? String(data.school_code) : null;
      const parsedConfig = data.branding_config || null;
      
      setSchoolName(parsedName);
      setSchoolLogo(parsedLogo);
      setSchoolCode(parsedCode);
      setBrandingConfig(parsedConfig);
      
      // Cache the branding data
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('apex_school_branding', JSON.stringify({
          school_name: parsedName,
          school_logo: parsedLogo,
          school_code: parsedCode,
          branding_config: parsedConfig
        }));
      }
    };

    const loadBranding = async () => {
      if (authLoading) return;
      try {
        if (user) {
          try {
            const authRes = await api.get('/settings');
            if (authRes.data?.data) applyBranding(authRes.data.data);
            return;
          } catch {
            // Fall through to public branding for degraded auth states.
          }
        }
        const publicParams = user?.school_code
          ? { school_code: user.school_code }
          : user?.school_id
            ? { school_id: user.school_id }
            : undefined;
        const publicRes = await api.get('/settings/public', { params: publicParams });
        if (publicRes.data?.data) applyBranding(publicRes.data.data);
      } catch {
        // Keep defaults when branding is unavailable.
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadBranding();

    return () => {
      mounted = false;
    };
  }, [user, authLoading]);

  return { schoolName, schoolLogo, schoolCode, brandingConfig, loading };
}
