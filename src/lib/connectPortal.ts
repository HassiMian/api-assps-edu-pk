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

  if (selected === "teacher" || dbKey === "teacher") return "/teacher";
  if (selected === "parent" || dbKey === "parent") return "/parent";
  if (selected === "student" || dbKey === "student") return "/student";

  if (
    selected === "admin" ||
    SCHOOL_STAFF_ROLES.has(dbKey) ||
    SCHOOL_STAFF_ROLES.has(selected)
  ) {
    return "/admin";
  }

  if (PLATFORM_ONLY_ROLES.has(dbKey)) {
    return "/login?force=1";
  }

  return "/admin";
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
    base === "/saas-admin" ||
    base.startsWith("/saas-admin/") ||
    base === "/saas_admin" ||
    base === "/super_admin"
  ) {
    return getConnectPortalPath(role || "", selectedPortal);
  }

  if (raw.startsWith("http")) return raw;
  return raw.startsWith("/") ? raw : getConnectPortalPath(role || "", selectedPortal);
}

export function isPlatformOnlyRole(role: string): boolean {
  return PLATFORM_ONLY_ROLES.has(normalizeRoleKey(role));
}
