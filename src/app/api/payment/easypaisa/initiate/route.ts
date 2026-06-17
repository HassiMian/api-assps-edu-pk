import { NextResponse } from "next/server";
import { createSubscriptionRequest } from "@/lib/server/subscription-request-storage";
import { buildEasyPaisaCheckout, easypaisaReady } from "@/lib/server/easypaisa-gateway";
import { sendPaymentPendingEmail } from "@/lib/server/mail";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    if (!easypaisaReady()) {
      return NextResponse.json(
        { success: false, message: "EasyPaisa is not configured. Use manual payment verification." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const planId = String(body.planId || "");
    const planName = String(body.planName || "");
    const planPrice = Number(body.planPrice);
    const ownerName = String(body.ownerName || "");
    const schoolName = String(body.schoolName || "");
    const schoolAddress = String(body.schoolAddress || "");
    const contactNumber = String(body.contactNumber || "");
    const email = String(body.email || "");
    const city = String(body.city || "");
    const billingCycle = String(body.billingCycle || "monthly");

    if (!planId || !planName || !planPrice || !ownerName || !schoolName || !contactNumber || !email) {
      return NextResponse.json(
        { success: false, message: "Missing required checkout fields" },
        { status: 400 }
      );
    }

    const request = await createSubscriptionRequest({
      planId,
      planName,
      planPrice,
      ownerName,
      schoolName,
      schoolAddress: schoolAddress || city || "N/A",
      contactNumber,
      email,
      city,
      billingCycle,
      paymentMethod: "easypaisa_live",
      transactionId: "",
    });

    const requestId = request.request_id;
    const checkout = buildEasyPaisaCheckout({
      amount: planPrice,
      requestId,
      email,
      phone: contactNumber,
    });

    if (!checkout) {
      return NextResponse.json(
        { success: false, message: "Failed to build EasyPaisa checkout" },
        { status: 500 }
      );
    }

    try {
      await sendPaymentPendingEmail({
        to: email,
        ownerName,
        schoolName,
        requestId,
        planName,
        amount: Math.round(planPrice),
      });
    } catch {
      // non-blocking
    }

    return NextResponse.json({
      success: true,
      requestId,
      endpoint: checkout.endpoint,
      fields: checkout.fields,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "EasyPaisa initiate failed";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
