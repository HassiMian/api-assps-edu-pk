"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

const MESSAGES = {
  demo: "Demo request received. Check your email for confirmation — our team will schedule your walkthrough soon.",
  contact: "Your message was sent. We emailed you a reference ID and will respond within 24–48 hours.",
  enterprise: "Enterprise quote request received. We will contact you within 1–2 business days.",
  register: "Registration received. Our onboarding team will follow up shortly.",
  "1": "Your request was submitted successfully. Our team will respond shortly.",
};

function BannerInner() {
  const params = useSearchParams();
  const submitted = params.get("submitted");
  const leadId = params.get("leadId");
  if (!submitted) return null;

  const text = MESSAGES[submitted] || MESSAGES["1"];

  return (
    <div className="mb-8 flex items-start gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 px-5 py-4 text-emerald-100">
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
      <div className="text-sm leading-6">
        <p>{text}</p>
        {leadId && (
          <p className="mt-2 font-mono text-xs text-emerald-200/90">
            Reference: {leadId}
          </p>
        )}
      </div>
    </div>
  );
}

export default function ApexSubmittedBanner() {
  return (
    <Suspense fallback={null}>
      <BannerInner />
    </Suspense>
  );
}
