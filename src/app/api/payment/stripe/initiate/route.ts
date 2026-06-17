import { NextResponse } from "next/server";
import { createSubscriptionRequest } from "@/lib/server/subscription-request-storage";
import { createStripeCheckoutSession, stripeReady } from "@/lib/server/stripe-gateway";
import { sendPaymentPendingEmail } from "@/lib/server/mail";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    if (!stripeReady()) {
      return NextResponse.json(
        { success: false, message: "Stripe is not configured. Use manual card verification." },
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
      paymentMethod: "stripe_live",
      transactionId: "",
    });

    const requestId = request.request_id;
    const session = await createStripeCheckoutSession({
      amount: planPrice,
      requestId,
      email,
      planName,
    });

    if (!session?.url) {
      return NextResponse.json(
        { success: false, message: "Failed to create Stripe checkout session" },
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
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Stripe initiate failed";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
