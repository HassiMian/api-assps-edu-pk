import { NextResponse } from "next/server";
import { requireSaasAdminUser } from "@/lib/server/auth-user";
import { getSubscriptionRequestStats } from "@/lib/server/subscription-request-stats";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireSaasAdminUser();
    const stats = await getSubscriptionRequestStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load stats";
    if (message === "Unauthorized" || message === "Forbidden") {
      return NextResponse.json(
        { success: false, message },
        { status: message === "Forbidden" ? 403 : 401 }
      );
    }
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
