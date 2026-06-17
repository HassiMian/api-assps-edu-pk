"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type LeadItem = {
  leadId: string;
  type: "demo" | "contact" | "register" | "enterprise";
  status: "new" | "contacted" | "archived";
  name: string;
  email: string;
  phone: string;
  schoolName?: string;
  city?: string;
  studentsCount?: string;
  notes?: string;
  created_at: string;
};

const TYPE_LABELS: Record<string, string> = {
  demo: "Demo request",
  contact: "Contact",
  register: "Register school",
  enterprise: "Enterprise",
};

const STATUS_TONE: Record<string, string> = {
  new: "bg-cyan-400/20 text-cyan-200",
  contacted: "bg-emerald-400/20 text-emerald-200",
  archived: "bg-slate-500/20 text-slate-300",
};

type LeadStats = {
  total: number;
  new: number;
  contacted: number;
  archived: number;
  byType: Record<string, number>;
};

const LEAD_STATUS_OPTIONS = ["new", "contacted", "archived", "ALL"] as const;

function resolveLeadStatusParam(value: string | null) {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "all") return "ALL";
  return LEAD_STATUS_OPTIONS.includes(normalized as (typeof LEAD_STATUS_OPTIONS)[number])
    ? normalized
    : "new";
}

function updateLeadStatusUrl(
  router: ReturnType<typeof useRouter>,
  searchParams: ReturnType<typeof useSearchParams>,
  nextStatus: string
) {
  const params = new URLSearchParams(searchParams.toString());
  params.set("status", nextStatus);
  router.replace(`?${params.toString()}`, { scroll: false });
}

function ApexLeadsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [leadStats, setLeadStats] = useState<LeadStats | null>(null);
  const [status, setStatus] = useState(() => resolveLeadStatusParam(searchParams.get("status")));
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [emailingId, setEmailingId] = useState<string | null>(null);

  useEffect(() => {
    setStatus(resolveLeadStatusParam(searchParams.get("status")));
  }, [searchParams]);

  async function loadLeads(selectedStatus = status) {
    setLoading(true);
    try {
      const res = await fetch(`/api/saas-admin/apex-leads?status=${selectedStatus}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (data.success) setLeads(data.data);
    } catch (err) {
      console.error("Failed to load leads:", err);
    } finally {
      setLoading(false);
    }
  }

  async function exportCsv() {
    setExporting(true);
    try {
      const res = await fetch(
        `/api/saas-admin/apex-leads/export?status=${encodeURIComponent(status)}`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `apex-leads-${status.toLowerCase()}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Could not export leads CSV.");
    } finally {
      setExporting(false);
    }
  }

  async function sendFollowUp(leadId: string) {
    setEmailingId(leadId);
    try {
      const res = await fetch(`/api/saas-admin/apex-leads/${leadId}/follow-up`, {
        method: "POST",
      });
      const data = await res.json();
      alert(data.message || (data.success ? "Email sent" : "Email failed"));
    } catch {
      alert("Could not send follow-up email.");
    } finally {
      setEmailingId(null);
    }
  }

  async function updateStatus(leadId: string, nextStatus: LeadItem["status"]) {
    setUpdatingId(leadId);
    try {
      const res = await fetch(`/api/saas-admin/apex-leads/${leadId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        await loadLeads(status);
      } else {
        alert(data.message || "Update failed");
      }
    } catch {
      alert("Could not update lead status.");
    } finally {
      setUpdatingId(null);
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

  useEffect(() => {
    loadLeads(status);
    loadLeadStats();
  }, [status]);

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">APEX Admin</p>
            <h1 className="text-3xl font-bold">Demo & Contact Leads</h1>
            <p className="mt-1 text-slate-400">
              Inbound requests from demo, contact, register-school and enterprise forms.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/saas-admin"
              className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Hub
            </Link>

            <Link
              href="/saas-admin/subscription-requests"
              className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/15"
            >
              Subscriptions
            </Link>

            <Link
              href="/saas-admin/schools"
              className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/15"
            >
              Schools
            </Link>

            <select
              value={status}
              onChange={(e) => {
                const nextStatus = e.target.value;
                setStatus(nextStatus);
                updateLeadStatusUrl(router, searchParams, nextStatus);
              }}
              className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 outline-none"
            >
              <option className="text-black" value="new">
                New
              </option>
              <option className="text-black" value="contacted">
                Contacted
              </option>
              <option className="text-black" value="archived">
                Archived
              </option>
              <option className="text-black" value="ALL">
                All leads
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
          </div>
        </div>

        {leadStats && (
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Total", leadStats.total, "text-white"],
              ["New", leadStats.new, "text-cyan-200"],
              ["Contacted", leadStats.contacted, "text-emerald-200"],
              ["Archived", leadStats.archived, "text-slate-300"],
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

        {leadStats && Object.keys(leadStats.byType).length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {Object.entries(leadStats.byType).map(([type, count]) => (
              <span
                key={type}
                className="rounded-full bg-violet-400/15 px-3 py-1 text-xs font-semibold text-violet-200"
              >
                {TYPE_LABELS[type] || type} · {count}
              </span>
            ))}
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/10 p-8 text-center text-slate-300">
            Loading leads...
          </div>
        ) : leads.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/10 p-8 text-center text-slate-300">
            No leads in this filter.
          </div>
        ) : (
          <div className="grid gap-5">
            {leads.map((lead) => (
              <div
                key={lead.leadId}
                className="rounded-3xl border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur-xl"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-bold">{lead.name}</h2>
                  <span className="rounded-full bg-violet-400/20 px-3 py-1 text-xs font-semibold text-violet-200">
                    {TYPE_LABELS[lead.type] || lead.type}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_TONE[lead.status] || STATUS_TONE.new}`}
                  >
                    {lead.status}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-slate-300 md:grid-cols-2">
                  <p>
                    <span className="text-slate-500">Lead ID:</span>{" "}
                    <span className="font-mono text-xs">{lead.leadId}</span>
                  </p>
                  <p>
                    <span className="text-slate-500">Submitted:</span>{" "}
                    {new Date(lead.created_at).toLocaleString()}
                  </p>
                  <p>
                    <span className="text-slate-500">Email:</span> {lead.email}
                  </p>
                  <p>
                    <span className="text-slate-500">Phone:</span> {lead.phone}
                  </p>
                  {lead.schoolName && (
                    <p>
                      <span className="text-slate-500">School:</span> {lead.schoolName}
                    </p>
                  )}
                  {lead.city && (
                    <p>
                      <span className="text-slate-500">City:</span> {lead.city}
                    </p>
                  )}
                  {lead.studentsCount && (
                    <p>
                      <span className="text-slate-500">Students:</span> {lead.studentsCount}
                    </p>
                  )}
                  {lead.notes && (
                    <p className="md:col-span-2">
                      <span className="text-slate-500">Notes:</span> {lead.notes}
                    </p>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={emailingId === lead.leadId}
                    onClick={() => sendFollowUp(lead.leadId)}
                    className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/15 disabled:opacity-50"
                  >
                    {emailingId === lead.leadId ? "Sending…" : "Send follow-up email"}
                  </button>
                  {lead.status !== "contacted" && (
                    <button
                      type="button"
                      disabled={updatingId === lead.leadId}
                      onClick={() => updateStatus(lead.leadId, "contacted")}
                      className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
                    >
                      Mark contacted
                    </button>
                  )}
                  {lead.status !== "archived" && (
                    <button
                      type="button"
                      disabled={updatingId === lead.leadId}
                      onClick={() => updateStatus(lead.leadId, "archived")}
                      className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 disabled:opacity-50"
                    >
                      Archive
                    </button>
                  )}
                  {lead.status !== "new" && (
                    <button
                      type="button"
                      disabled={updatingId === lead.leadId}
                      onClick={() => updateStatus(lead.leadId, "new")}
                      className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/15 disabled:opacity-50"
                    >
                      Reopen
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function ApexLeadsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-950 p-6 text-white">
          <div className="mx-auto max-w-7xl rounded-3xl border border-white/10 bg-white/10 p-8 text-center text-slate-300">
            Loading leads…
          </div>
        </main>
      }
    >
      <ApexLeadsContent />
    </Suspense>
  );
}
