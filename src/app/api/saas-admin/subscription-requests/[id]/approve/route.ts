import { NextResponse } from "next/server";
import { requireSaasAdminUser } from "@/lib/server/auth-user";
import {
  isFileAdminId,
  fileRequestIdFromAdminId,
  persistFileRequestToDatabase,
} from "@/lib/server/subscription-request-admin";
import { approveSubscriptionRequestByDbId } from "@/lib/server/subscription-request-approve";

export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireSaasAdminUser();

    let { id } = await context.params;

    if (isFileAdminId(id)) {
      const requestId = fileRequestIdFromAdminId(id);
      id = await persistFileRequestToDatabase(requestId);
    }

    const result = await approveSubscriptionRequestByDbId(id);

    if (!result.success) {
      const status = result.message === "Request not found" ? 404 : 400;
      return NextResponse.json({ success: false, message: result.message }, { status });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      data: {
        tenantId: result.tenantId,
        adminEmail: result.adminEmail,
        temporaryPassword: result.temporaryPassword,
        emailSent: result.emailSent,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Approval failed";
    if (message === "Unauthorized" || message === "Forbidden") {
      return NextResponse.json(
        { success: false, message },
        { status: message === "Forbidden" ? 403 : 401 }
      );
    }
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
