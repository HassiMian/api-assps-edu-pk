import { normalizeRoleKey } from "@/lib/roleRoutes";

const PLATFORM_ONLY_ROLES = new Set(["saas_admin", "super_admin"]);

const SCHOOL_STAFF_ROLES = new Set([
  "admin",
  "school_admin",
  "schooladmin",
  "principal",
]);

/**
 * Portal paths for api.assps.edu.pk (APEX Connect).
 * Must NEVER return /saas-admin — that route belongs on app.assps.edu.pk only.
 */
export function getConnectPortalPath(
  role: string,
  selectedPortal?: string
): string {
  const dbKey = normalizeRoleKey(role);
  const selected = normalizeRoleKey(selectedPortal || "");

  // The authenticated DB role is authoritative. The UI-selected portal is only
  // a pre-login hint and must never override a known authenticated role.
  if (PLATFORM_ONLY_ROLES.has(dbKey)) return "/login?force=1";
  if (dbKey === "teacher") return "/teacher";
  if (dbKey === "parent") return "/parent";
  if (dbKey === "student") return "/student";
  if (SCHOOL_STAFF_ROLES.has(dbKey)) return "/admin";

  // Fallback is used only before a canonical role is known.
  if (selected === "teacher") return "/teacher";
  if (selected === "parent") return "/parent";
  if (selected === "student") return "/student";
  if (selected === "admin" || SCHOOL_STAFF_ROLES.has(selected)) return "/admin";
  return "/login?force=1";
}

/** Rewrite any legacy /saas-admin or /dashboard path for Connect domain. */
export function coerceConnectRedirect(
  path: string,
  role?: string,
  selectedPortal?: string
): string {
  const raw = String(path || "").trim();
  if (raw.startsWith("https://app.assps.edu.pk/login")) {
    return getConnectPortalPath(role || "", selectedPortal);
  }

  const base = raw.split("?")[0].replace(/\/+$/, "") || "/";

  if (
    base === "/dashboard" ||
    base.startsWith("/dashboard/") ||
    base === "/saas_admin" ||
    base === "/super_admin"
  ) {
    return getConnectPortalPath(role || "", selectedPortal);
  }

  if (base === "/saas-admin" || base.startsWith("/saas-admin/")) {
    const query = raw.includes("?") ? raw.slice(raw.indexOf("?")) : "";
    return `https://app.assps.edu.pk${base}${query}`;
  }

  if (raw.startsWith("http")) return raw;
  return raw.startsWith("/") ? raw : getConnectPortalPath(role || "", selectedPortal);
}

export function isPlatformOnlyRole(role: string): boolean {
  return PLATFORM_ONLY_ROLES.has(normalizeRoleKey(role));
}
