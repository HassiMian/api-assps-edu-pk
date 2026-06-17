import { NextResponse } from "next/server";
import { requireSaasAdminUser } from "@/lib/server/auth-user";
import { listApexLeads } from "@/lib/server/apex-leads-storage";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    await requireSaasAdminUser();
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status");
    const leads = await listApexLeads(statusParam);
    return NextResponse.json({ success: true, data: leads });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load leads";
    if (message === "Unauthorized" || message === "Forbidden") {
      return NextResponse.json(
        { success: false, message },
        { status: message === "Forbidden" ? 403 : 401 }
      );
    }
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
