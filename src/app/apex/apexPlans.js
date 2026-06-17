import { Building2, Crown, Rocket } from "lucide-react";
import { APEX_PLAN_PRICES } from "./apexPlansData";

/** Single source of truth for APEX subscription pricing (PKR). */
export const APEX_PLANS = [
  {
    id: "starter",
    name: "Starter",
    desc: "Small schools ke liye basic setup",
    audience: "For small schools",
    monthly: APEX_PLAN_PRICES.starter.monthly,
    yearly: APEX_PLAN_PRICES.starter.yearly,
    badge: "Launch",
    icon: Rocket,
    popular: false,
    recommended: false,
    features: [
      "Up to 300 students",
      "Student management",
      "Fee management",
      "Basic reports",
      "Admin dashboard",
      "Email support",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    desc: "Growing schools ke liye complete system",
    audience: "For growing schools",
    monthly: APEX_PLAN_PRICES.professional.monthly,
    yearly: APEX_PLAN_PRICES.professional.yearly,
    badge: "Recommended",
    icon: Crown,
    popular: true,
    recommended: true,
    features: [
      "Up to 1000 students",
      "All core modules",
      "Parent / Teacher / Student app",
      "Paper generator",
      "Exams & results",
      "Advanced analytics",
      "Priority support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    desc: "Large schools aur multi-branch setup",
    audience: "For large school networks",
    monthly: null,
    yearly: null,
    badge: "Custom",
    icon: Building2,
    popular: false,
    recommended: false,
    features: [
      "Unlimited students",
      "Multi-branch support",
      "Advanced AI tools",
      "Custom integrations",
      "Dedicated support",
      "Custom deployment",
      "Enterprise security",
    ],
  },
];

export function getPlanById(planId) {
  const key = String(planId || "professional").toLowerCase();
  return APEX_PLANS.find((p) => p.id === key) || APEX_PLANS[1];
}

export function getPlanPrice(planId, cycle = "monthly") {
  const plan = getPlanById(planId);
  if (!plan.monthly) return null;
  return String(cycle).toLowerCase() === "yearly" ? plan.yearly : plan.monthly;
}

export function formatPlanPrice(amount) {
  if (amount == null) return "Custom";
  return `PKR ${Number(amount).toLocaleString()}`;
}

export function getCheckoutHref(planId, cycle = "monthly") {
  const plan = getPlanById(planId);
  if (!plan.monthly) return "/apex/enterprise";
  return `/apex/checkout?plan=${plan.id}&cycle=${cycle}`;
}
