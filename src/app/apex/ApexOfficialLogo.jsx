"use client";

import Image from "next/image";

/**
 * Official APEX branding — single source of truth.
 * Uses ONLY /apex-brand-lockup.png (transparent PNG, no regeneration).
 */
export const APEX_OFFICIAL_LOGO_SRC = "/apex-brand-lockup.png";

export default function ApexOfficialLogo({
  size = 200,
  coreFill = null,
  className = "",
  priority = false,
  alt = "APEX Education OS",
}) {
  const dim = Math.round(size);

  if (coreFill) {
    return (
      <div className={`flex h-full w-full items-center justify-center ${className}`.trim()}>
        <Image
          src={APEX_OFFICIAL_LOGO_SRC}
          alt={alt}
          width={1024}
          height={1024}
          className="pointer-events-none max-h-full max-w-full select-none object-contain object-center"
          style={{ width: `${Math.round(coreFill * 100)}%`, height: "auto" }}
          priority={priority}
          draggable={false}
        />
      </div>
    );
  }

  return (
    <Image
      src={APEX_OFFICIAL_LOGO_SRC}
      alt={alt}
      width={dim}
      height={dim}
      className={`pointer-events-none select-none object-contain object-center ${className}`.trim()}
      style={{ width: dim, height: "auto" }}
      priority={priority}
      draggable={false}
    />
  );
}
