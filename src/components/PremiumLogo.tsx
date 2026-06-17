"use client";

import React from 'react';
import { resolveAssetUrl } from '@/utils/media';

const FALLBACK_LOGO = '/ilm-logo.svg';

export default function PremiumLogo({ src = '/ilm-logo.svg', alt = 'Logo', size = 48, className = '' }: { src?: string | null, alt?: string, size?: number, className?: string, variant?: 'default' | 'hero' }) {
  const resolvedSrc = resolveAssetUrl(src);
  return (
    <div
      className={`premium-logo-shell relative flex items-center justify-center overflow-hidden rounded-[18px] border border-[#C8991A]/35 bg-[#f8fafc] ${className}`}
      style={{
        width: size,
        height: size,
      }}
    >
      <img
        src={resolvedSrc}
        alt={alt}
        className="h-[86%] w-[86%] object-contain"
        style={{ display: 'block' }}
        onError={(event) => {
          const target = event.currentTarget;
          if (target.src.endsWith(FALLBACK_LOGO)) return;
          target.src = FALLBACK_LOGO;
        }}
      />
    </div>
  );
}
