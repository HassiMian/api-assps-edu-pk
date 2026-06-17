import { NextResponse } from "next/server";

const backendReadyModels = {
  schools: ["id", "tenantId", "name", "city", "status", "trialStatus", "createdAt"],
  subscriptions: ["id", "tenantId", "planId", "billingCycle", "status", "startsAt", "expiresAt"],
  payments: ["id", "tenantId", "subscriptionId", "method", "amount", "transactionId", "proofUrl", "status"],
  invoices: ["id", "tenantId", "paymentId", "invoiceNumber", "amount", "issuedAt"],
  tenantUsers: ["id", "tenantId", "role", "email", "status"],
};

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      models: backendReadyModels,
      statuses: ["pending", "active", "expired", "suspended", "rejected"],
      demoTenantPolicy: "Demo data must use a separate dummy tenant and never share tenantId with real schools.",
    },
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  return NextResponse.json({
    success: true,
    message: "Activation request accepted for backend verification wiring.",
    data: {
      tenantId: body.tenantId || "pending_tenant",
      schoolStatus: "pending",
      subscriptionStatus: "pending_verification",
      nextStep: "Super Admin verifies payment and activates school subscription.",
    },
  });
}
