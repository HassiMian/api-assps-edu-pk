import { NextResponse } from "next/server";
import { getPool } from "@/lib/server/db";
import { requireSaasAdminUser } from "@/lib/server/auth-user";
import {
  getAdminSubscriptionRequest,
  isFileAdminId,
  fileRequestIdFromAdminId,
  updateFileSubscriptionRequest,
} from "@/lib/server/subscription-request-admin";
import { sendPaymentRejectedEmail } from "@/lib/server/mail";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireSaasAdminUser();
    const { id } = await context.params;
    const body = await req.json();
    const rejectionReason =
      body.rejectionReason || "Subscription request rejected by admin.";

    if (isFileAdminId(id)) {
      const requestId = fileRequestIdFromAdminId(id);
      const updated = await updateFileSubscriptionRequest(requestId, {
        status: "rejected",
        rejection_reason: rejectionReason,
      });

      try {
        await sendPaymentRejectedEmail({
          to: updated.email,
          ownerName: updated.ownerName,
          schoolName: updated.schoolName,
          requestId: updated.requestId,
          reason: rejectionReason,
        });
      } catch (emailErr) {
        console.warn("[reject] email failed:", emailErr);
      }

      return NextResponse.json({
        success: true,
        message: "Request rejected successfully",
        data: updated,
      });
    }

    const pool = getPool();
    const existing = await getAdminSubscriptionRequest(id);
    const result = await pool.query(
      `UPDATE subscription_requests
       SET status = 'rejected', rejection_reason = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [rejectionReason, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: "Request not found" }, { status: 404 });
    }

    if (existing) {
      try {
        await sendPaymentRejectedEmail({
          to: existing.email,
          ownerName: existing.ownerName,
          schoolName: existing.schoolName,
          requestId: existing.requestId,
          reason: rejectionReason,
        });
      } catch (emailErr) {
        console.warn("[reject] email failed:", emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Request rejected successfully",
      data: result.rows[0],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Rejection failed";
    if (message === "Unauthorized" || message === "Forbidden") {
      return NextResponse.json(
        { success: false, message },
        { status: message === "Forbidden" ? 403 : 401 }
      );
    }
    return NextResponse.json({ success: false, message: "Rejection failed" }, { status: 500 });
  }
}
