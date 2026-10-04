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
  const [schoolName, setSchoolName] = useState(DEFAULT_SCHOOL_NAME);
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);
  const [schoolCode, setSchoolCode] = useState<string | null>(null);
  const [brandingConfig, setBrandingConfig] = useState<BrandingConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const applyBranding = (data: BrandingPayload) => {
      if (!mounted || !data) return;
      setSchoolName(data.school_name ? String(data.school_name) : DEFAULT_SCHOOL_NAME);
      setSchoolLogo(resolveAssetUrl(data.school_logo));
      setSchoolCode(data.school_code ? String(data.school_code) : null);
      setBrandingConfig(data.branding_config || null);
    };

    const loadBranding = async () => {
      if (authLoading) return;
      try {
        if (user) {
          try {
            const authRes = await api.get('/settings');
            applyBranding(authRes.data?.data || {});
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
        applyBranding(publicRes.data?.data || {});
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
