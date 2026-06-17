import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { applyGatewayPaymentResult } from "@/lib/server/subscription-request-storage";
import {
  finalizeGatewayPaymentSuccess,
  gatewayFailureRedirectUrl,
} from "@/lib/server/gateway-callback-handler";
import {
  interpretEasyPaisaCallback,
  parseEasyPaisaCallbackFields,
  verifyEasyPaisaCallback,
} from "@/lib/server/easypaisa-gateway";

export const runtime = "nodejs";

async function logCallback(fields: Record<string, string>) {
  try {
    const dir = path.join(process.cwd(), "data", "easypaisa-callbacks");
    await fs.mkdir(dir, { recursive: true });
    const name = `${Date.now()}-${fields.orderRefNum || "unknown"}.json`;
    await fs.writeFile(path.join(dir, name), JSON.stringify(fields, null, 2), "utf8");
  } catch {
    // non-blocking
  }
}

async function handleCallback(req: Request) {
  const fields = await parseEasyPaisaCallbackFields(req);
  await logCallback(fields);

  const verification = verifyEasyPaisaCallback(fields);
  const parsed = interpretEasyPaisaCallback(fields);

  if (!parsed.requestId) {
    return NextResponse.redirect(gatewayFailureRedirectUrl(""));
  }

  if (!verification.valid) {
    await applyGatewayPaymentResult(parsed.requestId, {
      status: "payment_failed",
      transactionId: parsed.transactionId,
      gatewayResponseCode: parsed.status || "HASH_FAIL",
      gatewayResponseMessage: verification.reason,
    }).catch(() => undefined);

    return NextResponse.redirect(gatewayFailureRedirectUrl(parsed.requestId));
  }

  if (parsed.success) {
    const redirectUrl = await finalizeGatewayPaymentSuccess({
      requestId: parsed.requestId,
      gateway: "EasyPaisa",
      transactionId: parsed.transactionId,
      patch: {
        status: "payment_confirmed",
        transactionId: parsed.transactionId,
        gatewayResponseCode: parsed.status,
        gatewayResponseMessage: parsed.responseMessage,
      },
    });
    return NextResponse.redirect(redirectUrl);
  }

  await applyGatewayPaymentResult(parsed.requestId, {
    status: "payment_failed",
    transactionId: parsed.transactionId,
    gatewayResponseCode: parsed.status,
    gatewayResponseMessage: parsed.responseMessage,
  });

  return NextResponse.redirect(gatewayFailureRedirectUrl(parsed.requestId));
}

export async function GET(req: Request) {
  return handleCallback(req);
}

export async function POST(req: Request) {
  return handleCallback(req);
}
