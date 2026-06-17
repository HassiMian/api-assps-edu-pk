"use client";

import { useEffect } from "react";
import { coerceRedirectPath, getPortalPathForRole } from "@/lib/roleRoutes";

function readStoredRole(): string {
  try {
    const raw =
      localStorage.getItem("user") || localStorage.getItem("al_siddique_user");
    if (!raw) return "";
    return String(JSON.parse(raw)?.role || "");
  } catch {
    return "";
  }
}

/** Legacy /dashboard URL — always forward to real portal (never 404). */
export default function DashboardPage() {
  useEffect(() => {
    const go = async () => {
      const localRole = readStoredRole();
      if (localRole) {
        window.location.replace(
          coerceRedirectPath(getPortalPathForRole(localRole), localRole)
        );
        return;
      }
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data = await res.json();
        const role = data?.user?.role || data?.data?.user?.role;
        if (data?.success && role) {
          window.location.replace(
            coerceRedirectPath(getPortalPathForRole(role), role)
          );
          return;
        }
      } catch {
        /* fall through */
      }
      window.location.replace("/login?next=/admin");
    };
    go();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <p className="text-slate-400 text-sm">Opening your portal…</p>
    </div>
  );
}
