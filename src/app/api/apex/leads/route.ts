import { NextResponse } from "next/server";
import { createApexLead } from "@/lib/server/apex-leads-storage";
import { sendApexLeadAutoReply, sendApexLeadNotification } from "@/lib/server/mail";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const type = String(body.type || "contact").toLowerCase() as
      | "demo"
      | "contact"
      | "register"
      | "enterprise";

    const name = String(body.name || body.contactName || body.ownerName || "").trim();
    const email = String(body.email || "").trim();
    const phone = String(body.phone || body.contactNumber || "").trim();

    if (!name || !email || !phone) {
      return NextResponse.json(
        { success: false, message: "Name, email and phone are required" },
        { status: 400 }
      );
    }

    const lead = await createApexLead({
      type: ["demo", "contact", "register", "enterprise"].includes(type) ? type : "contact",
      name,
      email,
      phone,
      schoolName: body.schoolName ? String(body.schoolName) : undefined,
      city: body.city ? String(body.city) : undefined,
      studentsCount: body.studentsCount ? String(body.studentsCount) : undefined,
      notes: body.notes ? String(body.notes) : undefined,
      extra: body.extra,
    });

    await sendApexLeadNotification({
      leadId: lead.leadId,
      type: lead.type,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      schoolName: lead.schoolName,
      notes: lead.notes,
    });

    try {
      await sendApexLeadAutoReply({
        to: lead.email,
        name: lead.name,
        type: lead.type,
        leadId: lead.leadId,
      });
    } catch {
      // non-blocking
    }

    return NextResponse.json({
      success: true,
      message: "Request submitted successfully",
      leadId: lead.leadId,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to submit request";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
