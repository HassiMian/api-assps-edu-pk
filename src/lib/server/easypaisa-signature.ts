import { createHmac } from "crypto";

/** Easypaisa hosted checkout request hash (HMAC-SHA256, base64). */
export function signEasyPaisaRequest(
  {
    amount,
    postBackURL,
    orderRefNum,
    storeId,
    transactionType = "MA",
  }: {
    amount: string;
    postBackURL: string;
    orderRefNum: string;
    storeId: string;
    transactionType?: string;
  },
  hashKey: string
) {
  const message =
    `amount=${amount}` +
    `&postBackURL=${postBackURL}` +
    `&orderRefNum=${orderRefNum}` +
    `&storeId=${storeId}` +
    `&transactionType=${transactionType}`;

  return createHmac("sha256", hashKey).update(message).digest("base64");
}

/** Easypaisa callback response hash verification. */
export function verifyEasyPaisaResponse(
  fields: Record<string, string>,
  hashKey: string
) {
  const received =
    fields.merchantHashedResp || fields.secureHash || fields.responseHash || "";
  if (!received.trim()) {
    return { valid: false, reason: "Missing Easypaisa response hash" };
  }

  const amount = String(fields.amount || fields.transactionAmount || "").trim();
  const orderRefNum = String(fields.orderRefNum || "").trim();
  const paymentMethod = String(fields.paymentMethod || "MA").trim();
  const storeId = String(fields.storeId || "").trim();
  const status = String(fields.status || fields.responseCode || "").trim();
  const transactionId = String(fields.transactionId || fields.txnRefNo || "").trim();
  const transactionDateTime = String(fields.transactionDateTime || fields.txnDateTime || "").trim();

  const message =
    `amount=${amount}` +
    `&orderRefNum=${orderRefNum}` +
    `&paymentMethod=${paymentMethod}` +
    `&storeId=${storeId}` +
    `&status=${status}` +
    `&transactionId=${transactionId}` +
    `&transactionDateTime=${transactionDateTime}`;

  const expected = createHmac("sha256", hashKey).update(message).digest("base64");
  if (expected !== received.trim()) {
    return { valid: false, reason: "Invalid Easypaisa response hash" };
  }

  return { valid: true, reason: "" };
}
