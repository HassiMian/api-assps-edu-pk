"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  formatPaymentMethodLabel,
  isLiveGatewayMethod,
  paymentMethodBadgeTone,
} from "@/lib/payment-method-labels";

type RequestDetail = {
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
  rejectionReason?: string;
  createdAt: string;
};

export default function SubscriptionRequestDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [credentials, setCredentials] = useState<{
    adminEmail: string;
    temporaryPassword: string;
  } | null>(null);

  async function loadRequest() {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/saas-admin/subscription-requests/${params.id}`,
        { cache: "no-store" }
      );

      const data = await res.json();

      if (data.success) {
        setRequest(data.data);
      }
    } catch (err) {
      console.error("Failed to load request details:", err);
    } finally {
      setLoading(false);
    }
  }

  async function approveRequest() {
    const ok = confirm("Approve this request and generate school credentials?");
    if (!ok) return;

    setActionLoading(true);

    try {
      const res = await fetch(
        `/api/saas-admin/subscription-requests/${params.id}/approve`,
        { method: "POST" }
      );

      const data = await res.json();

      if (data.success) {
        setCredentials({
          adminEmail: data.data.adminEmail,
          temporaryPassword: data.data.temporaryPassword,
        });

        await loadRequest();
      } else {
        alert(data.message || "Approval failed");
      }
    } catch (err) {
      console.error("Approval request failed:", err);
      alert("An unexpected error occurred during approval");
    } finally {
      setActionLoading(false);
    }
  }

  async function rejectRequest() {
    const ok = confirm("Reject this subscription request?");
    if (!ok) return;

    setActionLoading(true);

    try {
      const res = await fetch(
        `/api/saas-admin/subscription-requests/${params.id}/reject`,
        {
          method: "POST",
          body: JSON.stringify({ rejectionReason }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        await loadRequest();
      } else {
        alert(data.message || "Rejection failed");
      }
    } catch (err) {
      console.error("Rejection request failed:", err);
      alert("An unexpected error occurred during rejection");
    } finally {
      setActionLoading(false);
    }
  }

  useEffect(() => {
    loadRequest();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-6 text-white flex items-center justify-center">
        <div className="text-xl text-slate-400">Loading request details...</div>
      </main>
    );
  }

  if (!request) {
    return (
      <main className="min-h-screen bg-slate-950 p-6 text-white flex items-center justify-center">
        <div className="text-xl text-red-400">Request not found.</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => router.back()}
          className="mb-6 rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm transition hover:bg-white/20"
        >
          ← Back
        </button>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <section className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur-xl">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-3xl font-bold">{request.schoolName}</h1>
                <p className="mt-1 text-slate-400">
                  Subscription request details
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    request.status === "PAYMENT_CONFIRMED"
                      ? "bg-cyan-400/20 text-cyan-200"
                      : request.status === "PENDING"
                      ? "bg-yellow-400/20 text-yellow-200"
                      : request.status === "APPROVED"
                      ? "bg-emerald-400/20 text-emerald-200"
                      : "bg-red-400/20 text-red-200"
                  }`}
                >
                  {request.status}
                </span>
                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${paymentMethodBadgeTone(request.paymentMethod)}`}
                >
                  {formatPaymentMethodLabel(request.paymentMethod)}
                  {isLiveGatewayMethod(request.paymentMethod) ? " ✓" : ""}
                </span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Info label="Request ID" value={request.requestId} mono />
              <Info label="Owner / Principal" value={request.ownerName} />
              <Info label="Email" value={request.email} />
              <Info label="Contact" value={request.contactNumber} />
              <Info
                label="Plan"
                value={`${request.planName} / Rs ${request.planPrice} (${request.billingCycle})`}
              />
              <Info label="Payment Method" value={formatPaymentMethodLabel(request.paymentMethod)} />
              {request.transactionId && (
                <Info label="Transaction ID" value={request.transactionId} mono />
              )}
              <Info
                label="School Address"
                value={request.schoolAddress || "No address provided"}
                full
              />
            </div>

            {(request.status === "PENDING" || request.status === "PAYMENT_CONFIRMED") && (
              <div className="mt-8 rounded-2xl border border-white/10 bg-slate-900/80 p-5">
                <h2 className="text-xl font-bold">Admin Action</h2>

                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Rejection reason, optional"
                  className="mt-4 min-h-24 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 outline-none focus:border-cyan-400/50"
                />

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    disabled={actionLoading}
                    onClick={approveRequest}
                    className="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {actionLoading ? "Processing..." : "Approve & Generate Credentials"}
                  </button>

                  <button
                    disabled={actionLoading}
                    onClick={rejectRequest}
                    className="rounded-xl bg-red-500 px-5 py-3 font-semibold text-white transition hover:bg-red-600 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
                  >
                    Reject Request
                  </button>
                </div>
              </div>
            )}

            {request.status === "REJECTED" && request.rejectionReason && (
              <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/10 p-5 text-red-100">
                <h2 className="font-bold">Rejection Reason</h2>
                <p className="mt-2">{request.rejectionReason}</p>
              </div>
            )}

            {credentials && (
              <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5 text-emerald-100">
                <h2 className="text-xl font-bold">Generated Credentials</h2>
                <p className="mt-3 font-medium">
                  Email: <span className="text-white select-all">{credentials.adminEmail}</span>
                </p>
                <p className="font-medium">
                  Temporary Password: <span className="text-white select-all">{credentials.temporaryPassword}</span>
                </p>
                <p className="mt-3 text-sm text-emerald-300">
                  Credentials have been saved to the database. Copy these credentials to hand them off manually.
                </p>
              </div>
            )}
          </section>

          <aside className="rounded-3xl border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur-xl">
            <h2 className="mb-4 text-xl font-bold">Payment Screenshot</h2>

            {request.paymentScreenshotUrl ? (
              <a href={request.paymentScreenshotUrl} target="_blank" rel="noopener noreferrer">
                <img
                  src={request.paymentScreenshotUrl}
                  alt="Payment Screenshot"
                  className="w-full rounded-2xl border border-white/10 object-cover cursor-zoom-in hover:opacity-90 transition"
                />
              </a>
            ) : isLiveGatewayMethod(request.paymentMethod) ? (
              <div className="flex h-72 flex-col items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 text-center text-cyan-100">
                <p className="font-semibold">Gateway payment confirmed</p>
                <p className="text-sm text-cyan-200/80">No screenshot required for live checkout.</p>
              </div>
            ) : (
              <div className="flex h-72 items-center justify-center rounded-2xl border border-white/10 bg-slate-900 text-slate-500">
                No screenshot uploaded
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}

function Info({
  label,
  value,
  full,
  mono,
}: {
  label: string;
  value: string;
  full?: boolean;
  mono?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/5 p-4 ${
        full ? "md:col-span-2" : ""
      }`}
    >
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 font-semibold text-white ${mono ? "font-mono text-sm" : ""}`}>{value}</p>
    </div>
  );
}
