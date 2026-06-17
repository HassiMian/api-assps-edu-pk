import { getPool } from "@/lib/server/db";
import { generateTemporaryPassword, hashPassword } from "@/lib/server/credentials";
import { sendSchoolCredentialsEmail } from "@/lib/server/mail";
import { persistFileRequestToDatabase } from "@/lib/server/subscription-request-admin";

export type ApproveSubscriptionResult = {
  success: boolean;
  message: string;
  tenantId?: string;
  adminEmail?: string;
  temporaryPassword?: string;
  emailSent?: boolean;
};

export function isAutoApproveGatewayEnabled() {
  return process.env.APEX_AUTO_APPROVE_GATEWAY_PAYMENTS?.trim().toLowerCase() === "true";
}

function resolvePlanAmount(request: Record<string, unknown>) {
  const stored = Number(request.plan_price ?? 0);
  if (stored > 0) return stored;

  const cycle = String(request.billing_cycle || "").toLowerCase();
  const plan = String(request.selected_plan || request.plan_name || "").toLowerCase();

  if (plan.includes("starter")) {
    return cycle === "yearly" ? 49990 : 4999;
  }
  if (plan.includes("professional") || plan.includes("pro")) {
    return cycle === "yearly" ? 99990 : 9999;
  }
  return 0;
}

export async function approveSubscriptionRequestByDbId(
  dbId: string
): Promise<ApproveSubscriptionResult> {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const requestRes = await client.query(
      "SELECT * FROM subscription_requests WHERE id = $1 LIMIT 1",
      [dbId]
    );

    if (requestRes.rows.length === 0) {
      return { success: false, message: "Request not found" };
    }

    const request = requestRes.rows[0];
    const normalizedStatus = String(request.status || "").toLowerCase();

    if (normalizedStatus === "approved") {
      return { success: false, message: "Request already approved" };
    }

    const tempPassword = generateTemporaryPassword();
    const hashedPassword = await hashPassword(tempPassword);

    await client.query("BEGIN");

    const baseSlug = String(request.school_name || "school")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    let tenantId = baseSlug || "school";
    let uniqueNum = 1000;

    while (true) {
      const checkRes = await client.query(
        "SELECT id FROM schools WHERE code = $1 LIMIT 1",
        [tenantId]
      );
      if (checkRes.rows.length === 0) break;
      tenantId = `${baseSlug}-${uniqueNum}`;
      uniqueNum++;
    }

    const startDate = new Date();
    const endDate = new Date();
    const cycle = String(request.billing_cycle || "").toLowerCase();

    if (cycle === "yearly") {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const amount = resolvePlanAmount(request);

    const schoolInsert = await client.query(
      `INSERT INTO schools (
        name, code, tenant_id, school_name, address, owner_name, email, phone,
        logo_url, branding, status, subscription_plan, subscription_status,
        subscription_start_date, subscription_end_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active', $11, 'active', $12, $13)
      RETURNING id`,
      [
        request.school_name,
        tenantId,
        tenantId,
        request.school_name,
        request.school_address || "",
        request.owner_name,
        request.email,
        request.contact_number || "",
        request.payment_screenshot_url || "",
        "{}",
        request.selected_plan,
        startDate,
        endDate,
      ]
    );

    const schoolId = schoolInsert.rows[0].id;

    await client.query(
      `INSERT INTO settings (
        school_id, school_name, school_address, school_phone, school_email, principal_name, branding_config
      ) VALUES ($1, $2, $3, $4, $5, $6, '{}'::jsonb)`,
      [
        schoolId,
        request.school_name,
        request.school_address || "",
        request.contact_number || "",
        request.email,
        request.owner_name,
      ]
    );

    let adminEmail = String(request.email).toLowerCase().trim();
    const checkUserEmail = await client.query(
      "SELECT id FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1",
      [adminEmail]
    );
    if (checkUserEmail.rows.length > 0) {
      const domain = adminEmail.split("@")[1] || "apex.com";
      adminEmail = `admin+${tenantId}@${domain}`;
    }

    const username = adminEmail.split("@")[0];

    const userInsert = await client.query(
      `INSERT INTO users (
        school_id, tenant_id, name, email, password, role, designation, is_active, username, permissions, must_change_password
      ) VALUES ($1, $2, $3, $4, $5, 'school_admin', 'Principal', true, $6, '[]'::jsonb, true)
      RETURNING id`,
      [schoolId, tenantId, request.owner_name, adminEmail, hashedPassword, username]
    );

    const userId = userInsert.rows[0].id;

    await client.query(
      `UPDATE subscription_requests
       SET status = 'approved',
           tenant_id = $2,
           approved_at = NOW(),
           created_school_id = $3,
           created_admin_user_id = $4,
           updated_at = NOW()
       WHERE id = $1`,
      [dbId, tenantId, schoolId, userId]
    );

    const invoiceNumber = `INV-${tenantId.toUpperCase()}-${Date.now()}`;
    await client.query(
      `INSERT INTO invoices (tenant_id, invoice_number, amount, plan, status)
       VALUES ($1, $2, $3, $4, 'paid')`,
      [tenantId, invoiceNumber, amount, request.selected_plan]
    );

    await client.query(
      `INSERT INTO payments (tenant_id, request_id, transaction_id, payment_method, amount, screenshot_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'verified')`,
      [
        tenantId,
        request.request_id || String(request.id),
        request.transaction_id || null,
        request.payment_method,
        amount,
        request.payment_screenshot_url || null,
      ]
    );

    await client.query("COMMIT");

    let emailSent = true;
    try {
      await sendSchoolCredentialsEmail({
        to: request.email,
        schoolName: request.school_name,
        ownerName: request.owner_name,
        email: adminEmail,
        password: tempPassword,
      });
    } catch (emailErr) {
      console.error("[approve] credentials email failed:", emailErr);
      emailSent = false;
    }

    return {
      success: true,
      message: emailSent
        ? "Request approved and credentials emailed successfully"
        : "Request approved, but email sending failed",
      tenantId,
      adminEmail,
      temporaryPassword: tempPassword,
      emailSent,
    };
  } catch (error: unknown) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // ignore rollback errors
    }
    const message = error instanceof Error ? error.message : "Approval failed";
    console.error("[approve] transaction error:", message);
    return { success: false, message };
  } finally {
    client.release();
  }
}

async function resolveDbIdForRequestId(requestId: string): Promise<string | null> {
  try {
    const pool = getPool();
    const existing = await pool.query(
      "SELECT id FROM subscription_requests WHERE request_id = $1 LIMIT 1",
      [requestId]
    );
    if (existing.rows.length > 0) {
      return String(existing.rows[0].id);
    }
    return await persistFileRequestToDatabase(requestId);
  } catch {
    return null;
  }
}

export async function maybeAutoApproveGatewayPayment(
  requestId: string
): Promise<ApproveSubscriptionResult & { approved: boolean }> {
  if (!isAutoApproveGatewayEnabled()) {
    return { approved: false, success: false, message: "Auto-approve disabled" };
  }

  const dbId = await resolveDbIdForRequestId(requestId);
  if (!dbId) {
    return { approved: false, success: false, message: "Database unavailable for auto-approve" };
  }

  try {
    const pool = getPool();
    const statusRes = await pool.query(
      "SELECT status FROM subscription_requests WHERE id = $1 LIMIT 1",
      [dbId]
    );
    const status = String(statusRes.rows[0]?.status || "").toLowerCase();
    if (status !== "payment_confirmed") {
      return {
        approved: false,
        success: false,
        message: `Auto-approve skipped (status: ${status || "unknown"})`,
      };
    }
  } catch {
    return { approved: false, success: false, message: "Could not verify request status" };
  }

  const result = await approveSubscriptionRequestByDbId(dbId);
  return { ...result, approved: result.success };
}
