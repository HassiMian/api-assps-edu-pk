"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CreditCard,
  FlaskConical,
  Inbox,
  Users,
} from "lucide-react";

type SubStats = {
  pending: number;
  paymentConfirmed: number;
  approved: number;
  revenuePendingPkr: number;
  revenueApprovedPkr: number;
};

type LeadStats = {
  new: number;
  total: number;
};

type SchoolStats = {
  active: number;
  total: number;
  mrrEstimatePkr: number;
};

type GatewayStatus = {
  jazzcashReady: boolean;
  easypaisaReady: boolean;
  stripeReady: boolean;
  bankDetailsReady: boolean;
  message?: string;
};

export default function SaasAdminHubPage() {
  const [subStats, setSubStats] = useState<SubStats | null>(null);
  const [leadStats, setLeadStats] = useState<LeadStats | null>(null);
  const [schoolStats, setSchoolStats] = useState<SchoolStats | null>(null);
  const [gateway, setGateway] = useState<GatewayStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [subRes, leadRes, gwRes, schoolRes] = await Promise.all([
          fetch("/api/saas-admin/subscription-requests/stats", { cache: "no-store" }),
          fetch("/api/saas-admin/apex-leads/stats", { cache: "no-store" }),
          fetch("/api/payment/gateway-status", { cache: "no-store" }),
          fetch("/api/saas-admin/schools", { cache: "no-store" }).catch(() => null),
        ]);

        const subJson = await subRes.json();
        if (subJson.success) setSubStats(subJson.data);

        const leadJson = await leadRes.json();
        if (leadJson.success) setLeadStats(leadJson.data);

        const gwJson = await gwRes.json();
        if (gwJson.success) setGateway(gwJson.data);

        if (schoolRes?.ok) {
          const schoolJson = await schoolRes.json();
          if (schoolJson.success && schoolJson.stats) {
            setSchoolStats(schoolJson.stats);
          }
        }
      } catch {
        // partial load ok
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const liveGateways = (
    [
      gateway?.jazzcashReady ? "JazzCash" : null,
      gateway?.easypaisaReady ? "EasyPaisa" : null,
      gateway?.stripeReady ? "Stripe" : null,
      gateway?.bankDetailsReady ? "Bank" : null,
    ] as (string | null)[]
  ).filter((name): name is string => Boolean(name));

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">APEX Platform</p>
          <h1 className="text-3xl font-bold">SaaS Admin Hub</h1>
          <p className="mt-1 text-slate-400">
            Subscriptions, leads, active schools and payment gateways — one place.
          </p>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/10 p-8 text-center text-slate-300">
            Loading dashboard…
          </div>
        ) : (
          <>
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: "Pending verification",
                  value: subStats?.pending ?? 0,
                  tone: "text-yellow-200",
                  href: "/saas-admin/subscription-requests?status=PENDING",
                },
                {
                  label: "Payment confirmed",
                  value: subStats?.paymentConfirmed ?? 0,
                  tone: "text-cyan-200",
                  href: "/saas-admin/subscription-requests?status=PAYMENT_CONFIRMED",
                },
                {
                  label: "New leads",
                  value: leadStats?.new ?? 0,
                  tone: "text-violet-200",
                  href: "/saas-admin/apex-leads?status=new",
                },
                {
                  label: "Active schools",
                  value: schoolStats?.active ?? "—",
                  tone: "text-emerald-200",
                  href: "/saas-admin/schools",
                },
              ].map((card) => (
                <Link
                  key={card.label}
                  href={card.href}
                  className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 transition hover:border-cyan-400/20 hover:bg-white/[0.08]"
                >
                  <p className="text-xs uppercase tracking-wide text-slate-500">{card.label}</p>
                  <p className={`mt-1 text-3xl font-bold ${card.tone}`}>{card.value}</p>
                </Link>
              ))}
            </div>

            {(subStats?.revenuePendingPkr ?? 0) > 0 || (subStats?.revenueApprovedPkr ?? 0) > 0 ? (
              <div className="mb-8 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
                  <p className="text-sm text-slate-400">Revenue pending verification</p>
                  <p className="mt-1 text-xl font-bold text-cyan-200">
                    Rs {(subStats?.revenuePendingPkr ?? 0).toLocaleString()}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
                  <p className="text-sm text-slate-400">Revenue approved (MRR est.)</p>
                  <p className="mt-1 text-xl font-bold text-emerald-200">
                    Rs {(schoolStats?.mrrEstimatePkr ?? subStats?.revenueApprovedPkr ?? 0).toLocaleString()}
                  </p>
                </div>
              </div>
            ) : null}

            <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Subscription requests",
                  desc: "Review payments, approve schools, export CSV.",
                  href: "/saas-admin/subscription-requests",
                  icon: CreditCard,
                  badge: (subStats?.pending ?? 0) > 0 ? `${subStats?.pending} pending` : null,
                },
                {
                  title: "Demo & contact leads",
                  desc: "Inbound demo, enterprise and contact form leads.",
                  href: "/saas-admin/apex-leads?status=new",
                  icon: Inbox,
                  badge: (leadStats?.new ?? 0) > 0 ? `${leadStats?.new} new` : null,
                },
                {
                  title: "Active schools",
                  desc: "Manage tenant schools, plans and status.",
                  href: "/saas-admin/schools",
                  icon: Building2,
                  badge: schoolStats ? `${schoolStats.active} active` : null,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group rounded-2xl border border-white/10 bg-white/[0.05] p-5 transition hover:border-cyan-400/25 hover:bg-white/[0.08]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <Icon className="h-6 w-6 text-cyan-300" />
                      {item.badge && (
                        <span className="rounded-full bg-cyan-400/15 px-2 py-0.5 text-xs font-semibold text-cyan-200">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <h2 className="mt-4 text-lg font-bold">{item.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{item.desc}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-cyan-200">
                      Open <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                );
              })}
            </div>

            {gateway && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <FlaskConical size={18} className="text-amber-200" />
                    <p className="text-sm font-semibold">Payment gateways</p>
                  </div>
                  <Link
                    href="/saas-admin/subscription-requests"
                    className="text-xs font-semibold text-cyan-200 hover:text-cyan-100"
                  >
                    Gateway setup →
                  </Link>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {liveGateways.length > 0 ? (
                    liveGateways.map((name) => (
                      <span
                        key={name}
                        className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200"
                      >
                        {name}: Live
                      </span>
                    ))
                  ) : (
                    <span className="rounded-full bg-amber-400/15 px-3 py-1 text-xs font-semibold text-amber-200">
                      Manual verification mode
                    </span>
                  )}
                </div>
                {gateway.message && (
                  <p className="mt-3 text-sm text-slate-400">{gateway.message}</p>
                )}
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-3 text-sm">
              <a
                href="/apex/checkout?plan=professional&cycle=monthly"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-semibold text-slate-200 hover:bg-white/10"
              >
                Test checkout ↗
              </a>
              <a
                href="/apex"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-semibold text-slate-200 hover:bg-white/10"
              >
                View gateway ↗
              </a>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
