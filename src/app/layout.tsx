import type { Metadata, Viewport } from "next";
import "./globals.css";
import "../styles/mobile-shell-fix.css";
import { AuthProvider } from "@/context/AuthContext";
import { TenantBrandingProvider } from "@/context/TenantBrandingContext";
import ScrollRestoration from "@/components/ScrollRestoration";



export const metadata: Metadata = {
  title: {
    default: "APEX Connect | Super App",
    template: "%s | APEX Connect",
  },
  description:
    "APEX Connect (api.assps.edu.pk) — teachers, parents, students, school admins. APEX OS SaaS: app.assps.edu.pk",
  icons: {
    icon: "/ilm-logo.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

import BrandingSync from "@/components/BrandingSync";
import PathGuard from "@/components/PathGuard";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <AuthProvider>
          <TenantBrandingProvider>
            <BrandingSync />
            <PathGuard />
            <ScrollRestoration />
            {children}
          </TenantBrandingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

