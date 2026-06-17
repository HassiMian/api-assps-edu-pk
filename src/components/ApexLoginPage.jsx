"use client";

import { useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  LayoutDashboard,
  MonitorSmartphone,
  AlertCircle,
} from "lucide-react";
import api from "@/utils/api";
import { getLoginRedirectForRole } from "@/lib/roleRoutes";

const loginConfig = {
  saas: {
    title: "Login to APEX OS",
    subtitle: "School Management SaaS",
    icon: LayoutDashboard,
    fallbackRedirect: "/admin",
  },
  superApp: {
    title: "Login to APEX Connect",
    subtitle: "Parent, Teacher & Student Super App",
    icon: MonitorSmartphone,
    fallbackRedirect: "/student",
  },
};

const roleRoutes = {
  super_admin: "/saas-admin/subscription-requests",
  saas_admin: "/saas-admin/subscription-requests",
  admin: "/admin",
  school_admin: "/admin",
  principal: "/admin",
  teacher: "/teacher",
  parent: "/parent",
  student: "/student",
};

function getRedirectForUser(type, user, fallback) {
  const role = String(user?.role || "").toLowerCase();
  if (type === "superApp" && ["teacher", "parent", "student"].includes(role)) {
    return roleRoutes[role];
  }
  return roleRoutes[role] || fallback;
}

function storeSession(data) {
  const user = data?.user;
  if (!user || !data?.token) return;

  localStorage.setItem("token", data.token);
  localStorage.setItem("al_siddique_token", data.token);
  localStorage.setItem("loginAt", String(Date.now()));
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("al_siddique_user", JSON.stringify(user));

  if (data.refreshToken) {
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("al_siddique_refresh_token", data.refreshToken);
  }

  if (data.schoolBranding) {
    const branding = JSON.stringify(data.schoolBranding);
    localStorage.setItem("schoolBranding", branding);
    localStorage.setItem("apex_school_branding", branding);
  }
}

export default function ApexLoginPage({ type = "saas" }) {
  const config = loginConfig[type] || loginConfig.saas;
  const Icon = config.icon;

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (error) setError("");
  };

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", {
        email: form.email,
        password: form.password,
        loginType: type,
      });
      const data = response.data;

      storeSession(data);

      if (data?.token) {
        try {
          await fetch("/api/auth/sync-session", {
            method: "POST",
            headers: { Authorization: `Bearer ${data.token}` },
            credentials: "include",
          });
        } catch {
          /* optional */
        }
      }

      if (data?.mustChangePassword && data?.redirectTo) {
        window.location.assign(data.redirectTo);
        return;
      }

      if (data?.user?.mustChangePassword) {
        window.location.assign(`/auth/change-password?userId=${data.user.id}`);
        return;
      }

      const portal =
        getLoginRedirectForRole(data?.user?.role || "") ||
        getRedirectForUser(type, data?.user, config.fallbackRedirect);
      const safePortal = portal.includes("/dashboard")
        ? getLoginRedirectForRole(data?.user?.role || "admin")
        : portal;
      window.location.assign(safePortal);
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#040711] px-4 py-16 text-white sm:px-6 sm:py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.18),transparent_45%)]" />
      <div className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-3xl" />

      <form
        onSubmit={submit}
        className="relative w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl sm:p-8"
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.08] text-cyan-300">
          <Icon size={38} />
        </div>

        <div className="mb-5 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-cyan-200">
            <ShieldCheck size={15} />
            APEX Secure Login
          </div>
        </div>

        <h1 className="text-center text-3xl font-semibold tracking-tight">{config.title}</h1>

        <p className="mt-3 text-center text-sm text-slate-300">{config.subtitle}</p>

        <p className="mt-1 text-center text-xs tracking-[0.25em] text-slate-500">
          LEARN . GROW . LEAD . TRANSFORM
        </p>

        {error ? (
          <div className="mt-6 flex items-start gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <div className="mt-8 space-y-5">
          <Field
            icon={Mail}
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={(value) => update("email", value)}
          />

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 transition focus-within:border-cyan-300/60">
            <Lock size={18} className="text-cyan-300" />

            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(event) => update("password", event.target.value)}
              placeholder="Password"
              className="w-full bg-transparent text-white outline-none placeholder:text-slate-400"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword((previous) => !previous)}
              className="text-slate-400 transition hover:text-cyan-200"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Signing in..." : "Login"}
          <ArrowRight size={17} className="transition group-hover:translate-x-1" />
        </button>

        <div className="mt-6 flex items-center justify-between gap-4 text-sm">
          <a href="/gateway" className="text-slate-400 transition hover:text-cyan-200">
            Back to Gateway
          </a>

          <a href="/login" className="text-slate-400 transition hover:text-cyan-200">
            Forgot Password?
          </a>
        </div>
      </form>
    </main>
  );
}

function Field({ icon: Icon, type, placeholder, value, onChange }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 transition focus-within:border-cyan-300/60">
      <Icon size={18} className="text-cyan-300" />

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-white outline-none placeholder:text-slate-400"
        required
      />
    </div>
  );
}
