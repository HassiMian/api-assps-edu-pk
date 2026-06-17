import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/auth-user";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const payloadUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId,
  };

  return NextResponse.json({
    success: true,
    user: payloadUser,
    schoolBranding: user.branding
      ? {
          logo: user.branding.logoUrl,
          primaryColor: user.branding.primaryColor,
          secondaryColor: user.branding.secondaryColor,
        }
      : undefined,
    data: {
      user: payloadUser,
      tenant: user.tenant
        ? {
            id: user.tenant.id,
            name: user.tenant.name,
            type: user.tenant.type,
          }
        : null,
      branding: user.branding,
    },
  });
}
