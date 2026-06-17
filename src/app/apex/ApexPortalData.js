export { APEX_PLANS as apexPlans, getPlanById, getPlanPrice, formatPlanPrice, getCheckoutHref } from "./apexPlans";

export const paymentMethods = [
  "JazzCash",
  "EasyPaisa",
  "Bank Transfer",
  "Debit/Credit Card",
  "Manual Payment Proof",
];

export const tenantActivationSteps = [
  "School submits onboarding profile",
  "School tenant is created as pending",
  "Subscription plan and billing cycle are selected",
  "Payment proof is submitted for verification",
  "Super Admin approves or rejects payment",
  "Subscription status becomes active",
  "School admin credentials are generated",
  "Users log in only inside their tenant",
];

export const backendReadyModels = {
  schools: ["id", "tenantId", "name", "city", "status", "trialStatus", "createdAt"],
  subscriptions: ["id", "tenantId", "planId", "billingCycle", "status", "startsAt", "expiresAt"],
  payments: ["id", "tenantId", "subscriptionId", "method", "amount", "transactionId", "proofUrl", "status"],
  invoices: ["id", "tenantId", "paymentId", "invoiceNumber", "amount", "issuedAt"],
  tenantUsers: ["id", "tenantId", "role", "email", "status"],
};
