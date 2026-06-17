"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const TenantBrandingContext = createContext(null);

export function TenantBrandingProvider({ children }) {
  const { user } = useAuth();
  const [branding, setBranding] = useState(null);

  useEffect(() => {
    async function load() {
      if (!user) {
        setBranding(null);
        document.documentElement.style.removeProperty("--school-primary");
        document.documentElement.style.removeProperty("--school-secondary");
        return;
      }

      try {
        const res = await fetch("/api/school/branding");
        const data = await res.json();

        if (data && data.success) {
          setBranding(data.branding);

          if (data.branding.primaryColor) {
            document.documentElement.style.setProperty(
              "--school-primary",
              data.branding.primaryColor
            );
          }

          if (data.branding.secondaryColor) {
            document.documentElement.style.setProperty(
              "--school-secondary",
              data.branding.secondaryColor
            );
          }
        }
      } catch (err) {
        console.warn("Tenant branding loading failed:", err);
      }
    }

    load();
  }, [user]);

  return (
    <TenantBrandingContext.Provider value={branding}>
      {children}
    </TenantBrandingContext.Provider>
  );
}

export function useTenantBranding() {
  return useContext(TenantBrandingContext);
}
