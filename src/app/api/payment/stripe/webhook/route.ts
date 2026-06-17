import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import Stripe from "stripe";
import {
  constructStripeWebhookEvent,
  processStripeCheckoutSession,
  stripeReady,
} from "@/lib/server/stripe-gateway";

export const runtime = "nodejs";

async function logWebhookEvent(event: Stripe.Event) {
  try {
    const dir = path.join(process.cwd(), "data", "stripe-webhooks");
    await fs.mkdir(dir, { recursive: true });
    const name = `${Date.now()}-${event.type}.json`;
    await fs.writeFile(path.join(dir, name), JSON.stringify(event, null, 2), "utf8");
  } catch {
    // non-blocking
  }
}

export async function POST(req: Request) {
  if (!stripeReady() || !process.env.STRIPE_WEBHOOK_SECRET?.trim()) {
    return NextResponse.json(
      { success: false, message: "Stripe webhook is not configured" },
      { status: 400 }
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { success: false, message: "Missing Stripe signature" },
      { status: 400 }
    );
  }

  const payload = await req.text();

  let event: Stripe.Event;
  try {
    const constructed = constructStripeWebhookEvent(payload, signature);
    if (!constructed) {
      return NextResponse.json(
        { success: false, message: "Stripe webhook is not configured" },
        { status: 400 }
      );
    }
    event = constructed;
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid Stripe webhook signature" },
      { status: 400 }
    );
  }

  await logWebhookEvent(event);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status === "paid") {
      try {
        await processStripeCheckoutSession(session);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Stripe webhook failed";
        console.error("[stripe/webhook]", message);
        return NextResponse.json({ success: false, message }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
