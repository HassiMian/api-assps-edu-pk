"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Clock3,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Home,
  Headphones,
} from "lucide-react";
import { formatPlanPrice } from "./apexPlans";
import ApexCheckoutSupport from "./ApexCheckoutSupport";

const statusConfig = {
  pending: {
    icon: Clock3,
    title: "Payment Under Verification",
    desc: "Aapki payment request receive ho gai hai. Super Admin verification ke baad school subscription activate kar di jaye gi.",
    badge: "Pending Verification",
    color: "text-yellow-300",
    bg: "bg-yellow-300/10",
  },
  payment_confirmed: {
    icon: CheckCircle2,
    title: "Payment Received",
    desc: "Gateway payment confirm ho gai hai. Ab Super Admin school tenant activate karega aur credentials email par bhej dega.",
    badge: "Payment Confirmed",
    color: "text-cyan-300",
    bg: "bg-cyan-300/10",
  },
  success: {
    icon: CheckCircle2,
    title: "Subscription Activated",
    desc: "Payment verify ho gai hai. Aapka school tenant activate ho chuka hai aur admin credentials generate kar diye gaye hain.",
    badge: "Payment Approved",
    color: "text-emerald-300",
    bg: "bg-emerald-300/10",
  },
  failed: {
    icon: XCircle,
    title: "Payment Verification Failed",
    desc: "Payment verify nahi ho saki. Transaction details ya screenshot dobara check karein aur request resubmit karein.",
    badge: "Payment Rejected",
    color: "text-red-300",
    bg: "bg-red-300/10",
  },
};

function PaymentStatusContent({ status = "pending" }) {
  const searchParams = useSearchParams();
  const requestId = searchParams.get("requestId") || "—";
  const data = statusConfig[status] || statusConfig.pending;

  const [order, setOrder] = useState({
    planName: "—",
    amountStr: "—",
    billingCycle: "—",
    liveStatus: status,
  });
  const [loading, setLoading] = useState(Boolean(searchParams.get("requestId")));
  const [polling, setPolling] = useState(false);
  const redirectedRef = useRef(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    const id = searchParams.get("requestId");
    if (!id) return;

    const apiBase = process.env.NEXT_PUBLIC_API_URL || "/api";
    let cancelled = false;

    const stopPolling = () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setPolling(false);
    };

    const applyRequest = (d) => {
      const liveStatus = String(d.status || status).toLowerCase();
      setOrder({
        planName: d.planName || "Professional",
        amountStr: formatPlanPrice(d.planPrice),
        billingCycle: d.billingCycle || "monthly",
        liveStatus,
      });

      if (["approved", "rejected"].includes(liveStatus)) {
        stopPolling();
      }

      if (
        !redirectedRef.current &&
        liveStatus === "approved" &&
        (status === "pending" || status === "success")
      ) {
        redirectedRef.current = true;
        window.location.href = `/apex/payment-success?requestId=${encodeURIComponent(id)}&activated=1`;
      }
    };

    const fetchStatus = () => {
      fetch(`${apiBase}/subscription/request/${encodeURIComponent(id)}`)
        .then((res) => res.json())
        .then((json) => {
          if (cancelled || !json?.success || !json.data) return;
          applyRequest(json.data);
        })
        .catch(() => undefined)
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    };

    fetchStatus();

    const shouldPoll = status === "pending" || searchParams.get("gateway") === "confirmed";
    if (shouldPoll) {
      setPolling(true);
      intervalRef.current = window.setInterval(fetchStatus, 5000);
    }

    return () => {
      cancelled = true;
      stopPolling();
    };
  }, [searchParams, status]);

  const activated = searchParams.get("activated") === "1";

  const resolvedStatus =
    order.liveStatus === "approved" || activated
      ? statusConfig.success
      : order.liveStatus === "payment_confirmed"
        ? statusConfig.payment_confirmed
        : order.liveStatus === "rejected"
          ? statusConfig.failed
          : searchParams.get("gateway") === "confirmed"
            ? statusConfig.payment_confirmed
            : data;

  const liveBadge = resolvedStatus.badge;
  const ResolvedIcon = resolvedStatus.icon;

  const navigateTo = (url) => {
    window.location.href = url;
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#020510] px-6 py-20 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.12),transparent_45%)]" />

      <motion.div
        initial={{ opacity: 0, y: 35, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7 }}
        className="relative w-full max-w-2xl rounded-[2rem] border border-white/10 bg-white/[0.07] p-8 text-center shadow-2xl backdrop-blur-xl"
      >
        <div className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full ${resolvedStatus.bg}`}>
          <ResolvedIcon className={resolvedStatus.color} size={46} />
        </div>

        <div className={`mx-auto mt-6 w-fit rounded-full border border-white/10 px-4 py-2 text-sm font-medium ${resolvedStatus.color} ${resolvedStatus.bg}`}>
          {liveBadge}
        </div>

        <h1 className="mt-6 text-4xl font-semibold md:text-5xl">{resolvedStatus.title}</h1>

        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-300">{resolvedStatus.desc}</p>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-left">
          <div className="flex justify-between border-b border-white/10 pb-3 text-sm text-slate-300">
            <span>Request ID</span>
            <span className="font-mono text-xs sm:text-sm">{requestId}</span>
          </div>

          <div className="flex justify-between border-b border-white/10 py-3 text-sm text-slate-300">
            <span>Plan</span>
            <span>{loading ? "Loading…" : order.planName}</span>
          </div>

          <div className="flex justify-between border-b border-white/10 py-3 text-sm text-slate-300">
            <span>Billing</span>
            <span className="capitalize">{loading ? "—" : order.billingCycle}</span>
          </div>

          <div className="flex justify-between border-b border-white/10 py-3 text-sm text-slate-300">
            <span>Amount</span>
            <span>{loading ? "—" : order.amountStr}</span>
          </div>

          <div className="flex justify-between pt-3 text-sm text-slate-300">
            <span>Status</span>
            <span className={resolvedStatus.color}>{liveBadge}</span>
          </div>
        </div>

        {polling && !["approved", "rejected"].includes(order.liveStatus) && (
          <p className="mt-4 text-xs text-slate-500">
            {order.liveStatus === "payment_confirmed"
              ? "Payment confirmed — waiting for school activation…"
              : "Checking for payment updates…"}
          </p>
        )}

        <div className="mt-6 text-left">
          <ApexCheckoutSupport context="payment" requestId={requestId !== "—" ? requestId : undefined} />
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <button
            onClick={() => navigateTo("/apex")}
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100"
          >
            <Home size={17} />
            Back to Home
          </button>

          {status === "success" ? (
            <button
              onClick={() => navigateTo("/login")}
              className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Go to Login
              <ArrowRight size={17} className="transition group-hover:translate-x-1" />
            </button>
          ) : (
            <button
              onClick={() => navigateTo("/apex/contact")}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <Headphones size={17} />
              Contact Support
            </button>
          )}
        </div>
      </motion.div>
    </main>
  );
}

export default function PaymentStatusPage(props) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#020510] text-white">
          <p className="text-slate-400">Loading status…</p>
        </main>
      }
    >
      <PaymentStatusContent {...props} />
    </Suspense>
  );
}
