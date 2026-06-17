import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { requireSaasAdminUser } from "@/lib/server/auth-user";
import { sendApexLeadAutoReply } from "@/lib/server/mail";
import type { ApexLeadRecord } from "@/lib/server/apex-leads-storage";

export const runtime = "nodejs";

export async function POST(
  _req: Request,
  context: { params: Promise<{ leadId: string }> }
) {
  try {
    await requireSaasAdminUser();
    const { leadId } = await context.params;
    const filePath = path.join(process.cwd(), "data", "apex-leads", `${leadId}.json`);
    const raw = await fs.readFile(filePath, "utf8");
    const lead = JSON.parse(raw) as ApexLeadRecord;

    const sent = await sendApexLeadAutoReply({
      to: lead.email,
      name: lead.name,
      type: lead.type,
      leadId: lead.leadId,
    });

    return NextResponse.json({
      success: true,
      message: sent
        ? "Follow-up email sent to lead"
        : "SMTP not configured — email logged to server fallback",
      emailSent: sent,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Follow-up failed";
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
