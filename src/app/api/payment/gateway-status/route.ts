import { NextResponse } from "next/server";
import { getPaymentGatewayStatus } from "@/lib/server/payment-gateway";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ success: true, data: getPaymentGatewayStatus() });
}
