"use client";

import { Mail, MessageCircle } from "lucide-react";
import { APEX_SUPPORT_EMAIL, apexWhatsAppUrl } from "./apexContact";

export default function ApexCheckoutSupport({
  context = "checkout",
  planName,
  requestId,
}) {
  const waMessage =
    context === "payment"
      ? `Hello APEX, I need help with my payment${requestId ? ` (Request: ${requestId})` : ""}.`
      : `Hello APEX, I need help with checkout${planName ? ` for ${planName}` : ""}.`;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-sm font-semibold text-white">Need help?</p>
      <p className="mt-1 text-xs leading-5 text-slate-400">
        Payment ya checkout mein issue ho to humse contact karein.
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <a
          href={apexWhatsAppUrl(waMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-4 py-2.5 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-400/15"
        >
          <MessageCircle size={16} />
          WhatsApp
        </a>
        <a
          href={`mailto:${APEX_SUPPORT_EMAIL}?subject=${encodeURIComponent(
            context === "payment" ? "APEX Payment Support" : "APEX Checkout Support"
          )}`}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
        >
          <Mail size={16} />
          Email
        </a>
      </div>
    </div>
  );
}
