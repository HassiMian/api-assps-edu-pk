import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { applyGatewayPaymentResult } from "@/lib/server/subscription-request-storage";
import {
  finalizeGatewayPaymentSuccess,
  gatewayFailureRedirectUrl,
} from "@/lib/server/gateway-callback-handler";
import {
  interpretJazzCashCallback,
  parseJazzCashCallbackFields,
  verifyJazzCashCallback,
} from "@/lib/server/payment-gateway";

export const runtime = "nodejs";

async function logCallback(fields: Record<string, string>) {
  try {
    const dir = path.join(process.cwd(), "data", "jazzcash-callbacks");
    await fs.mkdir(dir, { recursive: true });
    const name = `${Date.now()}-${fields.pp_BillReference || "unknown"}.json`;
    await fs.writeFile(path.join(dir, name), JSON.stringify(fields, null, 2), "utf8");
  } catch {
    // non-blocking
  }
}

async function handleCallback(req: Request) {
  const fields = await parseJazzCashCallbackFields(req);
  await logCallback(fields);

  const verification = verifyJazzCashCallback(fields);
  const parsed = interpretJazzCashCallback(fields);

  if (!parsed.requestId) {
    return NextResponse.redirect(gatewayFailureRedirectUrl(""));
  }

  if (!verification.valid) {
    await applyGatewayPaymentResult(parsed.requestId, {
      status: "payment_failed",
      transactionId: parsed.retrievalRef || parsed.txnRefNo,
      gatewayResponseCode: parsed.responseCode || "HASH_FAIL",
      gatewayResponseMessage: verification.reason,
    }).catch(() => undefined);

    return NextResponse.redirect(gatewayFailureRedirectUrl(parsed.requestId));
  }

  if (parsed.success) {
    const redirectUrl = await finalizeGatewayPaymentSuccess({
      requestId: parsed.requestId,
      gateway: "JazzCash",
      transactionId: parsed.retrievalRef || parsed.authCode || parsed.txnRefNo,
      patch: {
        status: "payment_confirmed",
        transactionId: parsed.retrievalRef || parsed.authCode || parsed.txnRefNo,
        gatewayResponseCode: parsed.responseCode,
        gatewayResponseMessage: parsed.responseMessage,
        gatewayAuthCode: parsed.authCode,
        gatewayRetrievalRef: parsed.retrievalRef,
      },
    });
    return NextResponse.redirect(redirectUrl);
  }

  await applyGatewayPaymentResult(parsed.requestId, {
    status: "payment_failed",
    transactionId: parsed.retrievalRef || parsed.txnRefNo,
    gatewayResponseCode: parsed.responseCode,
    gatewayResponseMessage: parsed.responseMessage,
    gatewayAuthCode: parsed.authCode,
    gatewayRetrievalRef: parsed.retrievalRef,
  });

  return NextResponse.redirect(gatewayFailureRedirectUrl(parsed.requestId));
}

export async function GET(req: Request) {
  return handleCallback(req);
}

export async function POST(req: Request) {
  return handleCallback(req);
}
