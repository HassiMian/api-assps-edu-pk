"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { APEX_PLANS, formatPlanPrice, getCheckoutHref } from "./apexPlans";
import { trackApexEvent, APEX_EVENTS } from "./apexFunnel";

export default function ApexPricingPlans() {
  const [billing, setBilling] = useState("monthly");

  useEffect(() => {
    trackApexEvent(APEX_EVENTS.VIEW_PRICING, { billing: "monthly" });
  }, []);

  const getPrice = (plan) => {
    if (!plan.monthly) return "Custom";
    const amount = billing === "monthly" ? plan.monthly : plan.yearly;
    return formatPlanPrice(amount);
  };

  return (
    <section id="pricing" className="apex-scene relative scroll-mt-24 overflow-x-clip py-20 text-white sm:py-24">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-cyan-200">
            Subscription Plans
          </div>

          <h2 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl md:text-6xl">
            Choose the right APEX plan
          </h2>

          <p className="mt-5 text-base leading-8 text-slate-300 sm:text-lg">
            School size ke mutabiq plan select karein, checkout complete karein, aur payment
            verification ke baad tenant activate ho jaye ga.
          </p>

          <div className="mx-auto mt-8 flex w-fit rounded-full border border-white/10 bg-white/5 p-1">
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                billing === "monthly" ? "bg-white text-slate-950" : "text-slate-300"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBilling("yearly")}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                billing === "yearly" ? "bg-white text-slate-950" : "text-slate-300"
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        <div className="mt-12 grid gap-5 sm:mt-16 sm:gap-6 lg:grid-cols-3">
          {APEX_PLANS.map((plan, index) => {
            const Icon = plan.icon;
            const checkoutHref = plan.monthly ? getCheckoutHref(plan.id, billing) : "/apex/enterprise";

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.12, duration: 0.65 }}
                viewport={{ once: true }}
                className={`relative overflow-hidden rounded-[1.75rem] border p-6 backdrop-blur-xl transition sm:rounded-[2rem] sm:p-7 md:hover:-translate-y-2 ${
                  plan.popular
                    ? "border-cyan-300/40 bg-cyan-300/[0.09] shadow-[0_0_60px_rgba(34,211,238,0.18)]"
                    : "border-white/10 bg-white/[0.06]"
                }`}
              >
                {plan.popular && (
                  <div className="absolute right-5 top-5 rounded-full bg-cyan-300 px-3 py-1 text-xs font-bold text-slate-950">
                    Recommended
                  </div>
                )}

                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200 ring-1 ring-cyan-300/20">
                  <Icon size={26} />
                </div>

                <h3 className="text-2xl font-semibold">{plan.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{plan.desc}</p>

                <div className="mt-7">
                  <span className="text-4xl font-bold">{getPrice(plan)}</span>
                  {plan.monthly && (
                    <span className="ml-2 text-sm text-slate-400">
                      / {billing === "monthly" ? "month" : "year"}
                    </span>
                  )}
                </div>

                <Link
                  href={checkoutHref}
                  onClick={() =>
                    trackApexEvent(APEX_EVENTS.CLICK_CHECKOUT, {
                      plan: plan.id,
                      billing,
                    })
                  }
                  className="group mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100"
                >
                  {plan.monthly ? "Start Checkout" : "Contact Sales"}
                  <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </Link>

                <div className="mt-7 space-y-4">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex gap-3 text-sm text-slate-300">
                      <CheckCircle2 size={18} className="shrink-0 text-cyan-300" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
