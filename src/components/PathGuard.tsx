"use client";

import { useEffect } from "react";
import { coerceConnectRedirect, getConnectPortalPath } from "@/lib/connectPortal";

/** Block legacy /dashboard and /saas-admin on APEX Connect. */
export default function PathGuard() {
  useEffect(() => {
    const path = window.location.pathname;
    const blocked =
      path === "/dashboard" ||
      path.startsWith("/dashboard/") ||
      path === "/saas-admin" ||
      path.startsWith("/saas-admin/");

    if (!blocked) return;

    let role = "";
    try {
      const raw =
        localStorage.getItem("user") || localStorage.getItem("al_siddique_user");
      if (raw) role = String(JSON.parse(raw)?.role || "");
    } catch {
      /* ignore */
    }

    const target = coerceConnectRedirect(path, role);
    window.location.replace(
      target.startsWith("http") ? target : new URL(target, window.location.origin).href
    );
  }, []);

  return null;
}
