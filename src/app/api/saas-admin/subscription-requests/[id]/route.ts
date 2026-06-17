import { NextResponse } from "next/server";
import { requireSaasAdminUser } from "@/lib/server/auth-user";
import { getAdminSubscriptionRequest } from "@/lib/server/subscription-request-admin";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireSaasAdminUser();
    const { id } = await context.params;
    const request = await getAdminSubscriptionRequest(id);

    if (!request) {
      return NextResponse.json({ success: false, message: "Request not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: request });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load request";
    if (message === "Unauthorized" || message === "Forbidden") {
      return NextResponse.json(
        { success: false, message },
        { status: message === "Forbidden" ? 403 : 401 }
      );
    }
    return NextResponse.json({ success: false, message: "Failed to load request" }, { status: 500 });
  }
}
