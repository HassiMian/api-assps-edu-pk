"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-6">
      <div className="max-w-xl text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-cyan-300/80 mb-3">
          APEX Connect
        </p>
        <h1 className="text-4xl font-bold mb-4">404 — Page Not Found</h1>
        <p className="text-slate-400 mb-8">
          This link is outdated or wrong. Use the buttons below — do not change the URL manually.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/login?logout=1"
            className="rounded-xl bg-cyan-500 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-400"
          >
            Back to Login
          </Link>
          <Link
            href="/admin"
            className="rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold hover:bg-white/10"
          >
            School Admin (/admin)
          </Link>
          <p className="mt-4 text-xs text-amber-300/90">
            Do not use /dashboard — that link is retired. Use /admin instead.
          </p>
          <a
            href="https://app.assps.edu.pk/login"
            className="rounded-xl border border-amber-400/40 px-6 py-3 text-sm font-semibold text-amber-200 hover:bg-amber-400/10"
          >
            APEX OS (SaaS)
          </a>
        </div>
      </div>
    </div>
  );
}
