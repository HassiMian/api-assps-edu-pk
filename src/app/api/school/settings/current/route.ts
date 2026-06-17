import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/auth-user";
import { getPool } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user?.schoolId && !user?.tenantId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: school not found in session" },
        { status: 401 }
      );
    }

    const result = await getPool().query(
      `SELECT
         s.id,
         s.tenant_id,
         s.name,
         s.school_name,
         s.address,
         s.email,
         s.phone,
         s.logo_url,
         s.primary_color,
         s.secondary_color,
         s.status,
         st.school_name AS settings_school_name,
         st.school_address,
         st.school_phone,
         st.school_email,
         st.academic_year,
         st.school_logo,
         tb.logo_url AS branding_logo_url,
         tb.primary_color AS branding_primary_color,
         tb.secondary_color AS branding_secondary_color
       FROM schools s
       LEFT JOIN settings st ON st.school_id = s.id
       LEFT JOIN tenant_branding tb ON tb.tenant_id = s.tenant_id
       WHERE ($1::int IS NOT NULL AND s.id = $1::int)
          OR ($2::text IS NOT NULL AND s.tenant_id = $2::text)
       ORDER BY CASE WHEN s.id = $1::int THEN 0 ELSE 1 END
       LIMIT 1`,
      [user.schoolId, user.tenantId]
    );

    const school = result.rows[0];
    if (!school) {
      return NextResponse.json(
        { success: false, message: "School not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        schoolId: school.id,
        tenantId: school.tenant_id || user.tenantId || null,
        schoolName: school.settings_school_name || school.school_name || school.name || "APEX",
        logoUrl: school.school_logo || school.branding_logo_url || school.logo_url || null,
        address: school.school_address || school.address || "",
        phone: school.school_phone || school.phone || "",
        email: school.school_email || school.email || "",
        academicYear: school.academic_year || "2026-2027",
        primaryColor:
          school.branding_primary_color || school.primary_color || "#0f172a",
        secondaryColor:
          school.branding_secondary_color || school.secondary_color || "#c0c0c0",
        status: school.status,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to load current school settings",
      },
      { status: 500 }
    );
  }
}
