import { NextResponse } from "next/server";
import { gatewayFailureRedirectUrl } from "@/lib/server/gateway-callback-handler";
import { finalizeStripeReturn } from "@/lib/server/stripe-gateway";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("session_id") || "";

  if (!sessionId) {
    return NextResponse.redirect(gatewayFailureRedirectUrl(""));
  }

  try {
    const redirectUrl = await finalizeStripeReturn(sessionId);
    return NextResponse.redirect(redirectUrl);
  } catch {
    return NextResponse.redirect(gatewayFailureRedirectUrl(""));
  }
}
