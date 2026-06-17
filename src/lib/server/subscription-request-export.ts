import { listAdminSubscriptionRequests } from "@/lib/server/subscription-request-admin";
import { formatPaymentMethodLabel } from "@/lib/payment-method-labels";

function escapeCsv(value: unknown) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export async function buildSubscriptionRequestsCsv(statusParam: string | null) {
  const requests = await listAdminSubscriptionRequests(statusParam);
  const headers = [
    "Request ID",
    "Status",
    "School",
    "Owner",
    "Email",
    "Contact",
    "Plan",
    "Price PKR",
    "Billing",
    "Payment Method",
    "Transaction ID",
    "Created",
    "Source",
  ];

  const rows = requests.map((item) =>
    [
      item.requestId,
      item.status,
      item.schoolName,
      item.ownerName,
      item.email,
      item.contactNumber,
      item.planName,
      item.planPrice,
      item.billingCycle,
      formatPaymentMethodLabel(item.paymentMethod),
      item.transactionId || "",
      item.createdAt,
      item.source,
    ]
      .map(escapeCsv)
      .join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}
