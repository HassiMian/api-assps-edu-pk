import path from "path";
import fs from "fs/promises";
import { getPool } from "@/lib/server/db";
import { resolvePlanPrice } from "@/app/apex/apexPlansData";

const FILE_PREFIX = "file-";

export type AdminSubscriptionRequest = {
  id: string;
  requestId: string;
  planName: string;
  planPrice: number;
  billingCycle: string;
  ownerName: string;
  schoolName: string;
  schoolAddress: string;
  contactNumber: string;
  email: string;
  paymentMethod: string;
  transactionId?: string;
  paymentScreenshotUrl?: string;
  status: "PENDING" | "PAYMENT_CONFIRMED" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
  createdAt: string;
  source: "db" | "file";
};

function mapDbRow(row: Record<string, unknown>): AdminSubscriptionRequest {
  const { planName, planPrice } = resolvePlanPrice(
    String(row.selected_plan || row.plan_name || row.plan_id || ""),
    String(row.billing_cycle || "monthly")
  );
  const status = String(row.status || "pending").toUpperCase();
  return {
    id: String(row.id),
    requestId: String(row.request_id || ""),
    planName,
    planPrice: Number(row.plan_price) || planPrice,
    ownerName: String(row.owner_name || ""),
    schoolName: String(row.school_name || ""),
    schoolAddress: String(row.school_address || ""),
    contactNumber: String(row.contact_number || ""),
    email: String(row.email || ""),
    billingCycle: String(row.billing_cycle || "monthly"),
    paymentMethod: String(row.payment_method || "manual"),
    transactionId: (row.transaction_id as string) || undefined,
    paymentScreenshotUrl: (row.payment_screenshot_url as string) || undefined,
    status: (
      status === "APPROVED" || status === "REJECTED"
        ? status
        : status === "PAYMENT_CONFIRMED"
          ? "PAYMENT_CONFIRMED"
          : "PENDING"
    ) as AdminSubscriptionRequest["status"],
    rejectionReason: (row.rejection_reason as string) || undefined,
    createdAt: row.created_at
      ? new Date(row.created_at as string | Date).toISOString()
      : new Date().toISOString(),
    source: "db",
  };
}

function mapFileRecord(data: Record<string, unknown>): AdminSubscriptionRequest {
  const requestId = String(data.request_id || data.requestId || "");
  const { planName, planPrice } = resolvePlanPrice(
    String(data.plan_name || data.planName || data.plan_id || data.planId || ""),
    String(data.billing_cycle || data.billingCycle || "monthly")
  );
  const status = String(data.status || "pending").toUpperCase();
  return {
    id: `${FILE_PREFIX}${requestId}`,
    requestId,
    planName,
    planPrice: Number(data.plan_price ?? data.planPrice ?? planPrice),
    ownerName: String(data.owner_name || data.ownerName || ""),
    schoolName: String(data.school_name || data.schoolName || ""),
    schoolAddress: String(data.school_address || data.schoolAddress || ""),
    contactNumber: String(data.contact_number || data.contactNumber || ""),
    email: String(data.email || ""),
    billingCycle: String(data.billing_cycle || data.billingCycle || "monthly"),
    paymentMethod: String(data.payment_method || data.paymentMethod || "manual"),
    transactionId: String(data.transaction_id || data.transactionId || "") || undefined,
    paymentScreenshotUrl:
      (data.payment_screenshot_url as string) ||
      (data.paymentScreenshotUrl as string) ||
      undefined,
    status: (
      status === "APPROVED" || status === "REJECTED"
        ? status
        : status === "PAYMENT_CONFIRMED"
          ? "PAYMENT_CONFIRMED"
          : "PENDING"
    ) as AdminSubscriptionRequest["status"],
    rejectionReason: (data.rejection_reason as string) || undefined,
    createdAt: String(data.created_at || data.createdAt || new Date().toISOString()),
    source: "file",
  };
}

async function listFileRequests(): Promise<AdminSubscriptionRequest[]> {
  const dir = path.join(process.cwd(), "data", "subscription-requests");
  try {
    const files = await fs.readdir(dir);
    const items: AdminSubscriptionRequest[] = [];
    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      try {
        const raw = await fs.readFile(path.join(dir, file), "utf8");
        items.push(mapFileRecord(JSON.parse(raw) as Record<string, unknown>));
      } catch {
        // skip corrupt file
      }
    }
    return items;
  } catch {
    return [];
  }
}

function matchesStatus(item: AdminSubscriptionRequest, statusParam?: string | null) {
  if (!statusParam || statusParam === "ALL") return true;
  const wanted = statusParam.toUpperCase();
  if (wanted === "PENDING") {
    return item.status === "PENDING";
  }
  return item.status === wanted;
}

export async function listAdminSubscriptionRequests(statusParam?: string | null) {
  const fileItems = await listFileRequests();
  const fileIds = new Set(fileItems.map((f) => f.requestId));
  let dbItems: AdminSubscriptionRequest[] = [];

  try {
    const pool = getPool();
    let queryText = "SELECT * FROM subscription_requests";
    const params: string[] = [];
    if (statusParam && statusParam !== "ALL") {
      if (statusParam.toUpperCase() === "PENDING") {
        queryText += " WHERE LOWER(status) = 'pending'";
      } else {
        queryText += " WHERE LOWER(status) = LOWER($1)";
        params.push(statusParam);
      }
    }
    queryText += " ORDER BY created_at DESC";
    const result = await pool.query(queryText, params);
    dbItems = result.rows
      .map((row: Record<string, unknown>) => mapDbRow(row))
      .filter((row) => !fileIds.has(row.requestId));
  } catch {
    // DB unavailable — file items only
  }

  const merged = [...dbItems, ...fileItems]
    .filter((item) => matchesStatus(item, statusParam))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return merged;
}

export function isFileAdminId(id: string) {
  return id.startsWith(FILE_PREFIX);
}

export function fileRequestIdFromAdminId(id: string) {
  return id.replace(FILE_PREFIX, "");
}

export async function getAdminSubscriptionRequest(id: string) {
  if (isFileAdminId(id)) {
    const requestId = fileRequestIdFromAdminId(id);
    const filePath = path.join(process.cwd(), "data", "subscription-requests", `${requestId}.json`);
    try {
      const raw = await fs.readFile(filePath, "utf8");
      return mapFileRecord(JSON.parse(raw) as Record<string, unknown>);
    } catch {
      return null;
    }
  }

  try {
    const pool = getPool();
    const result = await pool.query(
      "SELECT * FROM subscription_requests WHERE id = $1 LIMIT 1",
      [id]
    );
    if (result.rows.length === 0) return null;
    return mapDbRow(result.rows[0]);
  } catch {
    return null;
  }
}

export async function updateFileSubscriptionRequest(
  requestId: string,
  patch: Record<string, unknown>
) {
  const filePath = path.join(process.cwd(), "data", "subscription-requests", `${requestId}.json`);
  const raw = await fs.readFile(filePath, "utf8");
  const data = JSON.parse(raw) as Record<string, unknown>;
  const next = { ...data, ...patch, updated_at: new Date().toISOString() };
  await fs.writeFile(filePath, JSON.stringify(next, null, 2), "utf8");
  return mapFileRecord(next);
}

export async function persistFileRequestToDatabase(requestId: string) {
  const filePath = path.join(process.cwd(), "data", "subscription-requests", `${requestId}.json`);
  const raw = await fs.readFile(filePath, "utf8");
  const data = JSON.parse(raw) as Record<string, unknown>;

  const pool = getPool();
  const existing = await pool.query(
    "SELECT id FROM subscription_requests WHERE request_id = $1 LIMIT 1",
    [requestId]
  );
  if (existing.rows.length > 0) {
    return String(existing.rows[0].id);
  }

  const result = await pool.query(
    `INSERT INTO subscription_requests (
       request_id, plan_id, plan_name, plan_price,
       owner_name, school_name, school_address, contact_number,
       email, city, selected_plan, billing_cycle, payment_method,
       transaction_id, payment_screenshot_url, status
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
     RETURNING id`,
    [
      requestId,
      data.plan_id || data.planId || "professional",
      data.plan_name || data.planName || "Professional Plan",
      Number(data.plan_price ?? data.planPrice ?? 0),
      data.owner_name || data.ownerName,
      data.school_name || data.schoolName,
      data.school_address || data.schoolAddress || "",
      data.contact_number || data.contactNumber || "",
      String(data.email || "").toLowerCase().trim(),
      data.city || "",
      data.plan_name || data.planName || data.selected_plan || "Professional Plan",
      data.billing_cycle || data.billingCycle || "monthly",
      data.payment_method || data.paymentMethod || "manual",
      data.transaction_id || data.transactionId || requestId,
      data.payment_screenshot_url || data.paymentScreenshotUrl || null,
      data.status || "pending",
    ]
  );

  return String(result.rows[0].id);
}
