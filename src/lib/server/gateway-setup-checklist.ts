import { bankDetailsReady } from "@/lib/server/bank-details";
import { easypaisaReady } from "@/lib/server/easypaisa-gateway";
import { stripeReady } from "@/lib/server/stripe-gateway";
import { isAutoApproveGatewayEnabled } from "@/lib/server/subscription-request-approve";

type GatewayCheck = {
  ready: boolean;
  missing: string[];
  notes?: string[];
};

function missingKeys(keys: string[]) {
  return keys.filter((key) => !process.env[key]?.trim());
}

function jazzcashReady() {
  return (
    missingKeys([
      "JAZZCASH_MERCHANT_ID",
      "JAZZCASH_PASSWORD",
      "JAZZCASH_INTEGRITY_SALT",
    ]).length === 0
  );
}

export function getGatewaySetupChecklist() {
  const jazzcash: GatewayCheck = {
    ready: jazzcashReady(),
    missing: missingKeys([
      "JAZZCASH_MERCHANT_ID",
      "JAZZCASH_PASSWORD",
      "JAZZCASH_INTEGRITY_SALT",
    ]),
    notes: ["Set JAZZCASH_RETURN_URL to /api/payment/jazzcash/callback"],
  };

  const easypaisa: GatewayCheck = {
    ready: easypaisaReady(),
    missing: missingKeys(["EASYPAISA_STORE_ID", "EASYPAISA_HASH_KEY"]),
    notes: ["Set EASYPAISA_RETURN_URL to /api/payment/easypaisa/callback"],
  };

  const stripe: GatewayCheck = {
    ready: stripeReady(),
    missing: missingKeys(["STRIPE_SECRET_KEY"]),
    notes: [
      "Add STRIPE_WEBHOOK_SECRET for /api/payment/stripe/webhook",
      "Event: checkout.session.completed",
    ],
  };

  const bankReady = bankDetailsReady();
  const bank: GatewayCheck = {
    ready: bankReady,
    missing: bankReady ? [] : ["APEX_BANK_ACCOUNT or APEX_BANK_IBAN"],
    notes: ["Set APEX_BANK_ACCOUNT or APEX_BANK_IBAN on the VPS .env"],
  };

  const smtpMissing = missingKeys(["SMTP_HOST", "SMTP_USER", "SMTP_PASS"]);
  const smtp: GatewayCheck = {
    ready: smtpMissing.length === 0,
    missing: smtpMissing,
    notes: ["Required for payment + credential emails"],
  };

  const database: GatewayCheck = {
    ready: Boolean(process.env.DATABASE_URL?.trim()),
    missing: process.env.DATABASE_URL?.trim() ? [] : ["DATABASE_URL"],
    notes: ["Without DB, requests fall back to file storage"],
  };

  return {
    jazzcash,
    easypaisa,
    stripe,
    bank,
    smtp,
    database,
    autoApproveGatewayPayments: isAutoApproveGatewayEnabled(),
    paymentsNotifyEmail: Boolean(process.env.APEX_PAYMENTS_NOTIFY_EMAIL?.trim()),
  };
}
