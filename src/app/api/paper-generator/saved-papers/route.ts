import { NextResponse } from "next/server";
import { getPool } from "@/lib/server/db";
import { withTenant } from "@/lib/server/tenant-guard";

export const runtime = "nodejs";

async function ensureSavedPapersTable() {
  await getPool().query(`
    CREATE TABLE IF NOT EXISTS paper_generator_saved_papers (
      id SERIAL PRIMARY KEY,
      tenant_id VARCHAR(80) NOT NULL,
      teacher_user_id VARCHAR(80),
      name VARCHAR(220) NOT NULL,
      class_name VARCHAR(120),
      subject_name VARCHAR(160),
      payload JSONB NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS paper_generator_saved_papers_tenant_id_idx
      ON paper_generator_saved_papers (tenant_id);
    CREATE INDEX IF NOT EXISTS paper_generator_saved_papers_created_at_idx
      ON paper_generator_saved_papers (created_at DESC);
  `);
}

function getPaperName(body: any) {
  return String(body?.name || body?.config?.name || "Saved Paper").trim().slice(0, 220);
}

export async function GET() {
  return withTenant(async ({ tenantId, user }) => {
    await ensureSavedPapersTable();

    const params: unknown[] = [];
    let where = "";

    if (user.role !== "SAAS_ADMIN") {
      params.push(tenantId);
      where = `WHERE tenant_id = $${params.length}`;
    }

    const result = await getPool().query(
      `SELECT id, tenant_id, teacher_user_id, name, class_name, subject_name, payload, created_at, updated_at
       FROM paper_generator_saved_papers
       ${where}
       ORDER BY created_at DESC
       LIMIT 100`,
      params
    );

    return NextResponse.json({ success: true, data: result.rows });
  });
}

export async function POST(req: Request) {
  return withTenant(async ({ tenantId, user }) => {
    await ensureSavedPapersTable();

    const body = await req.json();
    const name = getPaperName(body);
    const className = String(body?.config?.className || body?.config?.classLevel || "").trim().slice(0, 120) || null;
    const subjectName = String(body?.config?.subjectName || body?.config?.subject || "").trim().slice(0, 160) || null;

    const result = await getPool().query(
      `INSERT INTO paper_generator_saved_papers
        (tenant_id, teacher_user_id, name, class_name, subject_name, payload)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, tenant_id, teacher_user_id, name, class_name, subject_name, payload, created_at, updated_at`,
      [tenantId, user.id ? String(user.id) : null, name, className, subjectName, body]
    );

    return NextResponse.json({
      success: true,
      message: "Paper saved for admin review.",
      data: result.rows[0],
    });
  });
}
