import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/server/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const schoolId = req.nextUrl.searchParams.get("school_id") || req.nextUrl.searchParams.get("schoolId");
  const schoolCode =
    req.nextUrl.searchParams.get("school_code") || req.nextUrl.searchParams.get("schoolCode");

  try {
    const pool = getPool();
    const params: string[] = [];
    let where = "WHERE status IS NULL OR LOWER(status) = 'active'";

    if (schoolCode) {
      params.push(String(schoolCode).trim());
      where += ` AND LOWER(COALESCE(code, '')) = LOWER($${params.length})`;
    } else if (schoolId) {
      params.push(String(schoolId).trim());
      where += ` AND (CAST(id AS TEXT) = $${params.length} OR LOWER(COALESCE(tenant_id, '')) = LOWER($${params.length}))`;
    } else {
      return NextResponse.json(
        { success: false, message: "school_id or school_code is required" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `SELECT id, school_name, code, tenant_id, logo_url, primary_color, secondary_color
       FROM schools
       ${where}
       ORDER BY id ASC
       LIMIT 1`,
      params
    );

    if (!result.rows.length) {
      return NextResponse.json({ success: false, message: "School not found" }, { status: 404 });
    }

    const row = result.rows[0];
    return NextResponse.json({
      success: true,
      data: {
        school_id: String(row.id),
        school_code: row.code || row.tenant_id || null,
        school_name: row.school_name || "School",
        school_logo: row.logo_url || null,
        branding_config: {
          primaryColor: row.primary_color || null,
          secondaryColor: row.secondary_color || null,
        },
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load school";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
