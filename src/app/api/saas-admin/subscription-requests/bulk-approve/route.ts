import { NextResponse } from "next/server";
import { requireSaasAdminUser } from "@/lib/server/auth-user";
import { bulkApprovePaymentConfirmedRequests } from "@/lib/server/subscription-request-bulk-approve";

export const runtime = "nodejs";

export async function POST() {
  try {
    await requireSaasAdminUser();
    const result = await bulkApprovePaymentConfirmedRequests();

    return NextResponse.json({
      success: true,
      message:
        result.total === 0
          ? "No payment-confirmed requests to approve"
          : `Approved ${result.approved} of ${result.total} payment-confirmed requests`,
      data: result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Bulk approve failed";
    if (message === "Unauthorized" || message === "Forbidden") {
      return NextResponse.json(
        { success: false, message },
        { status: message === "Forbidden" ? 403 : 401 }
      );
    }
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
