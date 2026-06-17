import { bankDetailsReady } from "@/lib/server/bank-details";
import { easypaisaReady } from "@/lib/server/easypaisa-gateway";
import { stripeReady } from "@/lib/server/stripe-gateway";

function apexBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APEX_URL?.trim() ||
    process.env.APEX_PUBLIC_URL?.trim() ||
    "https://apex.assps.edu.pk"
  ).replace(/\/$/, "");
}

function jazzcashConfigured() {
  return Boolean(
    process.env.JAZZCASH_MERCHANT_ID?.trim() &&
      process.env.JAZZCASH_PASSWORD?.trim() &&
      process.env.JAZZCASH_INTEGRITY_SALT?.trim()
  );
}

export function getGatewaySandboxGuide() {
  const base = apexBaseUrl();
  const jazzEnv = (process.env.JAZZCASH_ENV || "sandbox").toLowerCase();
  const easypaisaEnv = (process.env.EASYPAISA_ENV || "sandbox").toLowerCase();

  return {
    baseUrl: base,
    jazzcash: {
      configured: jazzcashConfigured(),
      env: jazzEnv,
      callbackUrl: `${base}/api/payment/jazzcash/callback`,
      steps: [
        "Add JAZZCASH_MERCHANT_ID, JAZZCASH_PASSWORD, JAZZCASH_INTEGRITY_SALT to VPS .env",
        "Set JAZZCASH_RETURN_URL to the callback URL above",
        "Use sandbox credentials from JazzCash merchant portal",
        "Run a test checkout — request should reach payment_confirmed",
      ],
      sandboxHints:
        jazzEnv === "sandbox"
          ? [
              "JazzCash sandbox success code: 000",
              "Use test mobile wallet from JazzCash sandbox docs",
            ]
          : [],
    },
    easypaisa: {
      configured: easypaisaReady(),
      env: easypaisaEnv,
      callbackUrl: `${base}/api/payment/easypaisa/callback`,
      steps: [
        "Add EASYPAISA_STORE_ID and EASYPAISA_HASH_KEY to VPS .env",
        "Set EASYPAISA_RETURN_URL to the callback URL above",
        "Sandbox endpoint: easypaystg.easypaisa.com.pk",
        "Confirm callback marks subscription as payment_confirmed",
      ],
      sandboxHints:
        easypaisaEnv === "sandbox"
          ? ["EasyPaisa staging wallet — use merchant test credentials"]
          : [],
    },
    stripe: {
      configured: stripeReady(),
      returnUrl: `${base}/api/payment/stripe/return`,
      webhookUrl: `${base}/api/payment/stripe/webhook`,
      steps: [
        "Add STRIPE_SECRET_KEY (test key sk_test_… for sandbox)",
        "Add STRIPE_WEBHOOK_SECRET for checkout.session.completed",
        "Use Stripe test card 4242 4242 4242 4242",
      ],
    },
    bank: {
      configured: bankDetailsReady(),
      steps: ["Set APEX_BANK_ACCOUNT or APEX_BANK_IBAN on VPS .env"],
    },
    manualFallback:
      "Until gateways are configured, checkout uses screenshot verification at /apex/checkout",
  };
}
