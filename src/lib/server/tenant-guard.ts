import { NextResponse } from "next/server";
import { requireTenantUser } from "@/lib/server/auth-user";
import { getPool } from "@/lib/server/db";

export const DEMO_TENANT_IDS = new Set(["demo", "demo-school", "apex-demo-school"]);

export async function verifyTenantAccess(
  userSchoolId: string | number | null | undefined,
  resourceSchoolId: string | number | null | undefined
) {
  if (!userSchoolId) {
    throw new Error("School ID missing in session");
  }

  if (String(userSchoolId) !== String(resourceSchoolId || "")) {
    throw new Error("Tenant isolation violation. Access denied.");
  }

  return true;
}

export async function getSchoolById(schoolId: string | number) {
  const result = await getPool().query(
    "SELECT * FROM schools WHERE id = $1 LIMIT 1",
    [schoolId]
  );

  return result.rows[0] || null;
}

export async function getCurrentTenant() {
  const user = await requireTenantUser();

  if (!user.schoolId && user.role !== "SAAS_ADMIN") {
    throw new Error("School not linked");
  }

  return {
    userId: user.id,
    schoolId: user.schoolId,
    tenantId: user.tenantId,
    role: user.role,
    isDemo: user.tenantId ? DEMO_TENANT_IDS.has(user.tenantId) : false,
  };
}

export async function withTenant<T>(
  handler: (ctx: {
    user: Awaited<ReturnType<typeof requireTenantUser>>;
    tenantId: string;
  }) => Promise<T>
) {
  let user: Awaited<ReturnType<typeof requireTenantUser>>;

  try {
    user = await requireTenantUser();
  } catch {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  if (user.role === "SAAS_ADMIN") {
    return handler({
      user,
      tenantId: user.tenantId || "",
    });
  }

  if (!user.tenantId) {
    return NextResponse.json(
      { success: false, message: "Tenant access missing" },
      { status: 403 }
    );
  }

  return handler({
    user,
    tenantId: user.tenantId,
  });
}
