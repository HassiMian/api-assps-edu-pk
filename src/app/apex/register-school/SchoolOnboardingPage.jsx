"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  UserRound,
  Phone,
  Mail,
  MapPin,
  Users,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function SchoolOnboardingPage() {
  const [form, setForm] = useState({
    schoolName: "",
    ownerName: "",
    phone: "",
    email: "",
    city: "",
    address: "",
    students: "",
    plan: "Professional",
  });

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      tenantStatus: "pending",
      subscriptionStatus: "unpaid",
      onboardingStatus: "submitted",
    };

    console.log("Create pending school tenant:", payload);

    if (typeof window !== "undefined") {
      const q = new URLSearchParams({
        plan: form.plan.toLowerCase(),
        schoolName: form.schoolName,
        ownerName: form.ownerName,
        phone: form.phone,
        email: form.email,
        city: form.city,
        address: form.address,
        students: form.students
      }).toString();
      window.location.href = `/apex/checkout?${q}&cycle=monthly`;
    }
  };

  return (
    <main className="min-h-screen bg-[#040711] px-6 py-20 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.16),transparent_45%)]" />

      <div className="relative mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-cyan-200">
            <ShieldCheck size={16} />
            School Tenant Onboarding
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight md:text-6xl">
            Register your school on APEX
          </h1>

          <p className="mt-5 text-lg leading-8 text-slate-300">
            School details submit karein. Payment verification ke baad aapka
            isolated school tenant activate kar diya jaye ga.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-7 backdrop-blur-xl"
          >
            <h2 className="mb-6 text-2xl font-semibold">School Information</h2>

            <div className="grid gap-5 md:grid-cols-2">
              <Field
                icon={Building2}
                placeholder="School Name"
                value={form.schoolName}
                onChange={(v) => update("schoolName", v)}
              />

              <Field
                icon={UserRound}
                placeholder="Owner / Principal Name"
                value={form.ownerName}
                onChange={(v) => update("ownerName", v)}
              />

              <Field
                icon={Phone}
                placeholder="Phone Number"
                value={form.phone}
                onChange={(v) => update("phone", v)}
              />

              <Field
                icon={Mail}
                placeholder="Email Address"
                value={form.email}
                onChange={(v) => update("email", v)}
              />

              <Field
                icon={MapPin}
                placeholder="City"
                value={form.city}
                onChange={(v) => update("city", v)}
              />

              <Field
                icon={Users}
                placeholder="Estimated Students"
                value={form.students}
                onChange={(v) => update("students", v)}
              />
            </div>

            <textarea
              required
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              placeholder="Full School Address"
              className="mt-5 min-h-[120px] w-full rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-white outline-none placeholder:text-slate-400 focus:border-cyan-300/60"
            />

            <h2 className="mb-5 mt-8 text-2xl font-semibold">Select Plan</h2>

            <div className="grid gap-4 md:grid-cols-3">
              {["Starter", "Professional", "Enterprise"].map((plan) => (
                <button
                  key={plan}
                  type="button"
                  onClick={() => update("plan", plan)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    form.plan === plan
                      ? "border-cyan-300 bg-cyan-300/10"
                      : "border-white/10 bg-white/[0.04]"
                  }`}
                >
                  <div className="font-semibold">{plan}</div>
                  <div className="mt-1 text-xs text-slate-400">
                    {plan === "Starter"
                      ? "Small schools"
                      : plan === "Professional"
                      ? "Growing schools"
                      : "Large schools"}
                  </div>
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="group mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100"
            >
              Continue to Payment
              <ArrowRight size={17} className="transition group-hover:translate-x-1" />
            </button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="h-fit rounded-[2rem] border border-white/10 bg-white/[0.06] p-7 backdrop-blur-xl"
          >
            <h2 className="text-2xl font-semibold">Activation Flow</h2>

            <div className="mt-7 space-y-5">
              {[
                "School registration submitted",
                "Subscription plan selected",
                "Payment proof uploaded",
                "Super Admin verifies payment",
                "Tenant activated",
                "Admin credentials generated",
              ].map((step, index) => (
                <div key={step} className="flex gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-300/10 text-sm font-bold text-cyan-200 ring-1 ring-cyan-300/20">
                    {index + 1}
                  </div>

                  <div>
                    <p className="font-medium">{step}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {index === 0
                        ? "School tenant pending status mein create hota hai."
                        : "APEX isolated data system ke through process hota hai."}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.07] p-5">
              <p className="text-sm leading-6 text-slate-300">
                Har school ka apna tenantId hoga. Demo data aur real school data
                kabhi mix nahi hoga.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

function Field({ icon: Icon, placeholder, value, onChange }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 focus-within:border-cyan-300/60">
      <Icon size={18} className="text-cyan-300" />
      <input
        required
        value={value}
        onChange={(e) => onChange(e)}
        placeholder={placeholder}
        className="w-full bg-transparent text-white outline-none placeholder:text-slate-400"
      />
    </div>
  );
}
