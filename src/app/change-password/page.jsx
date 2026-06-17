"use client";

import { useState } from "react";
import { Lock, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import api from "@/utils/api";

export default function ChangePasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/change-password", { newPassword });
      const savedUser = localStorage.getItem("user") || localStorage.getItem("al_siddique_user");
      if (savedUser) {
        const user = JSON.parse(savedUser);
        user.mustChangePassword = false;
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("al_siddique_user", JSON.stringify(user));
      }
      setMessage("Password changed successfully. Redirecting...");
      window.setTimeout(() => {
        window.location.href = "/admin";
      }, 800);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#040711] px-4 py-16 text-white sm:px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.18),transparent_45%)]" />

      <form
        onSubmit={submit}
        className="relative w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl sm:p-8"
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.08] text-cyan-300">
          <Lock size={30} />
        </div>

        <h1 className="text-center text-3xl font-semibold tracking-tight">Change Password</h1>
        <p className="mt-3 text-center text-sm text-slate-300">
          Create your permanent APEX password before opening the dashboard.
        </p>

        {error ? (
          <div className="mt-6 flex items-start gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        {message ? (
          <div className="mt-6 flex items-start gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
            <span>{message}</span>
          </div>
        ) : null}

        <div className="mt-8 space-y-5">
          <PasswordField
            value={newPassword}
            onChange={setNewPassword}
            placeholder="New Password"
          />
          <PasswordField
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Confirm Password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Updating..." : "Save Password"}
          <ArrowRight size={17} className="transition group-hover:translate-x-1" />
        </button>
      </form>
    </main>
  );
}

function PasswordField({ value, onChange, placeholder }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 transition focus-within:border-cyan-300/60">
      <Lock size={18} className="text-cyan-300" />
      <input
        type="password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-white outline-none placeholder:text-slate-400"
        required
      />
    </div>
  );
}
