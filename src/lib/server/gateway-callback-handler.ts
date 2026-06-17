import { applyGatewayPaymentResult, JazzCashPaymentPatch } from "@/lib/server/subscription-request-storage";
import { getSubscriptionRequestById } from "@/lib/server/subscription-request-lookup";
import { notifyPaymentConfirmed } from "@/lib/server/mail";
import { maybeAutoApproveGatewayPayment } from "@/lib/server/subscription-request-approve";

function apexBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APEX_URL?.trim() ||
    process.env.APEX_PUBLIC_URL?.trim() ||
    "https://apex.assps.edu.pk"
  ).replace(/\/$/, "");
}

export function gatewayFailureRedirectUrl(requestId: string) {
  const id = encodeURIComponent(requestId);
  return `${apexBaseUrl()}/apex/payment-failed?requestId=${id}`;
}

export function gatewaySuccessRedirectUrl(requestId: string, autoApproved: boolean) {
  const id = encodeURIComponent(requestId);
  if (autoApproved) {
    return `${apexBaseUrl()}/apex/payment-success?requestId=${id}&activated=1`;
  }
  return `${apexBaseUrl()}/apex/payment-pending?requestId=${id}&gateway=confirmed`;
}

function isConfirmedPaymentStatus(status: string) {
  const normalized = status.toLowerCase();
  return normalized === "payment_confirmed" || normalized === "approved";
}

export async function finalizeGatewayPaymentSuccess({
  requestId,
  gateway,
  transactionId,
  patch,
}: {
  requestId: string;
  gateway: string;
  transactionId?: string;
  patch: JazzCashPaymentPatch;
}) {
  const existing = await getSubscriptionRequestById(requestId);
  if (existing && isConfirmedPaymentStatus(existing.status)) {
    return gatewaySuccessRedirectUrl(requestId, existing.status === "approved");
  }

  await applyGatewayPaymentResult(requestId, patch);

  const request = await getSubscriptionRequestById(requestId);
  if (request) {
    try {
      await notifyPaymentConfirmed({
        requestId,
        ownerName: request.ownerName,
        schoolName: request.schoolName,
        email: request.email,
        planName: request.planName,
        amount: request.planPrice,
        gateway,
        transactionId,
      });
    } catch {
      // non-blocking
    }
  }

  const auto = await maybeAutoApproveGatewayPayment(requestId);
  return gatewaySuccessRedirectUrl(requestId, auto.approved);
}
