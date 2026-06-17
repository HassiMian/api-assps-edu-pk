import { NextResponse } from "next/server";
import { requireSaasAdminUser } from "@/lib/server/auth-user";
import { getGatewaySetupChecklist } from "@/lib/server/gateway-setup-checklist";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireSaasAdminUser();
    return NextResponse.json({ success: true, data: getGatewaySetupChecklist() });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load setup checklist";
    if (message === "Unauthorized" || message === "Forbidden") {
      return NextResponse.json(
        { success: false, message },
        { status: message === "Forbidden" ? 403 : 401 }
      );
    }
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
