import { NextResponse } from "next/server";
import { requireSaasAdminUser } from "@/lib/server/auth-user";
import { getApexLeadStats } from "@/lib/server/apex-leads-stats";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireSaasAdminUser();
    const stats = await getApexLeadStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load lead stats";
    if (message === "Unauthorized" || message === "Forbidden") {
      return NextResponse.json(
        { success: false, message },
        { status: message === "Forbidden" ? 403 : 401 }
      );
    }
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
