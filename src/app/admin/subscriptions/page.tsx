"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, FileText, ShieldCheck, XCircle } from "lucide-react";

const paymentRequests = [
  {
    school: "Al Noor Grammar School",
    tenantId: "tenant_alnoor_001",
    plan: "Professional",
    amount: "PKR 35,000",
    method: "JazzCash",
    status: "pending",
  },
  {
    school: "City Scholars Campus",
    tenantId: "tenant_city_002",
    plan: "Starter",
    amount: "PKR 15,000",
    method: "Bank Transfer",
    status: "active",
  },
  {
    school: "Future Heights School",
    tenantId: "tenant_future_003",
    plan: "Enterprise",
    amount: "Custom",
    method: "Manual Proof",
    status: "suspended",
  },
];

const statuses: Record<string, string> = {
  pending: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  active: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  suspended: "border-red-400/20 bg-red-400/10 text-red-200",
};

const summaryCards = [
  { label: "Pending", value: "12", icon: Clock },
  { label: "Active Schools", value: "48", icon: CheckCircle2 },
  { label: "Rejected", value: "3", icon: XCircle },
  { label: "Invoices", value: "126", icon: FileText },
];

export default function AdminSubscriptionsPage() {
  return (
    <DashboardLayout role="admin" title="Subscription Verification">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-6">
        <div className="glass-card p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3 text-cyan-200">
                <ShieldCheck className="h-6 w-6" />
                <span className="text-sm font-black uppercase tracking-[0.18em]">Super Admin Ready</span>
              </div>
              <h2 className="mt-3 text-2xl font-black text-white md:text-3xl">Payment verification and tenant activation</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-400">
                Backend-ready UI for approving payment proof, activating subscriptions, extending access, suspending schools and viewing invoice history.
              </p>
            </div>
            <button className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950">Create Manual Invoice</button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {summaryCards.map(({ label, value, icon: Icon }) => (
            <div key={label} className="glass-card p-5">
              <Icon className="h-5 w-5 text-cyan-300" />
              <div className="mt-4 text-2xl font-black text-white">{value}</div>
              <div className="text-sm text-slate-400">{label}</div>
            </div>
          ))}
        </div>

        <div className="glass-card overflow-hidden">
          <div className="grid grid-cols-6 gap-4 border-b border-white/10 p-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
            <span>School</span>
            <span>Tenant</span>
            <span>Plan</span>
            <span>Payment</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {paymentRequests.map((request) => (
            <div key={request.tenantId} className="grid grid-cols-1 gap-3 border-b border-white/5 p-4 text-sm text-slate-200 last:border-b-0 lg:grid-cols-6 lg:items-center">
              <span className="font-bold text-white">{request.school}</span>
              <span className="font-mono text-xs text-slate-400">{request.tenantId}</span>
              <span>{request.plan}</span>
              <span>{request.amount} / {request.method}</span>
              <span className={`w-fit rounded-full border px-3 py-1 text-xs font-black capitalize ${statuses[request.status]}`}>{request.status}</span>
              <span className="flex flex-wrap gap-2">
                <button className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-black text-emerald-200">Approve</button>
                <button className="rounded-full bg-red-400/15 px-3 py-1 text-xs font-black text-red-200">Reject</button>
                <button className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white">Extend</button>
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
