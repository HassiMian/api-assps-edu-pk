import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getPool } from "@/lib/server/db";
import { requireEnv } from "@/lib/server/env";
import { getConnectPortalPath } from "@/lib/connectPortal";
import { normalizeRoleKey } from "@/lib/roleRoutes";
import { shouldAttachSchoolScope } from "@/lib/platform";

export async function POST(req: Request) {
  const pool = getPool();

  try {
    const { email, password, demoMode, school_id, school_code, role: requestedRoleRaw } =
      await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    // 1. Ensure type and status columns exist in the schools table
    await pool.query(
      `ALTER TABLE schools ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'REAL';
       ALTER TABLE schools ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';`
    ).catch((err) => {
      console.warn("Bootstrap schema alteration warning in Login:", err.message);
    });

    const schoolScope = String(school_code || school_id || "").trim();
    const shouldScopeSchool = shouldAttachSchoolScope(school_id, school_code);

    const queryParams: any[] = [String(email).trim().toLowerCase()];
    let schoolFilter = "";

    if (shouldScopeSchool) {
      queryParams.push(schoolScope);
      schoolFilter = `
        AND (
          LOWER(COALESCE(s.code, '')) = LOWER($2)
          OR LOWER(COALESCE(s.tenant_id, '')) = LOWER($2)
          OR CAST(s.id AS TEXT) = $2
        )`;
    }

    // 2. Query user joined with school parameters
    const userRes = await pool.query(
      `SELECT u.id, u.name, u.email, u.password, u.role, u.is_active, u.must_change_password, u.school_id, u.tenant_id,
              COALESCE(u.tenant_id, s.tenant_id) AS effective_tenant_id,
              COALESCE(u.school_id, s.id) AS effective_school_id,
              s.school_name, s.type AS tenant_type, s.logo_url, s.primary_color, s.secondary_color
       FROM users u
       LEFT JOIN schools s ON u.school_id = s.id OR u.tenant_id = s.tenant_id
       WHERE LOWER(u.email) = LOWER($1)
       ${schoolFilter}
       ORDER BY CASE WHEN u.school_id = s.id THEN 0 ELSE 1 END, s.id ASC
       LIMIT 1`,
      queryParams
    );

    if (userRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid login credentials" },
        { status: 401 }
      );
    }

    const user = userRes.rows[0];

    if (!user.is_active) {
      return NextResponse.json(
        { success: false, message: "Invalid login credentials" },
        { status: 401 }
      );
    }

    const tenantType = String(user.tenant_type || "REAL").toUpperCase();

    // 3. Demo separation checks
    if (demoMode && tenantType !== "DEMO") {
      return NextResponse.json(
        { success: false, message: "This is not a demo account" },
        { status: 403 }
      );
    }

    if (!demoMode && tenantType === "DEMO") {
      return NextResponse.json(
        { success: false, message: "Please use demo login for demo account" },
        { status: 403 }
      );
    }

    // 4. Verify password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { success: false, message: "Invalid login credentials" },
        { status: 401 }
      );
    }

    const schoolBranding = {
      logo: user.logo_url || null,
      primaryColor: user.primary_color || null,
      secondaryColor: user.secondary_color || null,
    };
    const role = String(user.role || "").toUpperCase();
    const dbKey = normalizeRoleKey(user.role);
    const requestedRole = normalizeRoleKey(String(requestedRoleRaw || ""));
    const isPlatformOnly =
      dbKey === "super_admin" || dbKey === "saas_admin" || role === "SUPER_ADMIN" || role === "SAAS_ADMIN";

    let responseRole = String(user.role || "admin");
    if (isPlatformOnly && requestedRole !== "admin") {
      responseRole = "SAAS_ADMIN";
    } else if (
      ["admin", "school_admin", "schooladmin", "principal"].includes(dbKey) ||
      requestedRole === "admin" ||
      user.effective_school_id ||
      user.school_id
    ) {
      responseRole = "school_admin";
    } else if (dbKey === "teacher" || dbKey === "parent" || dbKey === "student") {
      responseRole = dbKey;
    }

    // 5. Generate secure JWT token matching the normalized role returned to the client.
    const JWT_SECRET = requireEnv("JWT_SECRET", "dev-jwt-secret");
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: normalizeRoleKey(responseRole) || responseRole,
        school_id: user.effective_school_id || user.school_id,
        tenant_id: user.effective_tenant_id || user.tenant_id,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 6. Handle password change enforcement
    if (user.must_change_password) {
      const response = NextResponse.json({
        success: true,
        redirectTo: `/auth/change-password?userId=${user.id}`,
        mustChangePassword: true,
        token,
        user: {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: responseRole,
          tenantId: user.effective_tenant_id || user.tenant_id,
          tenantName: user.school_name || "APEX",
          tenantType: tenantType,
        },
        schoolBranding,
      });

      setLoginCookies(response, {
        token,
        userId: String(user.id),
        tenantId: user.effective_tenant_id || user.tenant_id || "",
        role: responseRole,
      });

      return response;
    }

    const portalPath = getConnectPortalPath(
      String(responseRole || user.role || "admin"),
      requestedRole || undefined
    );

    const response = NextResponse.json({
      success: true,
      redirectTo: portalPath,
      portalPath,
      token,
      user: {
        id: String(user.id),
        name: user.name,
        email: user.email,
        role: responseRole,
        tenantId: user.effective_tenant_id || user.tenant_id,
        tenantName: user.school_name || "APEX",
        tenantType: tenantType,
      },
      schoolBranding,
    });

    setLoginCookies(response, {
      token,
      userId: String(user.id),
      tenantId: user.effective_tenant_id || user.tenant_id || "",
      role: responseRole,
    });

    return response;
  } catch (error: any) {
    console.error("Login API route error:", error?.message || error);
    return NextResponse.json(
      { success: false, message: "Login failed" },
      { status: 500 }
    );
  }
}

function setLoginCookies(
  response: NextResponse,
  {
    token,
    userId,
    tenantId,
    role,
  }: {
    token: string;
    userId: string;
    tenantId: string;
    role: string;
  }
) {
  const options = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };

  response.cookies.set("authToken", token, options);
  response.cookies.set("userId", userId, options);
  response.cookies.set("tenantId", tenantId, options);
  response.cookies.set("role", role, options);
}
