"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  formatPaymentMethodLabel,
  isLiveGatewayMethod,
  paymentMethodBadgeTone,
} from "@/lib/payment-method-labels";

type RequestItem = {
  id: string;
  requestId: string;
  planName: string;
  planPrice: number;
  billingCycle: string;
  ownerName: string;
  schoolName: string;
  schoolAddress: string;
  contactNumber: string;
  email: string;
  paymentMethod: string;
  transactionId?: string;
  paymentScreenshotUrl?: string;
  status: "PENDING" | "PAYMENT_CONFIRMED" | "APPROVED" | "REJECTED";
  createdAt: string;
  source?: "db" | "file";
};

type Stats = {
  total: number;
  pending: number;
  paymentConfirmed: number;
  approved: number;
  rejected: number;
  revenuePendingPkr: number;
  revenueApprovedPkr: number;
  byPaymentMethod?: Record<string, number>;
};

type GatewayStatus = {
  jazzcashReady: boolean;
  easypaisaReady: boolean;
  stripeReady: boolean;
  bankDetailsReady: boolean;
  message?: string;
};

type GatewayCheck = {
  ready: boolean;
  missing: string[];
  notes?: string[];
};

type SetupChecklist = {
  jazzcash: GatewayCheck;
  easypaisa: GatewayCheck;
  stripe: GatewayCheck;
  bank: GatewayCheck;
  smtp: GatewayCheck;
  database: GatewayCheck;
  autoApproveGatewayPayments: boolean;
  paymentsNotifyEmail: boolean;
};

const STATUS_OPTIONS = ["PENDING", "PAYMENT_CONFIRMED", "APPROVED", "REJECTED", "ALL"] as const;

function resolveStatusParam(value: string | null) {
  const normalized = String(value || "").toUpperCase();
  return STATUS_OPTIONS.includes(normalized as (typeof STATUS_OPTIONS)[number])
    ? normalized
    : "PENDING";
}

function updateSubscriptionStatusUrl(
  router: ReturnType<typeof useRouter>,
  searchParams: ReturnType<typeof useSearchParams>,
  nextStatus: string
) {
  const params = new URLSearchParams(searchParams.toString());
  params.set("status", nextStatus);
  router.replace(`?${params.toString()}`, { scroll: false });
}

function SubscriptionRequestsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [gateway, setGateway] = useState<GatewayStatus | null>(null);
  const [setup, setSetup] = useState<SetupChecklist | null>(null);
  const [sandboxGuide, setSandboxGuide] = useState<Record<string, unknown> | null>(null);
  const [leadStats, setLeadStats] = useState<{ new: number } | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [bulkApproving, setBulkApproving] = useState(false);
  const [status, setStatus] = useState(() => resolveStatusParam(searchParams.get("status")));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setStatus(resolveStatusParam(searchParams.get("status")));
  }, [searchParams]);

  async function loadRequests(selectedStatus = status) {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/saas-admin/subscription-requests?status=${selectedStatus}`,
        { cache: "no-store" }
      );

      const data = await res.json();

      if (data.success) {
        setRequests(data.data);
      }
    } catch (err) {
      console.error("Failed to load requests:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const res = await fetch("/api/saas-admin/subscription-requests/stats", {
        cache: "no-store",
      });
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch {
      // non-blocking
    }
  }

  async function loadGatewayStatus() {
    try {
      const res = await fetch("/api/payment/gateway-status", { cache: "no-store" });
      const data = await res.json();
      if (data.success) setGateway(data.data);
    } catch {
      // non-blocking
    }
  }

  async function loadSetupChecklist() {
    try {
      const res = await fetch("/api/saas-admin/gateway-setup", { cache: "no-store" });
      const data = await res.json();
      if (data.success) setSetup(data.data);
    } catch {
      // non-blocking
    }
  }

  async function loadSandboxGuide() {
    try {
      const res = await fetch("/api/saas-admin/gateway-sandbox", { cache: "no-store" });
      const data = await res.json();
      if (data.success) setSandboxGuide(data.data);
    } catch {
      // non-blocking
    }
  }

  async function loadLeadStats() {
    try {
      const res = await fetch("/api/saas-admin/apex-leads/stats", { cache: "no-store" });
      const data = await res.json();
      if (data.success) setLeadStats(data.data);
    } catch {
      // non-blocking
    }
  }

  async function bulkApproveConfirmed() {
    const count = stats?.paymentConfirmed ?? 0;
    if (count === 0) {
      alert("No payment-confirmed requests to approve.");
      return;
    }

    const ok = confirm(
      `Approve all ${count} payment-confirmed requests and generate school credentials?`
    );
    if (!ok) return;

    setBulkApproving(true);
    try {
      const res = await fetch("/api/saas-admin/subscription-requests/bulk-approve", {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || "Bulk approve completed.");
        await loadRequests(status);
        await loadStats();
      } else {
        alert(data.message || "Bulk approve failed.");
      }
    } catch {
      alert("Bulk approve request failed.");
    } finally {
      setBulkApproving(false);
    }
  }

  async function exportCsv() {
    setExporting(true);
    try {
      const res = await fetch(
        `/api/saas-admin/subscription-requests/export?status=${encodeURIComponent(status)}`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `apex-subscription-requests-${status.toLowerCase()}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("CSV export failed:", err);
      alert("Could not export CSV. Check admin login and try again.");
    } finally {
      setExporting(false);
    }
  }

  useEffect(() => {
    loadRequests(status);
    loadStats();
    loadGatewayStatus();
    loadSetupChecklist();
    loadSandboxGuide();
    loadLeadStats();
  }, [status]);

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold">Subscription Requests</h1>
            <p className="mt-1 text-slate-400">
              Review school subscription requests, payment screenshots and status.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/saas-admin/schools"
              className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/15"
            >
              Active Schools
            </Link>

            <Link
              href="/saas-admin"
              className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Hub
            </Link>

            <Link
              href="/saas-admin/apex-leads"
              className="inline-flex items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-400/10 px-4 py-3 text-sm font-semibold text-violet-100 transition hover:bg-violet-400/15"
            >
              Leads
              {(leadStats?.new ?? 0) > 0 && (
                <span className="rounded-full bg-cyan-400/20 px-2 py-0.5 text-xs text-cyan-200">
                  {leadStats?.new} new
                </span>
              )}
            </Link>

            <select
              value={status}
              onChange={(e) => {
                const nextStatus = e.target.value;
                setStatus(nextStatus);
                updateSubscriptionStatusUrl(router, searchParams, nextStatus);
              }}
              className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 outline-none"
            >
              <option className="text-black" value="PENDING">
                Pending (manual)
              </option>
              <option className="text-black" value="PAYMENT_CONFIRMED">
                Payment confirmed
              </option>
              <option className="text-black" value="APPROVED">
                Approved
              </option>
              <option className="text-black" value="REJECTED">
                Rejected
              </option>
              <option className="text-black" value="ALL">
                All Requests
              </option>
            </select>

            <button
              type="button"
              onClick={exportCsv}
              disabled={exporting}
              className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20 disabled:opacity-50"
            >
              {exporting ? "Exporting…" : "Export CSV"}
            </button>

            <button
              type="button"
              onClick={() => setShowSetup((open) => !open)}
              className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/15"
            >
              {showSetup ? "Hide setup" : "Gateway setup"}
            </button>

            {(stats?.paymentConfirmed ?? 0) > 0 && (
              <button
                type="button"
                onClick={bulkApproveConfirmed}
                disabled={bulkApproving}
                className="rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
              >
                {bulkApproving
                  ? "Approving…"
                  : `Approve all confirmed (${stats?.paymentConfirmed})`}
              </button>
            )}
          </div>
        </div>

        {stats && (
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ["Total", stats.total, "text-white"],
              ["Pending", stats.pending, "text-yellow-200"],
              ["Confirmed", stats.paymentConfirmed, "text-cyan-200"],
              ["Approved", stats.approved, "text-emerald-200"],
              ["Rejected", stats.rejected, "text-red-200"],
            ].map(([label, value, color]) => (
              <div
                key={label}
                className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-4"
              >
                <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
                <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        )}

        {stats && (
          <div className="mb-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4">
              <p className="text-sm text-slate-400">Revenue pending verification</p>
              <p className="mt-1 text-xl font-bold text-cyan-200">
                Rs {stats.revenuePendingPkr.toLocaleString()}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4">
              <p className="text-sm text-slate-400">Revenue approved (tenants)</p>
              <p className="mt-1 text-xl font-bold text-emerald-200">
                Rs {stats.revenueApprovedPkr.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {showSetup && setup && (
          <div className="mb-8 rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.04] px-5 py-5">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">VPS setup checklist</p>
            <p className="mt-2 text-sm text-slate-400">
              Env keys only — values are never shown. Edit `/var/www/apex-connect/.env` then restart PM2.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {(
                [
                  ["JazzCash", setup.jazzcash],
                  ["EasyPaisa", setup.easypaisa],
                  ["Stripe", setup.stripe],
                  ["Bank transfer", setup.bank],
                  ["SMTP email", setup.smtp],
                  ["PostgreSQL", setup.database],
                ] as [string, GatewayCheck][]
              ).map(([label, check]) => (
                <div
                  key={label}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-white">{label}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        check.ready
                          ? "bg-emerald-400/15 text-emerald-200"
                          : "bg-amber-400/15 text-amber-200"
                      }`}
                    >
                      {check.ready ? "Ready" : "Needs config"}
                    </span>
                  </div>
                  {!check.ready && check.missing.length > 0 && (
                    <p className="mt-2 font-mono text-xs text-amber-100/90">
                      {check.missing.join(", ")}
                    </p>
                  )}
                  {check.notes?.[0] && (
                    <p className="mt-2 text-xs text-slate-500">{check.notes[0]}</p>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span
                className={`rounded-full px-3 py-1 font-semibold ${
                  setup.autoApproveGatewayPayments
                    ? "bg-emerald-400/15 text-emerald-200"
                    : "bg-slate-500/15 text-slate-400"
                }`}
              >
                Auto-approve: {setup.autoApproveGatewayPayments ? "On" : "Off"}
              </span>
              <span
                className={`rounded-full px-3 py-1 font-semibold ${
                  setup.paymentsNotifyEmail
                    ? "bg-emerald-400/15 text-emerald-200"
                    : "bg-slate-500/15 text-slate-400"
                }`}
              >
                Payment notify email: {setup.paymentsNotifyEmail ? "Set" : "Missing"}
              </span>
            </div>

            {sandboxGuide && (
              <div className="mt-5 rounded-xl border border-amber-400/15 bg-amber-400/[0.04] px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-amber-200/80">Sandbox test flow</p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {(["jazzcash", "easypaisa", "stripe"] as const).map((key) => {
                    const block = sandboxGuide[key] as {
                      configured?: boolean;
                      env?: string;
                      callbackUrl?: string;
                      returnUrl?: string;
                      webhookUrl?: string;
                      steps?: string[];
                    };
                    if (!block) return null;
                    const label = key === "jazzcash" ? "JazzCash" : key === "easypaisa" ? "EasyPaisa" : "Stripe";
                    return (
                      <div key={key} className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-3 text-xs text-slate-300">
                        <p className="font-semibold text-white">
                          {label}{" "}
                          <span className="text-amber-200/80">
                            ({block.env || "configured"})
                          </span>
                        </p>
                        {block.callbackUrl && (
                          <p className="mt-1 font-mono text-[10px] text-slate-500">{block.callbackUrl}</p>
                        )}
                        {block.returnUrl && (
                          <p className="mt-1 font-mono text-[10px] text-slate-500">{block.returnUrl}</p>
                        )}
                        {block.webhookUrl && (
                          <p className="mt-1 font-mono text-[10px] text-slate-500">{block.webhookUrl}</p>
                        )}
                        <ul className="mt-2 space-y-1 leading-5">
                          {(block.steps || []).slice(0, 2).map((step) => (
                            <li key={step}>• {step}</li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {gateway && (
          <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Gateway health</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(
                [
                  ["JazzCash", gateway.jazzcashReady],
                  ["EasyPaisa", gateway.easypaisaReady],
                  ["Stripe", gateway.stripeReady],
                  ["Bank details", gateway.bankDetailsReady],
                ] as [string, boolean][]
              ).map(([label, ready]) => (
                <span
                  key={label}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    ready
                      ? "bg-emerald-400/15 text-emerald-200"
                      : "bg-slate-500/15 text-slate-400"
                  }`}
                >
                  {label}: {ready ? "Live" : "Off"}
                </span>
              ))}
            </div>
            {gateway.message && (
              <p className="mt-3 text-sm text-slate-400">{gateway.message}</p>
            )}
          </div>
        )}

        {stats?.byPaymentMethod && Object.keys(stats.byPaymentMethod).length > 0 && (
          <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">By payment method</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(stats.byPaymentMethod).map(([method, count]) => (
                <span
                  key={method}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentMethodBadgeTone(method)}`}
                >
                  {formatPaymentMethodLabel(method)} · {count}
                </span>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/10 p-8 text-center text-slate-300">
            Loading requests...
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/10 p-8 text-center text-slate-300">
            No requests found.
          </div>
        ) : (
          <div className="grid gap-5">
            {requests.map((req) => (
              <div
                key={req.id}
                className="rounded-3xl border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur-xl"
              >
                <div className="grid gap-5 lg:grid-cols-[1fr_180px]">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-bold">{req.schoolName}</h2>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          req.status === "PAYMENT_CONFIRMED"
                            ? "bg-cyan-400/20 text-cyan-200"
                            : req.status === "PENDING"
                            ? "bg-yellow-400/20 text-yellow-200"
                            : req.status === "APPROVED"
                            ? "bg-emerald-400/20 text-emerald-200"
                            : "bg-red-400/20 text-red-200"
                        }`}
                      >
                        {req.status}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentMethodBadgeTone(req.paymentMethod)}`}
                      >
                        {formatPaymentMethodLabel(req.paymentMethod)}
                        {isLiveGatewayMethod(req.paymentMethod) ? " ✓" : ""}
                      </span>
                      {req.source === "file" && (
                        <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-semibold text-cyan-200">
                          FILE BACKUP
                        </span>
                      )}
                    </div>

                    <div className="mt-4 grid gap-3 text-sm text-slate-300 md:grid-cols-2">
                      <p>
                        <span className="text-slate-500">Request ID:</span>{" "}
                        <span className="font-mono text-xs">{req.requestId}</span>
                      </p>
                      <p>
                        <span className="text-slate-500">Owner:</span>{" "}
                        {req.ownerName}
                      </p>
                      <p>
                        <span className="text-slate-500">Email:</span>{" "}
                        {req.email}
                      </p>
                      <p>
                        <span className="text-slate-500">Contact:</span>{" "}
                        {req.contactNumber}
                      </p>
                      <p>
                        <span className="text-slate-500">Plan:</span>{" "}
                        {req.planName} / Rs {req.planPrice} ({req.billingCycle})
                      </p>
                      <p>
                        <span className="text-slate-500">Submitted:</span>{" "}
                        {new Date(req.createdAt).toLocaleString()}
                      </p>
                      {req.transactionId && (
                        <p>
                          <span className="text-slate-500">Txn ID:</span>{" "}
                          <span className="font-mono text-xs">{req.transactionId}</span>
                        </p>
                      )}
                      <p className="md:col-span-2">
                        <span className="text-slate-500">Address:</span>{" "}
                        {req.schoolAddress}
                      </p>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <a
                        href={`/saas-admin/subscription-requests/${req.id}`}
                        className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-200"
                      >
                        View Details
                      </a>

                      {req.paymentScreenshotUrl && (
                        <a
                          href={req.paymentScreenshotUrl}
                          target="_blank"
                          className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
                        >
                          Open Screenshot
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
                    {req.paymentScreenshotUrl ? (
                      <img
                        src={req.paymentScreenshotUrl}
                        alt="Payment Screenshot"
                        className="h-44 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-44 items-center justify-center text-sm text-slate-500">
                        No Screenshot
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function SubscriptionRequestsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-950 p-6 text-white">
          <div className="mx-auto max-w-7xl rounded-3xl border border-white/10 bg-white/10 p-8 text-center text-slate-300">
            Loading subscription requests…
          </div>
        </main>
      }
    >
      <SubscriptionRequestsContent />
    </Suspense>
  );
}
