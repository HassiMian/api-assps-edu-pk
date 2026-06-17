"use client";

import { Building2, Copy, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { apexBankDetails } from "./apexBankDetails";

function CopyRow({ label, value }) {
  const [copied, setCopied] = useState(false);

  if (!value) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  };

  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/8 py-3 last:border-0">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
        <p className="mt-1 font-mono text-sm text-cyan-100">{value}</p>
      </div>
      <button
        type="button"
        onClick={copy}
        className="shrink-0 rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:border-cyan-300/30 hover:text-cyan-200"
        aria-label={`Copy ${label}`}
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
    </div>
  );
}

export default function ApexBankTransferPanel({ amountStr, schoolName, bankReady = true }) {
  const [bank, setBank] = useState(apexBankDetails);
  const hasAccount = Boolean(bank.accountNumber || bank.iban);
  const showDetails = bankReady && hasAccount;

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "/api";
    fetch(`${apiBase}/payment/bank-details`)
      .then((res) => res.json())
      .then((json) => {
        if (json?.success && json.data) {
          setBank({ ...apexBankDetails, ...json.data });
        }
      })
      .catch(() => undefined);
  }, []);

  const reference = schoolName?.trim()
    ? `${schoolName.trim()} — APEX`
    : bank.referenceHint;

  return (
    <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-5">
      <div className="mb-4 flex items-center gap-2 text-emerald-200">
        <Building2 size={18} />
        <h3 className="text-sm font-semibold tracking-wide">Bank Transfer Details</h3>
      </div>

      <p className="mb-4 text-sm leading-6 text-slate-300">
        Transfer <span className="font-semibold text-white">{amountStr}</span> to the account below,
        then upload your transfer receipt screenshot.
      </p>

      {showDetails ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4">
          <CopyRow label="Bank" value={bank.bankName} />
          <CopyRow label="Account Title" value={bank.accountTitle} />
          <CopyRow label="Account Number" value={bank.accountNumber} />
          <CopyRow label="IBAN" value={bank.iban} />
          <CopyRow label="Branch" value={bank.branch} />
          <CopyRow label="Reference" value={reference} />
        </div>
      ) : (
        <p className="rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3 text-sm leading-6 text-amber-100/90">
          Bank account details are not published yet. Use JazzCash, EasyPaisa, or card checkout — or
          contact support for manual transfer instructions.
        </p>
      )}

      <p className="mt-4 text-xs leading-5 text-slate-400">
        Verification usually completes within 24–48 hours after screenshot upload.
      </p>
    </div>
  );
}
