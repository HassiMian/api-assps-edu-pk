import path from "path";
import fs from "fs/promises";
import { getPool } from "@/lib/server/db";

export type SubscriptionRequestPublic = {
  requestId: string;
  planId: string;
  planName: string;
  planPrice: number;
  billingCycle: string;
  status: string;
  schoolName: string;
  ownerName: string;
  email: string;
  createdAt: string;
};

function normalizeRow(row: Record<string, unknown>): SubscriptionRequestPublic {
  return {
    requestId: String(row.request_id || row.requestId || ""),
    planId: String(row.plan_id || row.planId || "professional"),
    planName: String(row.plan_name || row.planName || row.selected_plan || "Professional"),
    planPrice: Number(row.plan_price ?? row.planPrice ?? 0),
    billingCycle: String(row.billing_cycle || row.billingCycle || "monthly"),
    status: String(row.status || "pending").toLowerCase(),
    schoolName: String(row.school_name || row.schoolName || ""),
    ownerName: String(row.owner_name || row.ownerName || ""),
    email: String(row.email || ""),
    createdAt: String(row.created_at || row.createdAt || new Date().toISOString()),
  };
}

async function readFileFallback(requestId: string) {
  const filePath = path.join(process.cwd(), "data", "subscription-requests", `${requestId}.json`);
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(raw) as Record<string, unknown>;
    return normalizeRow(data);
  } catch {
    return null;
  }
}

export async function getSubscriptionRequestById(
  requestId: string
): Promise<SubscriptionRequestPublic | null> {
  const id = String(requestId || "").trim();
  if (!id) return null;

  try {
    const pool = getPool();
    const result = await pool.query(
      "SELECT * FROM subscription_requests WHERE request_id = $1 LIMIT 1",
      [id]
    );
    if (result.rows.length > 0) {
      return normalizeRow(result.rows[0]);
    }
  } catch {
    // fall through to file storage
  }

  return readFileFallback(id);
}
