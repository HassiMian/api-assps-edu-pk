import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { getPool } from "@/lib/server/db";
import { requireEnv } from "@/lib/server/env";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantId: string | null;
  schoolId: number | null;
  isActive: boolean;
  tenant: {
    id: string | null;
    name: string | null;
    type: string | null;
  } | null;
  branding: {
    logoUrl: string | null;
    primaryColor: string | null;
    secondaryColor: string | null;
  } | null;
};

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("authToken")?.value;
  const userId = cookieStore.get("userId")?.value;

  if (!authToken || !userId) return null;

  let payload: jwt.JwtPayload;
  try {
    const secret = requireEnv("JWT_SECRET", "dev-jwt-secret");
    const decoded = jwt.verify(authToken, secret, { algorithms: ["HS256"] });
    if (!decoded || typeof decoded === "string") return null;
    payload = decoded;
  } catch {
    return null;
  }

  const tokenUserId = payload.id != null ? String(payload.id) : "";
  if (!tokenUserId || tokenUserId !== String(userId)) return null;

  await getPool().query(`
    CREATE TABLE IF NOT EXISTS tenant_branding (
      id TEXT PRIMARY KEY,
      tenant_id VARCHAR(120) UNIQUE NOT NULL,
      logo_url TEXT,
      primary_color VARCHAR(40),
      secondary_color VARCHAR(40),
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS tenant_branding_tenant_id_idx ON tenant_branding (tenant_id);
  `);

  const result = await getPool().query(
    `SELECT
       u.id,
       u.name,
       u.email,
       u.role,
       u.tenant_id,
       u.school_id,
       u.is_active,
       s.tenant_id AS school_tenant_id,
       s.school_name,
       s.name AS tenant_name,
       s.type AS tenant_type,
       tb.logo_url AS branding_logo_url,
       tb.primary_color AS branding_primary_color,
       tb.secondary_color AS branding_secondary_color
     FROM users u
     LEFT JOIN schools s ON u.school_id = s.id OR u.tenant_id = s.tenant_id
     LEFT JOIN tenant_branding tb ON tb.tenant_id = COALESCE(u.tenant_id, s.tenant_id)
     WHERE u.id = $1
     LIMIT 1`,
    [tokenUserId]
  );

  const row = result.rows[0];
  if (!row || !row.is_active) return null;

  const normalizedRole = String(row.role || "").toLowerCase() === "super_admin"
    ? "SAAS_ADMIN"
    : String(row.role || "");
  const tenantId = row.tenant_id || row.school_tenant_id || null;

  return {
    id: String(row.id),
    name: row.name,
    email: row.email,
    role: normalizedRole,
    tenantId,
    schoolId: row.school_id ? Number(row.school_id) : null,
    isActive: Boolean(row.is_active),
    tenant: {
      id: tenantId,
      name: row.school_name || row.tenant_name || null,
      type: row.tenant_type || null,
    },
    branding: {
      logoUrl: row.branding_logo_url || null,
      primaryColor: row.branding_primary_color || null,
      secondaryColor: row.branding_secondary_color || null,
    },
  };
}

export async function requireAuthUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}

export async function requireTenantUser() {
  const user = await requireAuthUser();

  if (!user.tenantId && user.role !== "SAAS_ADMIN") {
    throw new Error("Tenant not found");
  }

  return user;
}

export async function requireSaasAdminUser() {
  const user = await requireAuthUser();

  if (String(user.role || "").toUpperCase() !== "SAAS_ADMIN") {
    throw new Error("Forbidden");
  }

  return user;
}
