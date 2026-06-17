"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Building2,
  UserRound,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  CheckCircle2,
  XCircle,
  ImageIcon,
  ShieldCheck,
} from "lucide-react";

const requests = [
  {
    id: "REQ-001",
    schoolName: "ABC Public School",
    ownerName: "Muhammad Ali",
    address: "Main Road, Lahore",
    city: "Lahore",
    contact: "03001234567",
    email: "abcschool@gmail.com",
    plan: "Professional",
    billing: "Monthly",
    paymentMethod: "JazzCash",
    transactionId: "JC-987654321",
    amount: "PKR 9,999",
    screenshotUrl: "/payment-screenshot-sample.jpg",
    status: "pending",
  },
  {
    id: "REQ-002",
    schoolName: "The Smart School",
    ownerName: "Ahmed Khan",
    address: "Model Town, Lahore",
    city: "Lahore",
    contact: "03112223344",
    email: "smart@gmail.com",
    plan: "Starter",
    billing: "Monthly",
    paymentMethod: "EasyPaisa",
    transactionId: "EP-22334455",
    amount: "PKR 4,999",
    screenshotUrl: "",
    status: "pending",
  },
];

export default function SubscriptionRequestDetailPage() {
  const params = useParams();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState("pending");
  const [loadingAction, setLoadingAction] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const request = useMemo(() => {
    const id = String(params?.id || "").toUpperCase();
    return requests.find((item) => item.id.toUpperCase() === id) || requests[0];
  }, [params?.id]);

  const approveRequest = async () => {
    setLoadingAction("approve");
    setActionMessage("");

    const res = await fetch(`/api/super-admin/subscription-requests/${request.id}/action`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "approve",
      }),
    });

    const data = await res.json();
    setLoadingAction("");

    if (!res.ok) {
      setActionMessage(data.message || "Approval failed");
      return;
    }

    setStatus("approved");
    setRejectOpen(false);
    setActionMessage(data.message || "School activated and credentials emailed");
  };

  const rejectRequest = async () => {
    setLoadingAction("reject");
    setActionMessage("");

    const res = await fetch(`/api/super-admin/subscription-requests/${request.id}/action`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "reject",
        rejectionReason: reason,
      }),
    });

    const data = await res.json();
    setLoadingAction("");

    if (!res.ok) {
      setActionMessage(data.message || "Reject failed");
      return;
    }

    setStatus("rejected");
    setActionMessage(data.message || "Request rejected and email sent");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <Link href="/super-admin/subscription-requests" className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-950">
        <ArrowLeft size={18} />
        Back to Requests
      </Link>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Request Details</h1>
          <p className="text-slate-500">{request.id}</p>
        </div>

        <span
          className={`rounded-full px-4 py-2 text-sm font-medium capitalize ${
            status === "approved"
              ? "bg-green-100 text-green-700"
              : status === "rejected"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {status === "pending" ? "Pending Verification" : status}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Card title="School Information">
            <Info icon={Building2} label="School Name" value={request.schoolName} />
            <Info icon={UserRound} label="Owner / Principal" value={request.ownerName} />
            <Info icon={MapPin} label="Address" value={request.address} />
            <Info icon={MapPin} label="City" value={request.city} />
            <Info icon={Phone} label="Contact" value={request.contact} />
            <Info icon={Mail} label="Email" value={request.email} />
          </Card>

          <Card title="Subscription & Payment">
            <Info icon={CreditCard} label="Plan" value={request.plan} />
            <Info icon={CreditCard} label="Billing" value={request.billing} />
            <Info icon={CreditCard} label="Payment Method" value={request.paymentMethod} />
            <Info icon={CreditCard} label="Transaction ID" value={request.transactionId} />
            <Info icon={CreditCard} label="Amount" value={request.amount} />
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Payment Screenshot">
            <div className="overflow-hidden rounded-2xl border bg-slate-100">
              {request.screenshotUrl ? (
                <img
                  src={request.screenshotUrl}
                  alt="Payment Screenshot"
                  className="h-[260px] w-full object-cover sm:h-[360px]"
                />
              ) : (
                <div className="flex h-[260px] flex-col items-center justify-center text-slate-400 sm:h-[360px]">
                  <ImageIcon size={42} />
                  <p className="mt-3">No screenshot uploaded</p>
                </div>
              )}
            </div>
          </Card>

          <Card title="Verification Actions">
            <div className="rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-blue-700">
              <div className="mb-2 flex items-center gap-2 font-semibold">
                <ShieldCheck size={18} />
                Approval will activate tenant
              </div>
              Approving this request will create school tenant, generate admin credentials and email them to the client.
            </div>

            {actionMessage && (
              <div
                className={`mt-5 rounded-2xl p-4 text-sm font-semibold ${
                  status === "approved"
                    ? "bg-green-50 text-green-700"
                    : status === "rejected"
                      ? "bg-red-50 text-red-700"
                      : "bg-slate-100 text-slate-700"
                }`}
              >
                {actionMessage}
              </div>
            )}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                onClick={approveRequest}
                className="flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                disabled={status === "approved" || Boolean(loadingAction)}
                type="button"
              >
                <CheckCircle2 size={19} />
                {loadingAction === "approve" ? "Approving..." : "Approve"}
              </button>

              <button
                onClick={() => setRejectOpen(true)}
                className="flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                disabled={status === "rejected" || Boolean(loadingAction)}
                type="button"
              >
                <XCircle size={19} />
                Reject
              </button>
            </div>

            {rejectOpen && (
              <div className="mt-5 rounded-2xl border bg-slate-50 p-4">
                <label className="text-sm font-semibold text-slate-700">Rejection Reason</label>

                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Write rejection reason..."
                  className="mt-2 min-h-[110px] w-full rounded-xl border p-3 outline-none focus:border-red-400"
                />

                <button
                  onClick={rejectRequest}
                  className="mt-3 w-full rounded-xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                  disabled={!reason.trim() || Boolean(loadingAction)}
                  type="button"
                >
                  {loadingAction === "reject" ? "Rejecting..." : "Confirm Reject"}
                </button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="rounded-3xl border bg-white p-5 shadow-sm sm:p-6">
      <h2 className="mb-5 text-xl font-bold text-slate-950">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
      <Icon size={18} className="mt-1 text-slate-500" />
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}
