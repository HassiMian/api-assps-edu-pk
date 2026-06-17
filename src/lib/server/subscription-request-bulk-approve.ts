import {
  fileRequestIdFromAdminId,
  isFileAdminId,
  listAdminSubscriptionRequests,
  persistFileRequestToDatabase,
} from "@/lib/server/subscription-request-admin";
import { approveSubscriptionRequestByDbId } from "@/lib/server/subscription-request-approve";

export async function bulkApprovePaymentConfirmedRequests() {
  const confirmed = await listAdminSubscriptionRequests("PAYMENT_CONFIRMED");
  const results: Array<{
    requestId: string;
    schoolName: string;
    success: boolean;
    message: string;
    tenantId?: string;
    adminEmail?: string;
  }> = [];

  for (const item of confirmed) {
    try {
      let dbId = item.id;
      if (isFileAdminId(dbId)) {
        const persisted = await persistFileRequestToDatabase(fileRequestIdFromAdminId(dbId));
        dbId = persisted;
      }

      const result = await approveSubscriptionRequestByDbId(dbId);
      results.push({
        requestId: item.requestId,
        schoolName: item.schoolName,
        success: result.success,
        message: result.message,
        tenantId: result.tenantId,
        adminEmail: result.adminEmail,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Approval failed";
      results.push({
        requestId: item.requestId,
        schoolName: item.schoolName,
        success: false,
        message,
      });
    }
  }

  const approved = results.filter((item) => item.success).length;
  const failed = results.length - approved;

  return {
    total: results.length,
    approved,
    failed,
    results,
  };
}
