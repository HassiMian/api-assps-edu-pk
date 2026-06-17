import { NextResponse } from "next/server";
import { requireSaasAdminUser } from "@/lib/server/auth-user";
import { buildSubscriptionRequestsCsv } from "@/lib/server/subscription-request-export";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    await requireSaasAdminUser();

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status") || "ALL";
    const csv = await buildSubscriptionRequestsCsv(statusParam);
    const stamp = new Date().toISOString().slice(0, 10);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="apex-subscription-requests-${statusParam.toLowerCase()}-${stamp}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Export failed";
    if (message === "Unauthorized" || message === "Forbidden") {
      return NextResponse.json(
        { success: false, message },
        { status: message === "Forbidden" ? 403 : 401 }
      );
    }
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
