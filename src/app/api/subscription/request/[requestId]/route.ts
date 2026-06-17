import { NextResponse } from "next/server";
import { getSubscriptionRequestById } from "@/lib/server/subscription-request-lookup";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  context: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await context.params;
    const request = await getSubscriptionRequestById(requestId);

    if (!request) {
      return NextResponse.json(
        { success: false, message: "Subscription request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: request });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load request";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
