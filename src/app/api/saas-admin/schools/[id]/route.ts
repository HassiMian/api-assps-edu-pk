import { NextResponse } from "next/server";
import { getPool } from "@/lib/server/db";
import { requireTenantUser } from "@/lib/server/auth-user";

export const dynamic = "force-dynamic";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireTenantUser();
    if (user.role !== "SAAS_ADMIN" && user.role !== "super_admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Access restricted to SaaS Administrators." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    const {
      school_name,
      owner_name,
      email,
      phone,
      city,
      address,
      status,
      subscription_plan,
      subscription_status,
      subscription_start_date,
      subscription_end_date,
    } = body;

    if (!school_name || !owner_name || !email) {
      return NextResponse.json(
        { success: false, message: "School Name, Owner Name, and Email are required fields." },
        { status: 400 }
      );
    }

    const pool = getPool();

    const updateQuery = `
      UPDATE schools
      SET 
        name = $1,
        school_name = $1,
        owner_name = $2,
        email = $3,
        phone = $4,
        city = $5,
        address = $6,
        status = $7,
        subscription_plan = $8,
        subscription_status = $9,
        subscription_start_date = $10,
        subscription_end_date = $11,
        updated_at = NOW()
      WHERE id = $12
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [
      school_name,
      owner_name,
      email,
      phone || "",
      city || "",
      address || "",
      status || "active",
      subscription_plan || "Starter",
      subscription_status || "active",
      subscription_start_date ? new Date(subscription_start_date) : null,
      subscription_end_date ? new Date(subscription_end_date) : null,
      id,
    ]);

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: "School not found." },
        { status: 404 }
      );
    }

    // Also update settings table to match
    await pool.query(
      `UPDATE settings 
       SET school_name = $1, school_address = $2, school_phone = $3, school_email = $4, principal_name = $5
       WHERE school_id = $6`,
      [school_name, address || "", phone || "", email, owner_name, id]
    );

    return NextResponse.json({
      success: true,
      message: "School settings updated successfully.",
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error("[school id put] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update school." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireTenantUser();
    if (user.role !== "SAAS_ADMIN" && user.role !== "super_admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Access restricted to SaaS Administrators." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const pool = getPool();

    // Begin transaction for safe cascade cleanups
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Get school code/tenant_id to clean up invoices/payments
      const schoolRes = await client.query("SELECT code, tenant_id FROM schools WHERE id = $1 LIMIT 1", [id]);
      if (schoolRes.rows.length === 0) {
        await client.query("ROLLBACK");
        client.release();
        return NextResponse.json({ success: false, message: "School not found." }, { status: 404 });
      }

      const tenantId = schoolRes.rows[0].tenant_id || schoolRes.rows[0].code;

      // Delete payments
      if (tenantId) {
        await client.query("DELETE FROM payments WHERE tenant_id = $1", [tenantId]);
        await client.query("DELETE FROM invoices WHERE tenant_id = $1", [tenantId]);
      }

      // Delete users belonging to school
      await client.query("DELETE FROM users WHERE school_id = $1", [id]);

      // Delete settings
      await client.query("DELETE FROM settings WHERE school_id = $1", [id]);

      // Delete school record
      await client.query("DELETE FROM schools WHERE id = $1", [id]);

      await client.query("COMMIT");
      client.release();

      return NextResponse.json({
        success: true,
        message: "School and all associated records deleted successfully.",
      });
    } catch (txErr: any) {
      await client.query("ROLLBACK");
      client.release();
      throw txErr;
    }
  } catch (error: any) {
    console.error("[school id delete] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete school." },
      { status: 500 }
    );
  }
}
