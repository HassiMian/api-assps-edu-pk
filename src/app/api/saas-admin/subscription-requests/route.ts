import { NextResponse } from "next/server";
import { requireSaasAdminUser } from "@/lib/server/auth-user";
import { listAdminSubscriptionRequests } from "@/lib/server/subscription-request-admin";

export async function GET(req: Request) {
  try {
    await requireSaasAdminUser();

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status");
    const requests = await listAdminSubscriptionRequests(statusParam);

    return NextResponse.json({ success: true, data: requests });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load requests";
    console.error("GET subscription requests failed:", message);
    if (message === "Unauthorized" || message === "Forbidden") {
      return NextResponse.json(
        { success: false, message },
        { status: message === "Forbidden" ? 403 : 401 }
      );
    }
    return NextResponse.json({ success: false, message: "Failed to load requests" }, { status: 500 });
  }
}
