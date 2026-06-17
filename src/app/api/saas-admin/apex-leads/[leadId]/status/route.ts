import { NextResponse } from "next/server";
import { requireSaasAdminUser } from "@/lib/server/auth-user";
import {
  ApexLeadStatus,
  updateApexLeadStatus,
} from "@/lib/server/apex-leads-storage";

export const runtime = "nodejs";

const ALLOWED: ApexLeadStatus[] = ["new", "contacted", "archived"];

export async function POST(
  req: Request,
  context: { params: Promise<{ leadId: string }> }
) {
  try {
    await requireSaasAdminUser();
    const { leadId } = await context.params;
    const body = await req.json();
    const status = String(body.status || "").toLowerCase() as ApexLeadStatus;

    if (!ALLOWED.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid lead status" },
        { status: 400 }
      );
    }

    const lead = await updateApexLeadStatus(leadId, status);
    return NextResponse.json({ success: true, data: lead });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update lead";
    if (message === "Unauthorized" || message === "Forbidden") {
      return NextResponse.json(
        { success: false, message },
        { status: message === "Forbidden" ? 403 : 401 }
      );
    }
    if (message.includes("ENOENT")) {
      return NextResponse.json({ success: false, message: "Lead not found" }, { status: 404 });
    }
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
