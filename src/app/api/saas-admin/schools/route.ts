import { NextResponse } from "next/server";
import { getPool } from "@/lib/server/db";
import { requireTenantUser } from "@/lib/server/auth-user";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await requireTenantUser();
    if (user.role !== "SAAS_ADMIN" && user.role !== "super_admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Access restricted to SaaS Administrators." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";
    const plan = searchParams.get("plan")?.trim() || "";

    const pool = getPool();

    // 1. Build query for listing schools
    let queryText = `
      SELECT 
        s.id, s.name, s.code, s.tenant_id, s.status, s.subscription_plan, 
        s.school_name, s.address, s.owner_name, s.email, s.phone, s.logo_url,
        s.subscription_status, s.subscription_start_date, s.subscription_end_date, s.city,
        (SELECT COUNT(*) FROM students st WHERE st.school_id = s.id) AS active_students_count
      FROM schools s
      WHERE 1=1
    `;
    const queryParams: any[] = [];

    if (search) {
      queryParams.push(`%${search}%`);
      queryText += ` AND (
        s.school_name ILIKE $${queryParams.length} OR 
        s.owner_name ILIKE $${queryParams.length} OR 
        s.email ILIKE $${queryParams.length} OR
        s.code ILIKE $${queryParams.length}
      )`;
    }

    if (status) {
      queryParams.push(status);
      queryText += ` AND s.status = $${queryParams.length}`;
    }

    if (plan) {
      queryParams.push(plan);
      queryText += ` AND s.subscription_plan = $${queryParams.length}`;
    }

    queryText += " ORDER BY s.school_name ASC";

    const schoolsRes = await pool.query(queryText, queryParams);

    // 2. Compute statistics for dashboard cards
    const statsQuery = `
      SELECT 
        COUNT(*)::int as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END)::int as active,
        COUNT(CASE WHEN status = 'suspended' THEN 1 END)::int as suspended,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END)::int as inactive
      FROM schools
    `;
    const statsRes = await pool.query(statsQuery);
    const stats = statsRes.rows[0];

    // Compute monthly recurring revenue run-rate (MRR estimate)
    // Starter: 4999, Professional: 9999, Enterprise: 25000 (estimated)
    const activeSchoolsRes = await pool.query("SELECT subscription_plan FROM schools WHERE status = 'active'");
    let mrr = 0;
    activeSchoolsRes.rows.forEach((row) => {
      const p = String(row.subscription_plan || "").toLowerCase();
      if (p.includes("starter")) mrr += 4999;
      else if (p.includes("professional") || p.includes("pro")) mrr += 9999;
      else if (p.includes("enterprise")) mrr += 25000;
    });

    return NextResponse.json({
      success: true,
      data: schoolsRes.rows,
      stats: {
        ...stats,
        mrrEstimatePkr: mrr,
      },
    });
  } catch (error: any) {
    console.error("[schools api get] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to retrieve schools." },
      { status: 500 }
    );
  }
}
