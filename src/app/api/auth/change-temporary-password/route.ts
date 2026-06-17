import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Pool } from "pg";

export const runtime = "nodejs";

let pool: Pool | null = null;

function env(name: string, fallback: string) {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : fallback;
}

function getPool() {
  if (!pool) {
    pool = new Pool({
      host: env("DB_HOST", "127.0.0.1"),
      port: Number(env("DB_PORT", "5432")),
      database: env("DB_NAME", "alsiddique_db"),
      user: env("DB_USER", "postgres"),
      password: env("DB_PASSWORD", "admin123"),
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 3000,
    });
  }
  return pool;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, currentPassword, newPassword } = body;

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    if (String(newPassword).length < 8) {
      return NextResponse.json(
        { success: false, message: "New password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const result = await getPool().query("SELECT * FROM users WHERE id = $1 LIMIT 1", [userId]);
    const user = result.rows[0];

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (!user.must_change_password) {
      return NextResponse.json(
        { success: false, message: "Temporary password change is not available for this account." },
        { status: 403 }
      );
    }

    const isValidPassword = await bcrypt.compare(String(currentPassword), user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: "Current password is incorrect" },
        { status: 400 }
      );
    }

    const hashedNewPassword = await bcrypt.hash(String(newPassword), 10);

    await getPool().query(
      "UPDATE users SET password = $1, must_change_password = false WHERE id = $2",
      [hashedNewPassword, userId]
    );

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Password change failed" },
      { status: 500 }
    );
  }
}
