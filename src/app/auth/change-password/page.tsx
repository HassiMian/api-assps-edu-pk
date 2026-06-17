"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { URLS } from "@/lib/platform";

function ChangeTemporaryPasswordForm() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!userId) {
      setMessage("Invalid password change session");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("New password and confirm password do not match");
      return;
    }

    setLoading(true);
    setMessage("");

    const res = await fetch("/api/auth/change-temporary-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        currentPassword,
        newPassword,
      }),
    });

    const data = await res.json();

    if (!data.success) {
      setMessage(data.message || "Password change failed");
      setLoading(false);
      return;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("loginAt");
    localStorage.removeItem("al_siddique_token");
    localStorage.removeItem("al_siddique_refresh_token");
    localStorage.removeItem("al_siddique_user");

    setMessage("Password changed successfully. Please login again.");
    window.setTimeout(() => {
      window.location.replace(`${URLS.connectLogin}?force=1`);
    }, 900);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
        <h1 className="text-3xl font-bold">Change Password</h1>

        <p className="mt-2 text-sm text-slate-300">
          For security, please change your temporary password before accessing
          your school dashboard.
        </p>

        {message ? (
          <div className="mt-5 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-cyan-100">
            {message}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-8 grid gap-4">
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Temporary Password"
            className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 outline-none"
          />

          <input
            type="password"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New Password"
            className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 outline-none"
          />

          <input
            type="password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm New Password"
            className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 outline-none"
          />

          <button
            disabled={loading}
            className="mt-2 rounded-xl bg-white px-5 py-3 font-semibold text-slate-950 hover:bg-slate-200 disabled:opacity-60"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function ChangeTemporaryPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ChangeTemporaryPasswordForm />
    </Suspense>
  );
}
