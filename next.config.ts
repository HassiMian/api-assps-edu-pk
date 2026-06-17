import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/login/saas",
        destination: "/login?force=1",
        permanent: false,
      },
      {
        source: "/saas_admin",
        destination: "/admin",
        permanent: false,
      },
      {
        source: "/saas_admin/:path*",
        destination: "/admin",
        permanent: false,
      },
      {
        source: "/saas-admin",
        destination: "/admin",
        permanent: false,
      },
      {
        source: "/school_admin",
        destination: "/admin",
        permanent: false,
      },
      {
        source: "/super_admin",
        destination: "/admin",
        permanent: false,
      },
      {
        source: "/dashboard",
        destination: "/admin",
        permanent: false,
      },
      {
        source: "/dashboard/:path*",
        destination: "/admin",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
