/** Map DB/API role strings to existing App Router portal paths. */
export function normalizeRoleKey(role: string): string {
  return String(role || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-/g, "_");
}

const PORTAL_BY_ROLE: Record<string, string> = {
  admin: "/admin",
  school_admin: "/admin",
  schooladmin: "/admin",
  principal: "/admin",
  super_admin: "/admin",
  saas_admin: "/admin",
  teacher: "/teacher",
  parent: "/parent",
  student: "/student",
};

/** Fix legacy/wrong paths (e.g. /saas_admin from old redirects). */
export function coerceRedirectPath(path: string, roleFallback?: string): string {
  const raw = String(path || "").trim();
  if (!raw) return getPortalPathForRole(roleFallback || "admin");

  const legacy: Record<string, string> = {
    "/saas_admin": "/admin",
    "/super_admin": "/admin",
    "/saas-admin": "/admin",
    "/school_admin": "/admin",
    "/schooladmin": "/admin",
    "/dashboard": "/admin",
  };

  const base = raw.split("?")[0].replace(/\/+$/, "") || "/";
  if (legacy[base]) return legacy[base];

  if (base.startsWith("/saas_admin") || base.startsWith("/saas-admin")) {
    return "/admin";
  }
  if (base.startsWith("/school_admin")) {
    return "/admin";
  }

  return raw.startsWith("/") ? raw : getPortalPathForRole(roleFallback || "admin");
}

export function getPortalPathForRole(role: string, fallback = "/admin"): string {
  const key = normalizeRoleKey(role);
  return PORTAL_BY_ROLE[key] || fallback;
}

/** Post-login redirect — never send users to /dashboard or underscore role paths. */
export function getLoginRedirectForRole(role: string): string {
  return getPortalPathForRole(role, "/admin");
}

/** Prefer DB role; map UI "admin" to school portal unless account is platform admin. */
export function resolveLoginPortal(dbRole: string, selectedPortal?: string): string {
  const dbKey = normalizeRoleKey(dbRole);
  const selected = normalizeRoleKey(selectedPortal || "");

  if (dbKey === "saas_admin" || dbKey === "super_admin") {
    return "/admin";
  }

  if (selected && selected !== dbKey) {
    const selectedPath = getPortalPathForRole(selected);
    const dbPath = getPortalPathForRole(dbRole);
    if (selected === "admin" && dbPath === "/admin") return "/admin";
    if (["teacher", "parent", "student"].includes(selected) && dbKey === selected) {
      return selectedPath;
    }
    if (selected === "admin" && ["teacher", "parent", "student"].includes(dbKey)) {
      return dbPath;
    }
  }

  return getPortalPathForRole(dbRole || selected || "admin");
}
