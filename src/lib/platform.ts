/** Canonical domains and browser titles for the three public surfaces. */
export const DOMAINS = {
  website: "apex.assps.edu.pk",
  connect: "api.assps.edu.pk",
  saas: "app.assps.edu.pk",
} as const;

export const URLS = {
  gateway: "https://apex.assps.edu.pk/gateway",
  connectLogin: "https://api.assps.edu.pk/login",
  saasLogin: "https://app.assps.edu.pk/login",
  connectHome: "https://api.assps.edu.pk/login",
} as const;

export const TITLES = {
  connectDefault: "APEX Connect | Super App",
  connectLogin: "APEX Connect | Login",
  connectAdmin: "APEX Connect | School Admin",
  website: "APEX | Education OS",
  saas: "APEX OS | School Management",
} as const;

export const SCHOOL_SCOPE_SKIP = new Set([
  "super-admin",
  "super_admin",
  "apex",
  "default",
  "demo",
]);

export function shouldAttachSchoolScope(schoolId?: string | null, schoolCode?: string | null) {
  const scope = String(schoolCode || schoolId || "").trim().toLowerCase();
  if (!scope) return false;
  return !SCHOOL_SCOPE_SKIP.has(scope);
}
