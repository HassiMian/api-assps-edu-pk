import { signEasyPaisaRequest, verifyEasyPaisaResponse } from "./easypaisa-signature";

function apexBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APEX_URL?.trim() ||
    process.env.APEX_PUBLIC_URL?.trim() ||
    "https://apex.assps.edu.pk"
  ).replace(/\/$/, "");
}

function easypaisaEndpoint() {
  if (process.env.EASYPAISA_ENDPOINT?.trim()) {
    return process.env.EASYPAISA_ENDPOINT.trim();
  }
  const env = (process.env.EASYPAISA_ENV || "sandbox").toLowerCase();
  return env === "production"
    ? "https://easypaisa.com.pk/easypay/Index.jsf"
    : "https://easypaystg.easypaisa.com.pk/easypay/Index.jsf";
}

export function easypaisaReady() {
  const storeId = process.env.EASYPAISA_STORE_ID?.trim();
  const hashKey = process.env.EASYPAISA_HASH_KEY?.trim();
  return Boolean(storeId && hashKey);
}

export function easypaisaSuccessStatuses() {
  const raw = process.env.EASYPAISA_SUCCESS_STATUS?.trim() || "0000,SUCCESS,PAID";
  return raw.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);
}

export function buildEasyPaisaCheckout({
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
  const storeId = process.env.EASYPAISA_STORE_ID?.trim();
  const hashKey = process.env.EASYPAISA_HASH_KEY?.trim();
  if (!storeId || !hashKey) return null;

  const postBackURL =
    process.env.EASYPAISA_RETURN_URL?.trim() ||
    `${apexBaseUrl()}/api/payment/easypaisa/callback`;

  const orderRefNum = requestId.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 20);
  const amountStr = Number(amount).toFixed(2);
  const transactionType = process.env.EASYPAISA_TRANSACTION_TYPE?.trim() || "MA";

  const merchantHashedReq = signEasyPaisaRequest(
    {
      amount: amountStr,
      postBackURL,
      orderRefNum,
      storeId,
      transactionType,
    },
    hashKey
  );

  const fields: Record<string, string> = {
    storeId,
    orderRefNum,
    amount: amountStr,
    postBackURL,
    emailAddr: email.slice(0, 80),
    mobileNum: phone.replace(/\D/g, "").slice(0, 15),
    paymentMethod: process.env.EASYPAISA_PAYMENT_METHOD?.trim() || "MA_PAYMENT_METHOD",
    merchantHashedReq,
    autoRedirect: "1",
  };

  return {
    endpoint: easypaisaEndpoint(),
    fields,
  };
}

export async function parseEasyPaisaCallbackFields(req: Request): Promise<Record<string, string>> {
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

export function verifyEasyPaisaCallback(fields: Record<string, string>) {
  const hashKey = process.env.EASYPAISA_HASH_KEY?.trim();
  const skipVerify = process.env.EASYPAISA_SKIP_HASH_VERIFY === "true";

  if (skipVerify) {
    return { valid: true, reason: "" };
  }

  if (!hashKey) {
    return { valid: false, reason: "Easypaisa hash key is not configured" };
  }

  return verifyEasyPaisaResponse(fields, hashKey);
}

export function interpretEasyPaisaCallback(fields: Record<string, string>) {
  const requestId = String(fields.orderRefNum || "").trim();
  const status = String(fields.status || fields.responseCode || "").trim();
  const responseMessage = String(fields.responseMessage || fields.description || "").trim();
  const transactionId = String(fields.transactionId || fields.txnRefNo || "").trim();
  const amount = Number(fields.amount || fields.transactionAmount || 0);
  const success = easypaisaSuccessStatuses().includes(status.toUpperCase());

  return {
    requestId,
    status,
    responseMessage,
    transactionId,
    amount,
    success,
  };
}

export function easypaisaRedirectUrl(requestId: string, success: boolean) {
  const base = apexBaseUrl();
  const id = encodeURIComponent(requestId);
  if (success) {
    return `${base}/apex/payment-pending?requestId=${id}&gateway=confirmed`;
  }
  return `${base}/apex/payment-failed?requestId=${id}`;
}
