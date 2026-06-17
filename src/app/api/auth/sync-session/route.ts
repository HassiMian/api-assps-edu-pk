import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { requireEnv } from "@/lib/server/env";

/** Sync httpOnly cookies after Express/backend login (localStorage JWT). */
export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("Authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token) {
      return NextResponse.json({ success: false, message: "Missing token" }, { status: 401 });
    }

    const secret = requireEnv("JWT_SECRET", "dev-jwt-secret");
    const payload = jwt.verify(token, secret) as {
      id?: string | number;
      role?: string;
      tenant_id?: string;
      school_id?: string | number;
    };

    const role = String(payload.role || "").trim();
    const userId = payload.id != null ? String(payload.id) : "";
    const tenantId = String(payload.tenant_id || payload.school_id || "");

    if (!userId || !role) {
      return NextResponse.json({ success: false, message: "Invalid token payload" }, { status: 400 });
    }

    const response = NextResponse.json({ success: true });
    const options = {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    };

    response.cookies.set("userId", userId, options);
    response.cookies.set("tenantId", tenantId, options);
    response.cookies.set("role", role, options);
    response.cookies.set("authToken", token, options);

    return response;
  } catch {
    return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
  }
}
