"use client";

import { FlaskConical } from "lucide-react";

export default function ApexGatewaySandboxPanel({ gatewayStatus, method }) {
  if (!gatewayStatus) return null;

  const jazzHint =
    gatewayStatus.jazzcashReady &&
    gatewayStatus.jazzcashSandbox &&
    method === "jazzcash";
  const easypaisaHint =
    gatewayStatus.easypaisaReady &&
    gatewayStatus.easypaisaSandbox &&
    method === "easypaisa";
  const stripeHint =
    gatewayStatus.stripeReady && method === "card";

  if (!jazzHint && !easypaisaHint && !stripeHint) return null;

  const lines =
    method === "card"
      ? [
          "Stripe test mode — use card 4242 4242 4242 4242, any future expiry, any CVC.",
        ]
      : method === "jazzcash"
        ? [
            "JazzCash sandbox — use your merchant test wallet credentials.",
            "Successful sandbox payments return code 000.",
          ]
        : [
            "EasyPaisa staging — use merchant sandbox wallet credentials.",
            "Payment should redirect back to APEX after completion.",
          ];

  return (
    <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3">
      <div className="flex items-center gap-2 text-amber-200">
        <FlaskConical size={16} />
        <p className="text-sm font-semibold">Sandbox test mode</p>
      </div>
      <ul className="mt-2 space-y-1 text-xs leading-5 text-amber-100/85">
        {lines.map((line) => (
          <li key={line}>• {line}</li>
        ))}
      </ul>
    </div>
  );
}
