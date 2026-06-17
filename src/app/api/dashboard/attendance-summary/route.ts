import { NextResponse } from "next/server";
import { getPool } from "@/lib/server/db";
import { withTenant } from "@/lib/server/tenant-guard";

export const runtime = "nodejs";

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

export async function GET(req: Request) {
  return withTenant(async ({ tenantId, user }) => {
    const url = new URL(req.url);
    const dateParam = url.searchParams.get("date") || getTodayDate();

    const params: Array<string | number> = [dateParam];
    let tenantFilter = "";

    if (user.role !== "SAAS_ADMIN") {
      params.push(tenantId);
      tenantFilter = `AND (s.tenant_id = $2 OR CAST(s.school_id AS TEXT) = $2)`;
    }

    const result = await getPool().query(
      `SELECT
         COUNT(DISTINCT s.id) AS total_students,
         COALESCE(SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END), 0) AS present,
         COALESCE(SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END), 0) AS absent,
         COALESCE(SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END), 0) AS late,
         COALESCE(SUM(CASE WHEN a.status = 'leave' THEN 1 ELSE 0 END), 0) AS leave,
         COALESCE(COUNT(a.id), 0) AS attendance_total
       FROM students s
       LEFT JOIN attendance a ON a.student_id = s.id AND a.date = $1
       WHERE s.is_active = true
       ${tenantFilter}`,
      params
    );

    const row = result.rows[0] || {};
    const totalStudents = Number(row.total_students || 0);
    const present = Number(row.present || 0);
    const absent = Number(row.absent || 0);
    const late = Number(row.late || 0);
    const leave = Number(row.leave || 0);
    const attendanceTotal = Number(row.attendance_total || 0);
    const attendanceRate = attendanceTotal > 0 ? Math.round((present / attendanceTotal) * 100) : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalStudents,
        present,
        absent,
        late,
        leave,
        attendanceTotal,
        attendanceRate,
      },
    });
  });
}
