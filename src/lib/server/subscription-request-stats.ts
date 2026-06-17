import { listAdminSubscriptionRequests } from "@/lib/server/subscription-request-admin";

export async function getSubscriptionRequestStats() {
  const all = await listAdminSubscriptionRequests("ALL");

  const stats = {
    total: all.length,
    pending: 0,
    paymentConfirmed: 0,
    approved: 0,
    rejected: 0,
    revenuePendingPkr: 0,
    revenueApprovedPkr: 0,
    byPaymentMethod: {} as Record<string, number>,
  };

  for (const item of all) {
    if (item.status === "PENDING") stats.pending += 1;
    if (item.status === "PAYMENT_CONFIRMED") stats.paymentConfirmed += 1;
    if (item.status === "APPROVED") stats.approved += 1;
    if (item.status === "REJECTED") stats.rejected += 1;

    const method = (item.paymentMethod || "manual").toLowerCase();
    stats.byPaymentMethod[method] = (stats.byPaymentMethod[method] || 0) + 1;

    if (item.status === "PENDING" || item.status === "PAYMENT_CONFIRMED") {
      stats.revenuePendingPkr += item.planPrice || 0;
    }
    if (item.status === "APPROVED") {
      stats.revenueApprovedPkr += item.planPrice || 0;
    }
  }

  return stats;
}
