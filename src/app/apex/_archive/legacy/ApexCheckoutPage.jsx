/**
 * Archived legacy checkout (replaced by checkout/PaymentCheckoutPage.jsx).
 * No route imports this file — reference only.
 */
"use client";

import { useMemo, useState } from "react";
import { Upload } from "lucide-react";
import { apexPlans, paymentMethods } from "../../ApexPortalData";

const inputClass =
  "w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/15";

function formatPrice(value) {
  if (!value) return "Custom";
  return `PKR ${value.toLocaleString()}`;
}

export function ApexCheckoutPageArchived({ ApexPortalShell }) {
  const [method, setMethod] = useState(paymentMethods[0]);
  const [loading, setLoading] = useState(false);
  const selectedPlan =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("plan") || "professional"
      : "professional";
  const selectedCycle =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("cycle") || "monthly"
      : "monthly";
  const plan = useMemo(
    () => apexPlans.find((item) => item.id === selectedPlan) || apexPlans[1],
    [selectedPlan]
  );
  const amount = selectedCycle === "yearly" ? plan.yearly : plan.monthly;

  const submit = (event) => {
    event.preventDefault();
    setLoading(true);
    setTimeout(() => {
      window.location.href = "/apex/payment-pending";
    }, 700);
  };

  return (
    <ApexPortalShell
      eyebrow="Payment Checkout"
      title="Submit payment proof for subscription activation"
      subtitle="Legacy stub — use /apex/checkout (PaymentCheckoutPage) instead."
    >
      <form
        onSubmit={submit}
        className="grid gap-6 rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 backdrop-blur-xl lg:grid-cols-2 lg:p-8"
      >
        {["School Name", "Owner Name", "Phone", "Email", "City"].map((field) => (
          <label key={field} className="space-y-2 text-sm font-bold text-slate-300">
            {field}
            <input
              required
              type={field === "Email" ? "email" : "text"}
              placeholder={field}
              className={inputClass}
            />
          </label>
        ))}
        <label className="space-y-2 text-sm font-bold text-slate-300">
          Selected Plan
          <input readOnly value={`${plan.name} - ${selectedCycle}`} className={inputClass} />
        </label>
        <label className="space-y-2 text-sm font-bold text-slate-300">
          Amount
          <input readOnly value={formatPrice(amount)} className={inputClass} />
        </label>
        <label className="space-y-2 text-sm font-bold text-slate-300">
          Payment Method
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className={inputClass}
          >
            {paymentMethods.map((item) => (
              <option key={item} className="bg-slate-950">
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm font-bold text-slate-300">
          Transaction ID
          <input
            required
            placeholder="JazzCash/EasyPaisa/bank transaction ID"
            className={inputClass}
          />
        </label>
        <label className="space-y-2 text-sm font-bold text-slate-300 lg:col-span-2">
          Upload Payment Screenshot
          <div className="flex items-center gap-3 rounded-2xl border border-dashed border-cyan-300/25 bg-cyan-300/[0.04] p-5 text-slate-300">
            <Upload className="h-5 w-5 text-cyan-300" />
            <input required type="file" accept="image/*,.pdf" className="text-sm" />
          </div>
        </label>
        <button
          disabled={loading}
          className="lg:col-span-2 rounded-full bg-cyan-300 px-6 py-4 font-black text-slate-950 disabled:opacity-60"
        >
          {loading ? "Submitting Verification..." : "Submit Payment Verification"}
        </button>
      </form>
    </ApexPortalShell>
  );
}
