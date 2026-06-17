import { v4 as uuid } from "uuid";
import { getPool } from "./db";

let schemaReady: Promise<void> | null = null;

async function ensureTenantBrandingTable() {
  if (!schemaReady) {
    schemaReady = getPool().query(`
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
    `).then(() => undefined);
  }
  return schemaReady;
}

export async function upsertTenantBrandingLogo({
  tenantId,
  logoUrl,
}: {
  tenantId: string;
  logoUrl: string;
}) {
  await ensureTenantBrandingTable();

  const result = await getPool().query(
    `INSERT INTO tenant_branding (id, tenant_id, logo_url, updated_at)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (tenant_id)
     DO UPDATE SET logo_url = EXCLUDED.logo_url, updated_at = NOW()
     RETURNING
       id,
       tenant_id AS "tenantId",
       logo_url AS "logoUrl",
       primary_color AS "primaryColor",
       secondary_color AS "secondaryColor",
       created_at AS "createdAt",
       updated_at AS "updatedAt"`,
    [uuid(), tenantId, logoUrl]
  );

  await getPool().query(
    "UPDATE schools SET logo_url = $1, updated_at = NOW() WHERE tenant_id = $2",
    [logoUrl, tenantId]
  ).catch(() => undefined);

  return result.rows[0];
}

export async function getTenantBranding(tenantId: string) {
  await ensureTenantBrandingTable();

  const result = await getPool().query(
    `SELECT
       id,
       tenant_id AS "tenantId",
       logo_url AS "logoUrl",
       primary_color AS "primaryColor",
       secondary_color AS "secondaryColor",
       created_at AS "createdAt",
       updated_at AS "updatedAt"
     FROM tenant_branding
     WHERE tenant_id = $1
     LIMIT 1`,
    [tenantId]
  );

  return result.rows[0] || null;
}

export async function upsertTenantBranding({
  tenantId,
  logoUrl,
  primaryColor,
  secondaryColor,
}: {
  tenantId: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
}) {
  await ensureTenantBrandingTable();

  const result = await getPool().query(
    `INSERT INTO tenant_branding (
       id, tenant_id, logo_url, primary_color, secondary_color, updated_at
     )
     VALUES ($1, $2, $3, $4, $5, NOW())
     ON CONFLICT (tenant_id)
     DO UPDATE SET
       logo_url = COALESCE(EXCLUDED.logo_url, tenant_branding.logo_url),
       primary_color = COALESCE(EXCLUDED.primary_color, tenant_branding.primary_color),
       secondary_color = COALESCE(EXCLUDED.secondary_color, tenant_branding.secondary_color),
       updated_at = NOW()
     RETURNING
       id,
       tenant_id AS "tenantId",
       logo_url AS "logoUrl",
       primary_color AS "primaryColor",
       secondary_color AS "secondaryColor",
       created_at AS "createdAt",
       updated_at AS "updatedAt"`,
    [uuid(), tenantId, logoUrl || null, primaryColor || null, secondaryColor || null]
  );

  await getPool().query(
    `UPDATE schools
     SET
       logo_url = COALESCE($1, logo_url),
       primary_color = COALESCE($2, primary_color),
       secondary_color = COALESCE($3, secondary_color),
       updated_at = NOW()
     WHERE tenant_id = $4`,
    [logoUrl || null, primaryColor || null, secondaryColor || null, tenantId]
  ).catch(() => undefined);

  return result.rows[0];
}
