import { NextResponse } from "next/server";
import { getBankTransferDetails } from "@/lib/server/bank-details";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ success: true, data: getBankTransferDetails() });
}
