"use client";

import { useEffect } from 'react';
import { useSchoolBranding } from '@/hooks/useSchoolBranding';

export default function BrandingSync() {
  const { brandingConfig, loading } = useSchoolBranding();

  useEffect(() => {
    if (loading || !brandingConfig) return;

    const root = document.documentElement;

    // Apply primary color
    if (brandingConfig.primaryColor) {
      root.style.setProperty('--primary-color', brandingConfig.primaryColor);
      // For tailwind classes that use primary (if any)
      root.style.setProperty('--tw-color-primary', brandingConfig.primaryColor);
    }

    // Apply dark mode
    if (brandingConfig.darkMode !== false) {
      root.classList.add('dark-mode-forced');
      root.style.setProperty('--bg-base', '#020c18');
      root.style.setProperty('--text-base', '#ffffff');
    } else {
      root.classList.remove('dark-mode-forced');
      root.style.removeProperty('--bg-base');
      root.style.removeProperty('--text-base');
    }

    // Apply typography
    if (brandingConfig.typography) {
      root.style.setProperty('--font-family-base', brandingConfig.typography);
      document.body.style.fontFamily = brandingConfig.typography;
    }

    // Glass effect toggle class
    if (brandingConfig.glassEffect !== false) {
      root.classList.add('glass-enabled');
    } else {
      root.classList.remove('glass-enabled');
    }

    // Animations toggle class
    if (brandingConfig.animations !== false) {
      root.classList.add('animations-enabled');
    } else {
      root.classList.remove('animations-enabled');
    }

  }, [brandingConfig, loading]);

  return null; // This component just injects styles
}
