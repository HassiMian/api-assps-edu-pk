"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPortalPathForRole } from "@/lib/roleRoutes";

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

/** When session is in localStorage only (Express login), redirect client-side. */
export default function DashboardClientFallback() {
  const router = useRouter();

  useEffect(() => {
    const role = readStoredRole();
    if (role) {
      window.location.replace(getPortalPathForRole(role, "/admin"));
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next") || "";
    const nextPath =
      next === "/dashboard" || next.startsWith("/dashboard/")
        ? "/admin"
        : next || "/admin";
    router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <p className="text-slate-400 text-sm">Opening your portal…</p>
    </div>
  );
}
