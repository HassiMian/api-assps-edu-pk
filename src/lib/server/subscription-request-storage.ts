import path from "path";
import fs from "fs/promises";
import { v4 as uuid } from "uuid";
import { getPool } from "./db";

let schemaReady: Promise<void> | null = null;

async function ensureSubscriptionRequestColumns() {
  if (!schemaReady) {
    schemaReady = getPool()
      .query(`
      ALTER TABLE subscription_requests ADD COLUMN IF NOT EXISTS plan_id VARCHAR(80);
      ALTER TABLE subscription_requests ADD COLUMN IF NOT EXISTS plan_name VARCHAR(100);
      ALTER TABLE subscription_requests ADD COLUMN IF NOT EXISTS plan_price INTEGER;
    `)
      .then(() => undefined);
  }
  return schemaReady;
}

function createRequestId() {
  return `REQ-${uuid().slice(0, 4).toUpperCase()}-${uuid().slice(0, 4).toUpperCase()}`;
}

export type SubscriptionRequestInput = {
  planId: string;
  planName: string;
  planPrice: number;
  ownerName: string;
  schoolName: string;
  schoolAddress: string;
  contactNumber: string;
  email: string;
  city?: string;
  billingCycle?: string;
  paymentMethod?: string;
  transactionId?: string;
  paymentScreenshotUrl?: string;
};

async function saveRequestToFile(payload: SubscriptionRequestInput & { request_id: string }) {
  const dir = path.join(process.cwd(), "data", "subscription-requests");
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, `${payload.request_id}.json`);
  const record = {
    ...payload,
    status: "pending",
    created_at: new Date().toISOString(),
    storage: "file",
  };
  await fs.writeFile(filePath, JSON.stringify(record, null, 2), "utf8");
  return record;
}

export async function createSubscriptionRequest(input: SubscriptionRequestInput) {
  const requestId = createRequestId();
  const billingCycle = (input.billingCycle || "monthly").toLowerCase();
  const paymentMethod = input.paymentMethod || "manual";
  const transactionId = input.transactionId || requestId;
  const city = input.city || "";

  try {
    await ensureSubscriptionRequestColumns();

    const result = await getPool().query(
      `INSERT INTO subscription_requests (
         request_id, plan_id, plan_name, plan_price,
         owner_name, school_name, school_address, contact_number,
         email, city, selected_plan, billing_cycle, payment_method,
         transaction_id, payment_screenshot_url, status
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'pending')
       RETURNING *`,
      [
        requestId,
        input.planId,
        input.planName,
        Math.round(input.planPrice),
        input.ownerName,
        input.schoolName,
        input.schoolAddress,
        input.contactNumber,
        input.email.toLowerCase().trim(),
        city,
        input.planName,
        billingCycle,
        paymentMethod,
        transactionId,
        input.paymentScreenshotUrl || null,
      ]
    );

    return result.rows[0];
  } catch (dbError) {
    console.warn("[subscription] DB unavailable, using file fallback:", dbError);
    return saveRequestToFile({
      ...input,
      request_id: requestId,
      billingCycle,
      paymentMethod,
      transactionId,
      city,
    });
  }
}

export type JazzCashPaymentPatch = {
  status: "payment_confirmed" | "payment_failed";
  transactionId?: string;
  gatewayResponseCode?: string;
  gatewayResponseMessage?: string;
  gatewayAuthCode?: string;
  gatewayRetrievalRef?: string;
};

async function updateFileRequestPayment(requestId: string, patch: JazzCashPaymentPatch) {
  const filePath = path.join(process.cwd(), "data", "subscription-requests", `${requestId}.json`);
  const raw = await fs.readFile(filePath, "utf8");
  const data = JSON.parse(raw) as Record<string, unknown>;
  const next = {
    ...data,
    status: patch.status,
    transaction_id: patch.transactionId || data.transaction_id || data.transactionId,
    gateway_response_code: patch.gatewayResponseCode,
    gateway_response_message: patch.gatewayResponseMessage,
    gateway_auth_code: patch.gatewayAuthCode,
    gateway_retrieval_ref: patch.gatewayRetrievalRef,
    payment_confirmed_at:
      patch.status === "payment_confirmed" ? new Date().toISOString() : data.payment_confirmed_at,
    updated_at: new Date().toISOString(),
  };
  await fs.writeFile(filePath, JSON.stringify(next, null, 2), "utf8");
  return next;
}

export async function applyGatewayPaymentResult(
  requestId: string,
  patch: JazzCashPaymentPatch
) {
  const id = String(requestId || "").trim();
  if (!id) throw new Error("Request ID is required");

  try {
    const result = await getPool().query(
      `UPDATE subscription_requests
       SET status = $2,
           transaction_id = COALESCE($3, transaction_id),
           updated_at = NOW()
       WHERE request_id = $1
       RETURNING *`,
      [id, patch.status, patch.transactionId || null]
    );
    if (result.rows.length > 0) {
      return result.rows[0];
    }
  } catch (dbError) {
    console.warn("[subscription] DB payment update failed, trying file:", dbError);
  }

  return updateFileRequestPayment(id, patch);
}

/** @deprecated Use applyGatewayPaymentResult */
export const applyJazzCashPaymentResult = applyGatewayPaymentResult;
