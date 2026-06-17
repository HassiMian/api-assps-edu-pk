import { signJazzCashFields, verifyJazzCashFields } from "./jazzcash-signature";
import { easypaisaReady } from "./easypaisa-gateway";
import { stripeReady } from "./stripe-gateway";
import { bankDetailsReady } from "./bank-details";

export type PaymentGatewayMode = "manual" | "jazzcash" | "easypaisa" | "stripe";

function jazzcashEndpoint() {
  const env = (process.env.JAZZCASH_ENV || "sandbox").toLowerCase();
  if (process.env.JAZZCASH_ENDPOINT?.trim()) {
    return process.env.JAZZCASH_ENDPOINT.trim();
  }
  return env === "production"
    ? "https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform"
    : "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform";
}

function formatTxnDateTime(date = new Date()) {
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}${p(date.getMonth() + 1)}${p(date.getDate())}` +
    `${p(date.getHours())}${p(date.getMinutes())}${p(date.getSeconds())}`
  );
}

export function getPaymentGatewayStatus() {
  const jazzMerchant = process.env.JAZZCASH_MERCHANT_ID?.trim();
  const jazzPassword = process.env.JAZZCASH_PASSWORD?.trim();
  const jazzIntegrity = process.env.JAZZCASH_INTEGRITY_SALT?.trim();

  const jazzcashReady = Boolean(jazzMerchant && jazzPassword && jazzIntegrity);
  const easypaisaLive = easypaisaReady();
  const stripeLive = stripeReady();
  const bankReady = bankDetailsReady();

  const mode: PaymentGatewayMode = jazzcashReady
    ? "jazzcash"
    : easypaisaLive
      ? "easypaisa"
      : stripeLive
        ? "stripe"
        : "manual";

  const liveGateways = [
    jazzcashReady ? "JazzCash" : null,
    easypaisaLive ? "EasyPaisa" : null,
    stripeLive ? "Card (Stripe)" : null,
  ].filter(Boolean);

  const jazzcashEnv = (process.env.JAZZCASH_ENV || "sandbox").toLowerCase();
  const easypaisaEnv = (process.env.EASYPAISA_ENV || "sandbox").toLowerCase();

  return {
    mode,
    jazzcashReady,
    easypaisaReady: easypaisaLive,
    stripeReady: stripeLive,
    bankDetailsReady: bankReady,
    jazzcashEnv,
    easypaisaEnv,
    jazzcashSandbox: jazzcashReady && jazzcashEnv !== "production",
    easypaisaSandbox: easypaisaLive && easypaisaEnv !== "production",
    manualVerification: true,
    env: jazzcashEnv,
    message:
      liveGateways.length > 0
        ? `Live checkout available: ${liveGateways.join(", ")}.`
        : "Manual screenshot verification is active until gateway credentials are configured.",
  };
}

export function buildJazzCashCheckout({
  amount,
  requestId,
  email,
  phone,
}: {
  amount: number;
  requestId: string;
  email: string;
  phone: string;
}) {
  const merchantId = process.env.JAZZCASH_MERCHANT_ID?.trim();
  const password = process.env.JAZZCASH_PASSWORD?.trim();
  const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT?.trim();
  const returnUrl =
    process.env.JAZZCASH_RETURN_URL?.trim() ||
    `${apexBaseUrl()}/api/payment/jazzcash/callback`;

  if (!merchantId || !password || !integritySalt) {
    return null;
  }

  const now = new Date();
  const expiry = new Date(now.getTime() + 60 * 60 * 1000);

  const fields: Record<string, string> = {
    pp_Version: process.env.JAZZCASH_VERSION?.trim() || "1.1",
    pp_TxnType: "MWALLET",
    pp_Language: process.env.JAZZCASH_LANGUAGE?.trim() || "EN",
    pp_MerchantID: merchantId,
    pp_SubMerchantID: "",
    pp_Password: password,
    pp_BankID: "TBANK",
    pp_ProductID: "RECHARGE",
    pp_TxnRefNo: requestId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 20) || `T${Date.now()}`,
    pp_Amount: String(Math.round(amount * 100)),
    pp_TxnCurrency: process.env.JAZZCASH_CURRENCY?.trim() || "PKR",
    pp_TxnDateTime: formatTxnDateTime(now),
    pp_BillReference: requestId,
    pp_Description: "APEX Education OS Subscription",
    pp_TxnExpiryDateTime: formatTxnDateTime(expiry),
    pp_ReturnURL: returnUrl,
    ppmpf_1: email.slice(0, 50),
    ppmpf_2: phone.replace(/\D/g, "").slice(0, 15),
    ppmpf_3: "",
    ppmpf_4: "",
    ppmpf_5: "",
  };

  fields.pp_SecureHash = signJazzCashFields(fields, integritySalt);

  return {
    endpoint: jazzcashEndpoint(),
    fields,
  };
}

function apexBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APEX_URL?.trim() ||
    process.env.APEX_PUBLIC_URL?.trim() ||
    "https://apex.assps.edu.pk"
  ).replace(/\/$/, "");
}

export function jazzCashSuccessCode() {
  return process.env.JAZZCASH_SUCCESS_CODE?.trim() || "000";
}

export async function parseJazzCashCallbackFields(req: Request): Promise<Record<string, string>> {
  const contentType = req.headers.get("content-type") || "";
  const fields: Record<string, string> = {};

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const formData = await req.formData();
    formData.forEach((value, key) => {
      fields[key] = String(value);
    });
    return fields;
  }

  const url = new URL(req.url);
  url.searchParams.forEach((value, key) => {
    fields[key] = value;
  });
  return fields;
}

export function verifyJazzCashCallback(fields: Record<string, string>) {
  const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT?.trim();
  if (!integritySalt) {
    return { valid: false, reason: "JazzCash integrity salt is not configured" };
  }

  const receivedHash = fields.pp_SecureHash || "";
  if (!verifyJazzCashFields(fields, integritySalt, receivedHash)) {
    return { valid: false, reason: "Invalid JazzCash secure hash" };
  }

  return { valid: true, reason: "" };
}

export function interpretJazzCashCallback(fields: Record<string, string>) {
  const requestId = String(fields.pp_BillReference || "").trim();
  const responseCode = String(fields.pp_ResponseCode || "").trim();
  const responseMessage = String(fields.pp_ResponseMessage || "").trim();
  const txnRefNo = String(fields.pp_TxnRefNo || "").trim();
  const authCode = String(fields.pp_AuthCode || "").trim();
  const retrievalRef = String(fields.pp_RetreivalReferenceNo || fields.pp_RetrievalReferenceNo || "").trim();
  const amountPaisa = Number(fields.pp_Amount || 0);
  const success = responseCode === jazzCashSuccessCode();

  return {
    requestId,
    responseCode,
    responseMessage,
    txnRefNo,
    authCode,
    retrievalRef,
    amountPaisa,
    success,
  };
}

export function jazzCashRedirectUrl(requestId: string, success: boolean) {
  const base = apexBaseUrl();
  const id = encodeURIComponent(requestId);
  if (success) {
    return `${base}/apex/payment-pending?requestId=${id}&gateway=confirmed`;
  }
  return `${base}/apex/payment-failed?requestId=${id}`;
}
