"use client";

import React, { useState, useMemo, Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";
import {
  CreditCard,
  Building2,
  Smartphone,
  Upload,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { getPlanById, getPlanPrice, formatPlanPrice } from "../apexPlans";
import { trackApexEvent, APEX_EVENTS } from "../apexFunnel";
import JazzCashRedirect from "../JazzCashRedirect";
import ApexBankTransferPanel from "../ApexBankTransferPanel";
import ApexCheckoutSupport from "../ApexCheckoutSupport";
import ApexGatewaySandboxPanel from "../ApexGatewaySandboxPanel";

const paymentMethods = [
  {
    id: "jazzcash",
    title: "JazzCash",
    icon: Smartphone,
  },
  {
    id: "easypaisa",
    title: "EasyPaisa",
    icon: Smartphone,
  },
  {
    id: "bank",
    title: "Bank Transfer",
    icon: Building2,
  },
  {
    id: "card",
    title: "Debit / Credit Card",
    icon: CreditCard,
  },
];

const METHOD_LABELS = {
  jazzcash: "JazzCash",
  easypaisa: "EasyPaisa",
  bank: "Bank Transfer",
  card: "Debit / Credit Card",
};

function PaymentCheckoutForm() {
  const searchParams = useSearchParams();
  const formRef = useRef(null);
  const [method, setMethod] = useState("jazzcash");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const selectedPlan = searchParams.get("plan") || "professional";
  const selectedCycle = searchParams.get("cycle") || "monthly";

  const [form, setForm] = useState({
    schoolName: searchParams.get("schoolName") || "",
    ownerName: searchParams.get("ownerName") || "",
    phone: searchParams.get("phone") || "",
    email: searchParams.get("email") || "",
    city: searchParams.get("city") || "",
    address: searchParams.get("address") || "",
    students: searchParams.get("students") || "",
    transactionId: "",
  });

  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotName, setScreenshotName] = useState("");
  const [gatewayStatus, setGatewayStatus] = useState(null);
  const [gatewayRedirect, setGatewayRedirect] = useState(null);

  const jazzcashLive = gatewayStatus?.jazzcashReady && method === "jazzcash";
  const easypaisaLive = gatewayStatus?.easypaisaReady && method === "easypaisa";
  const stripeLive = gatewayStatus?.stripeReady && method === "card";
  const gatewayLive = jazzcashLive || easypaisaLive || stripeLive;

  useEffect(() => {
    trackApexEvent(APEX_EVENTS.CHECKOUT_START, {
      plan: selectedPlan,
      cycle: selectedCycle,
    });
  }, [selectedPlan, selectedCycle]);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "/api";
    axios
      .get(`${apiBase}/payment/gateway-status`)
      .then((res) => setGatewayStatus(res.data?.data || res.data))
      .catch(() => setGatewayStatus({ jazzcashReady: false, manualVerification: true }));
  }, []);

  const planInfo = useMemo(() => {
    const p = getPlanById(selectedPlan);
    const cycleLabel = selectedCycle.toLowerCase() === "yearly" ? "Yearly" : "Monthly";
    const priceVal = getPlanPrice(p.id, selectedCycle);

    return {
      id: p.id,
      name: p.name,
      cycle: cycleLabel,
      amount: priceVal,
      amountStr: formatPlanPrice(priceVal),
    };
  }, [selectedPlan, selectedCycle]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setScreenshotFile(file);
      setScreenshotName(file.name);
    }
  };

  const updateField = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
  };

  const validateSchoolForm = () => {
    if (!formRef.current) return false;
    const valid = formRef.current.reportValidity();
    if (!valid) {
      setErrorMsg("Please complete all required school details before paying.");
    }
    return valid;
  };

  const handleJazzCashPay = async () => {
    if (!validateSchoolForm()) return;
    setErrorMsg("");
    setLoading(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "/api";
      const res = await axios.post(`${apiBase}/payment/jazzcash/initiate`, {
        planId: planInfo.id,
        planName: `${planInfo.name} Plan`,
        planPrice: planInfo.amount || 0,
        schoolName: form.schoolName,
        ownerName: form.ownerName,
        contactNumber: form.phone,
        email: form.email,
        city: form.city,
        schoolAddress: form.address,
        billingCycle: selectedCycle,
      });

      if (res.data?.success && res.data.endpoint && res.data.fields) {
        trackApexEvent(APEX_EVENTS.CHECKOUT_SUBMIT, {
          plan: planInfo.id,
          cycle: selectedCycle,
          requestId: res.data.requestId,
          method: "jazzcash_live",
        });
        setGatewayRedirect({
          endpoint: res.data.endpoint,
          fields: res.data.fields,
        });
      } else {
        setErrorMsg(res.data?.message || "JazzCash checkout failed.");
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "JazzCash gateway unavailable.");
    } finally {
      setLoading(false);
    }
  };

  const handleStripePay = async () => {
    if (!validateSchoolForm()) return;
    setErrorMsg("");
    setLoading(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "/api";
      const res = await axios.post(`${apiBase}/payment/stripe/initiate`, {
        planId: planInfo.id,
        planName: `${planInfo.name} Plan`,
        planPrice: planInfo.amount || 0,
        schoolName: form.schoolName,
        ownerName: form.ownerName,
        contactNumber: form.phone,
        email: form.email,
        city: form.city,
        schoolAddress: form.address,
        billingCycle: selectedCycle,
      });

      if (res.data?.success && res.data.checkoutUrl) {
        trackApexEvent(APEX_EVENTS.CHECKOUT_SUBMIT, {
          plan: planInfo.id,
          cycle: selectedCycle,
          requestId: res.data.requestId,
          method: "stripe_live",
        });
        window.location.href = res.data.checkoutUrl;
        return;
      }
      setErrorMsg(res.data?.message || "Stripe checkout failed.");
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Stripe gateway unavailable.");
    } finally {
      setLoading(false);
    }
  };

  const handleEasyPaisaPay = async () => {
    if (!validateSchoolForm()) return;
    setErrorMsg("");
    setLoading(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "/api";
      const res = await axios.post(`${apiBase}/payment/easypaisa/initiate`, {
        planId: planInfo.id,
        planName: `${planInfo.name} Plan`,
        planPrice: planInfo.amount || 0,
        schoolName: form.schoolName,
        ownerName: form.ownerName,
        contactNumber: form.phone,
        email: form.email,
        city: form.city,
        schoolAddress: form.address,
        billingCycle: selectedCycle,
      });

      if (res.data?.success && res.data.endpoint && res.data.fields) {
        trackApexEvent(APEX_EVENTS.CHECKOUT_SUBMIT, {
          plan: planInfo.id,
          cycle: selectedCycle,
          requestId: res.data.requestId,
          method: "easypaisa_live",
        });
        setGatewayRedirect({
          endpoint: res.data.endpoint,
          fields: res.data.fields,
        });
      } else {
        setErrorMsg(res.data?.message || "EasyPaisa checkout failed.");
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "EasyPaisa gateway unavailable.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!gatewayLive && !screenshotFile) {
      setErrorMsg("Please upload your payment screenshot proof.");
      return;
    }
    setErrorMsg("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("planId", planInfo.id);
      formData.append("planName", `${planInfo.name} Plan`);
      formData.append("planPrice", String(planInfo.amount || 0));
      formData.append("schoolName", form.schoolName);
      formData.append("ownerName", form.ownerName);
      formData.append("contactNumber", form.phone);
      formData.append("email", form.email);
      formData.append("city", form.city);
      formData.append("schoolAddress", form.address);
      formData.append("selectedPlan", planInfo.name);
      formData.append("billingCycle", selectedCycle);
      formData.append("paymentMethod", method);
      formData.append("transactionId", form.transactionId);
      formData.append("paymentScreenshot", screenshotFile);

      const apiBase = process.env.NEXT_PUBLIC_API_URL || "/api";
      const res = await axios.post(`${apiBase}/subscription/request`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      if (res.data && res.data.success) {
        trackApexEvent(APEX_EVENTS.CHECKOUT_SUBMIT, {
          plan: planInfo.id,
          cycle: planInfo.cycle,
          requestId: res.data.requestId,
        });
        trackApexEvent(APEX_EVENTS.CHECKOUT_SUCCESS, { requestId: res.data.requestId });
        window.location.href = `/apex/payment-pending?requestId=${res.data.requestId}`;
      } else {
        setErrorMsg(res.data.message || "Failed to submit request.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Connection to API gateway failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#020510] px-6 py-20 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-cyan-200">
            <ShieldCheck size={16} />
            Secure Subscription Checkout
          </div>

          <h1 className="mt-6 text-4xl font-semibold md:text-6xl">
            Activate your APEX subscription
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-slate-300">
            Payment submit karne ke baad Super Admin verification karega aur
            school tenant activate ho jaye ga.
          </p>
        </div>

        {(gatewayStatus?.jazzcashReady || gatewayStatus?.easypaisaReady || gatewayStatus?.stripeReady) && (
          <div className="mx-auto mb-6 max-w-3xl rounded-xl border border-cyan-400/25 bg-cyan-400/10 px-5 py-4 text-center text-sm text-cyan-100">
            {gatewayStatus?.message || "Live checkout is available. Pay instantly or upload a screenshot for manual verification."}
          </div>
        )}

        {errorMsg && (
          <div className="mx-auto mb-8 max-w-3xl rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center text-red-300 font-semibold">
            {errorMsg}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Form */}
          <motion.form
            ref={formRef}
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-7 backdrop-blur-xl"
          >
            <h2 className="mb-6 text-2xl font-semibold">School Details</h2>

            <div className="grid gap-5 md:grid-cols-2">
              <input required name="schoolName" className="inputBox" placeholder="School Name" value={form.schoolName} onChange={e => updateField("schoolName", e.target.value)} />
              <input required name="ownerName" className="inputBox" placeholder="Owner Name" value={form.ownerName} onChange={e => updateField("ownerName", e.target.value)} />
              <input required name="phone" className="inputBox" placeholder="Phone Number" value={form.phone} onChange={e => updateField("phone", e.target.value)} />
              <input required name="email" type="email" className="inputBox" placeholder="Email Address" value={form.email} onChange={e => updateField("email", e.target.value)} />
              <input required name="city" className="inputBox" placeholder="City" value={form.city} onChange={e => updateField("city", e.target.value)} />
              <input required name="address" className="inputBox" placeholder="School Address" value={form.address} onChange={e => updateField("address", e.target.value)} />
              <input readOnly className="inputBox cursor-not-allowed bg-white/5 md:col-span-2" value={`${planInfo.name} - ${planInfo.cycle}`} />
            </div>

            <h2 className="mb-5 mt-8 text-2xl font-semibold">
              Payment Method
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              {paymentMethods.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setMethod(item.id)}
                    className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                      method === item.id
                        ? "border-cyan-300 bg-cyan-300/10"
                        : "border-white/10 bg-white/[0.04]"
                    }`}
                  >
                    <Icon className="text-cyan-300" size={22} />
                    <span className="flex flex-1 flex-col">
                      <span className="font-medium">{item.title}</span>
                      {item.id === "jazzcash" && gatewayStatus?.jazzcashReady && (
                        <span className="text-xs text-emerald-300">Live checkout</span>
                      )}
                      {item.id === "easypaisa" && gatewayStatus?.easypaisaReady && (
                        <span className="text-xs text-emerald-300">Live checkout</span>
                      )}
                      {item.id === "card" && gatewayStatus?.stripeReady && (
                        <span className="text-xs text-violet-300">Stripe ready</span>
                      )}
                      {item.id === "bank" && gatewayStatus?.bankDetailsReady && (
                        <span className="text-xs text-emerald-300">Account published</span>
                      )}
                      {item.id === "bank" && gatewayStatus && !gatewayStatus.bankDetailsReady && (
                        <span className="text-xs text-amber-300/90">Contact support</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {method === "bank" && (
              <ApexBankTransferPanel
                amountStr={planInfo.amountStr}
                schoolName={form.schoolName}
                bankReady={gatewayStatus?.bankDetailsReady !== false}
              />
            )}

            <ApexGatewaySandboxPanel gatewayStatus={gatewayStatus} method={method} />

            {method === "card" && !stripeLive && (
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm text-slate-300">
                Card payments use manual verification. Pay via your bank card app or POS, then upload the receipt screenshot below.
              </div>
            )}

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <input 
                readOnly 
                className="inputBox cursor-not-allowed bg-white/5" 
                value={planInfo.amount ? `${planInfo.amountStr}` : ""} 
                placeholder="Amount" 
              />
              <input
                className="inputBox"
                placeholder={gatewayLive ? "Transaction ID (optional)" : "Transaction ID"}
                required={!gatewayLive}
                value={form.transactionId}
                onChange={e => updateField("transactionId", e.target.value)}
              />
            </div>

            {!gatewayLive && (
              <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-cyan-300/35 bg-cyan-300/[0.05] p-8 text-center transition hover:border-cyan-300/60">
                <Upload className="mb-3 text-cyan-300" />
                <span className="font-medium">{screenshotName || "Upload Payment Screenshot"}</span>
                <span className="mt-1 text-sm text-slate-400">
                  PNG, JPG or PDF proof
                </span>
                <input required type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileChange} />
              </label>
            )}

            {gatewayLive ? (
              <div className="mt-8 space-y-3">
                <button
                  type="button"
                  disabled={loading}
                  onClick={
                    jazzcashLive
                      ? handleJazzCashPay
                      : easypaisaLive
                        ? handleEasyPaisaPay
                        : handleStripePay
                  }
                  className="group flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100 disabled:opacity-50"
                >
                  {loading
                    ? `Redirecting to ${jazzcashLive ? "JazzCash" : easypaisaLive ? "EasyPaisa" : "Stripe"}…`
                    : `Pay with ${jazzcashLive ? "JazzCash" : easypaisaLive ? "EasyPaisa" : "Card (Stripe)"}`}
                  <ArrowRight size={17} className="transition group-hover:translate-x-1" />
                </button>
                <p className="text-center text-xs text-slate-400">
                  Or upload a screenshot below for manual verification.
                </p>
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-white/[0.03] p-6 text-center transition hover:border-cyan-300/40">
                  <Upload className="mb-2 text-cyan-300" size={20} />
                  <span className="text-sm font-medium">{screenshotName || "Upload screenshot (manual)"}</span>
                  <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileChange} />
                </label>
                {screenshotFile && (
                  <button
                    type="submit"
                    disabled={loading}
                    className="group flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-50"
                  >
                    {loading ? "Submitting…" : "Submit screenshot for verification"}
                  </button>
                )}
              </div>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="group mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100 disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit for Verification"}
                <ArrowRight size={17} className="transition group-hover:translate-x-1" />
              </button>
            )}
          </motion.form>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="h-fit rounded-[2rem] border border-white/10 bg-white/[0.06] p-7 backdrop-blur-xl"
          >
            <h2 className="text-2xl font-semibold">Order Summary</h2>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between text-slate-300">
                <span>Plan</span>
                <span>{planInfo.name}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>Billing</span>
                <span>{planInfo.cycle}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>Payment</span>
                <span className="capitalize">{METHOD_LABELS[method] || method}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>Status</span>
                <span className={gatewayLive ? "text-emerald-300" : "text-yellow-300"}>
                  {gatewayLive ? "Live gateway" : "Manual verification"}
                </span>
              </div>

              <div className="h-px bg-white/10" />

              <div className="flex justify-between text-xl font-semibold">
                <span>Total</span>
                <span>{planInfo.amountStr}</span>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.07] p-5">
              <p className="text-sm leading-6 text-slate-300">
                Payment verify hone ke baad school account active hoga,
                credentials generate honge aur admin apne isolated tenant mein
                login kar sakega.
              </p>
            </div>

            <div className="mt-5">
              <ApexCheckoutSupport context="checkout" planName={planInfo.name} />
            </div>
          </motion.div>
        </div>
      </div>

      {gatewayRedirect && (
        <JazzCashRedirect
          endpoint={gatewayRedirect.endpoint}
          fields={gatewayRedirect.fields}
          onError={(msg) => setErrorMsg(msg)}
        />
      )}

      <style jsx>{`
        .inputBox {
          width: 100%;
          border-radius: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.05);
          padding: 0.95rem 1rem;
          color: white;
          outline: none;
        }

        .inputBox::placeholder {
          color: rgba(203, 213, 225, 0.65);
        }

        .inputBox:focus {
          border-color: rgba(103, 232, 249, 0.65);
        }
      `}</style>
    </main>
  );
}

export default function PaymentCheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#020510] text-white">
          <p className="text-slate-400">Loading checkout…</p>
        </main>
      }
    >
      <PaymentCheckoutForm />
    </Suspense>
  );
}
