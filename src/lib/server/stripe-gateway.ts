import Stripe from "stripe";
import {
  finalizeGatewayPaymentSuccess,
  gatewayFailureRedirectUrl,
} from "@/lib/server/gateway-callback-handler";

function apexBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APEX_URL?.trim() ||
    process.env.APEX_PUBLIC_URL?.trim() ||
    "https://apex.assps.edu.pk"
  ).replace(/\/$/, "");
}

export function stripeReady() {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return null;
  return new Stripe(key);
}

export async function createStripeCheckoutSession({
  amount,
  requestId,
  email,
  planName,
}: {
  amount: number;
  requestId: string;
  email: string;
  planName: string;
}) {
  const stripe = getStripe();
  if (!stripe) return null;

  const currency = (process.env.STRIPE_CURRENCY || "pkr").toLowerCase();
  const base = apexBaseUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    client_reference_id: requestId,
    metadata: {
      requestId,
      planName,
    },
    line_items: [
      {
        price_data: {
          currency,
          unit_amount: Math.round(amount * 100),
          product_data: {
            name: `APEX ${planName}`,
            description: "APEX Education OS school subscription",
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${base}/api/payment/stripe/return?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/apex/payment-failed?requestId=${encodeURIComponent(requestId)}`,
  });

  return session;
}

export async function retrieveStripeCheckoutSession(sessionId: string) {
  const stripe = getStripe();
  if (!stripe || !sessionId) return null;
  return stripe.checkout.sessions.retrieve(sessionId);
}

function stripeRequestId(session: Stripe.Checkout.Session) {
  return String(session.metadata?.requestId || session.client_reference_id || "").trim();
}

function stripeTransactionId(session: Stripe.Checkout.Session) {
  return session.payment_intent ? String(session.payment_intent) : session.id;
}

export async function processStripeCheckoutSession(session: Stripe.Checkout.Session) {
  const requestId = stripeRequestId(session);
  if (!requestId) {
    throw new Error("Stripe session missing requestId");
  }

  if (session.payment_status !== "paid") {
    throw new Error("Stripe session is not paid");
  }

  const transactionId = stripeTransactionId(session);

  return finalizeGatewayPaymentSuccess({
    requestId,
    gateway: "Stripe",
    transactionId,
    patch: {
      status: "payment_confirmed",
      transactionId,
      gatewayResponseCode: "paid",
      gatewayResponseMessage: "Stripe checkout completed",
    },
  });
}

export async function finalizeStripeReturn(sessionId: string) {
  const session = await retrieveStripeCheckoutSession(sessionId);
  const requestId = session ? stripeRequestId(session) : "";

  if (!session || !requestId) {
    return gatewayFailureRedirectUrl("");
  }

  if (session.payment_status !== "paid") {
    return gatewayFailureRedirectUrl(requestId);
  }

  return processStripeCheckoutSession(session);
}

export function constructStripeWebhookEvent(payload: string, signature: string) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!stripe || !secret) return null;

  return stripe.webhooks.constructEvent(payload, signature, secret);
}
