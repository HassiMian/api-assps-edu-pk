export function formatPaymentMethodLabel(method?: string) {
  const key = String(method || "manual").toLowerCase();
  const labels: Record<string, string> = {
    jazzcash_live: "JazzCash Live",
    easypaisa_live: "EasyPaisa Live",
    stripe_live: "Stripe Card",
    jazzcash: "JazzCash",
    easypaisa: "EasyPaisa",
    bank: "Bank Transfer",
    card: "Card",
    manual: "Manual",
  };
  return labels[key] || method || "Manual";
}

export function paymentMethodBadgeTone(method?: string) {
  const key = String(method || "manual").toLowerCase();
  if (key.includes("jazzcash")) return "bg-red-400/20 text-red-200";
  if (key.includes("easypaisa")) return "bg-emerald-400/20 text-emerald-200";
  if (key === "bank") return "bg-blue-400/20 text-blue-200";
  if (key === "card" || key.includes("stripe")) return "bg-violet-400/20 text-violet-200";
  return "bg-slate-400/20 text-slate-200";
}

export function isLiveGatewayMethod(method?: string) {
  const key = String(method || "").toLowerCase();
  return key.endsWith("_live");
}
