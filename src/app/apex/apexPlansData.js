/** Plan pricing data — safe for server + client (no React icons). */
export const APEX_PLAN_PRICES = {
  starter: { monthly: 4999, yearly: 49990, name: "Starter" },
  professional: { monthly: 9999, yearly: 99990, name: "Professional" },
  enterprise: { monthly: null, yearly: null, name: "Enterprise" },
};

export function resolvePlanPrice(planNameOrId, cycle = "monthly") {
  const key = String(planNameOrId || "professional").toLowerCase();
  let plan = APEX_PLAN_PRICES.professional;
  if (key.includes("starter")) plan = APEX_PLAN_PRICES.starter;
  else if (key.includes("enterprise")) plan = APEX_PLAN_PRICES.enterprise;
  else if (key.includes("pro") || key.includes("professional")) plan = APEX_PLAN_PRICES.professional;

  if (!plan.monthly) return { planName: `${plan.name} (Custom)`, planPrice: 0 };
  const yearly = String(cycle).toLowerCase() === "yearly";
  const amount = yearly ? plan.yearly : plan.monthly;
  return {
    planName: `${plan.name} (${yearly ? "Yearly" : "Monthly"})`,
    planPrice: amount,
  };
}
