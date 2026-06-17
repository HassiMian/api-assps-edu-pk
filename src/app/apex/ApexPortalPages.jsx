"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  FileCheck2,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { apexPlans, backendReadyModels, tenantActivationSteps } from "./ApexPortalData";
import ApexPortalHeader from "./ApexPortalHeader";
import ApexSubmittedBanner from "./ApexSubmittedBanner";
import { trackApexEvent, APEX_EVENTS } from "./apexFunnel";

const inputClass =
  "w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/15";

function formatPrice(value) {
  if (!value) return "Custom";
  return `PKR ${value.toLocaleString()}`;
}

export function ApexPortalShell({ eyebrow, title, subtitle, children }) {
  return (
    <main className="apex-portal-page relative min-h-screen text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(34,211,238,0.06),transparent_55%)]" />
      <header className="relative z-10 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <ApexPortalHeader />
          <div className="hidden items-center gap-5 text-sm font-bold text-slate-300 md:flex">
            <Link href="/apex/features" className="hover:text-cyan-100">Features</Link>
            <Link href="/apex/pricing" className="hover:text-cyan-100">Pricing</Link>
            <Link href="/apex/demo-request" className="hover:text-cyan-100">Book Demo</Link>
            <Link href="/login?choose=1" className="hover:text-cyan-100">Login</Link>
          </div>
          <Link href="/apex/register-school" className="rounded-full bg-white px-4 py-2 text-sm font-black text-slate-950">
            Get Started
          </Link>
        </nav>
      </header>

      <section className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="max-w-3xl">
          <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-cyan-200">
            {eyebrow}
          </div>
          <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">{title}</h1>
          <p className="mt-5 text-base leading-8 text-slate-300 sm:text-lg">{subtitle}</p>
        </div>
        <div className="mt-10">
          <ApexSubmittedBanner />
          {children}
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 bg-slate-950/55">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-slate-400 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>APEX AI School OS. Tenant-safe school activation, billing and operations.</div>
          <div className="flex flex-wrap gap-4">
            <Link href="/apex/privacy-policy" className="hover:text-cyan-100">Privacy Policy</Link>
            <Link href="/apex/terms" className="hover:text-cyan-100">Terms</Link>
            <Link href="/apex/refund-policy" className="hover:text-cyan-100">Refund Policy</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

export function PlanCards({ compact = false }) {
  const [cycle, setCycle] = useState("monthly");

  return (
    <div>
      <div className="mb-8 inline-flex rounded-full border border-white/10 bg-white/[0.06] p-1">
        {["monthly", "yearly"].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCycle(item)}
            className={`rounded-full px-5 py-2 text-sm font-bold capitalize transition ${
              cycle === item ? "bg-cyan-300 text-slate-950" : "text-slate-300 hover:text-white"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {apexPlans.map((plan) => {
          const price = cycle === "monthly" ? plan.monthly : plan.yearly;
          return (
            <div
              key={plan.id}
              className={`relative rounded-[2rem] border p-6 backdrop-blur-xl ${
                plan.recommended
                  ? "border-cyan-300/40 bg-cyan-300/[0.08] shadow-[0_0_60px_rgba(34,211,238,0.16)]"
                  : "border-white/10 bg-white/[0.055]"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black">{plan.name}</h3>
                  <p className="mt-1 text-sm text-slate-400">{plan.audience}</p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-black text-cyan-100">
                  {plan.badge}
                </span>
              </div>
              <div className="mt-6">
                <span className="text-3xl font-black">{formatPrice(price)}</span>
                {price && <span className="text-sm text-slate-400"> / {cycle}</span>}
              </div>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm text-slate-200">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={`/apex/checkout?plan=${plan.id}&cycle=${cycle}`}
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-100"
              >
                {plan.id === "enterprise" ? "Contact Sales" : "Start Checkout"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          );
        })}
      </div>

      {!compact && <FeatureComparison />}
    </div>
  );
}

export function FeatureComparison() {
  const rows = [
    ["Tenant isolation", "Included", "Included", "Advanced"],
    ["AI Paper Generator", "Limited", "Included", "Advanced"],
    ["Parent/Teacher/Student apps", "Basic", "Included", "Custom"],
    ["Multi-campus", "No", "Optional", "Included"],
    ["Support", "Email", "Priority", "Dedicated"],
  ];

  return (
    <div className="mt-10 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04]">
      <div className="grid grid-cols-4 border-b border-white/10 bg-white/[0.04] p-4 text-sm font-black text-cyan-100">
        <span>Feature</span>
        <span>Starter</span>
        <span>Professional</span>
        <span>Enterprise</span>
      </div>
      {rows.map((row) => (
        <div key={row[0]} className="grid grid-cols-4 gap-3 border-b border-white/5 p-4 text-sm text-slate-300 last:border-b-0">
          {row.map((cell) => <span key={cell}>{cell}</span>)}
        </div>
      ))}
    </div>
  );
}

export function ApexPricingPage() {
  return (
    <ApexPortalShell
      eyebrow="Subscription Plans"
      title="Choose the APEX plan for your school"
      subtitle="Monthly and yearly billing, clean checkout structure, and a verification-ready payment flow for real school activation."
    >
      <PlanCards />
    </ApexPortalShell>
  );
}

const FIELD_KEYS = {
  "School Name": "schoolName",
  "Contact Name": "name",
  "Owner Name": "name",
  Name: "name",
  Phone: "phone",
  Email: "email",
  City: "city",
  "Students Count": "studentsCount",
  "Campus Count": "campusCount",
};

export function ApexDemoRequestPage() {
  return (
    <ApexFormPage
      type="demo"
      eyebrow="Book Demo"
      title="Request an APEX product demo"
      subtitle="Tell us about your school and our team will schedule a guided walkthrough."
      fields={["School Name", "Contact Name", "Phone", "Email", "City", "Students Count"]}
      button="Submit Demo Request"
      success="/apex/demo-request?submitted=demo"
    />
  );
}

export function ApexEnterprisePage() {
  return (
    <ApexFormPage
      type="enterprise"
      eyebrow="Enterprise"
      title="Custom deployment for large school networks"
      subtitle="Multi-branch schools, custom integrations, dedicated support and enterprise security — tell us your requirements."
      fields={["School Name", "Owner Name", "Phone", "Email", "City", "Campus Count"]}
      button="Request Enterprise Quote"
      success="/apex/contact?submitted=enterprise"
    />
  );
}

export function ApexRegisterSchoolPage() {
  return (
    <ApexFormPage
      type="register"
      eyebrow="Register School"
      title="Start your school onboarding"
      subtitle="Create a pending school tenant profile, then choose a subscription and submit payment verification."
      fields={["School Name", "Owner Name", "Phone", "Email", "City", "Campus Count"]}
      button="Continue to Onboarding"
      success="/apex/onboarding"
    />
  );
}

export function ApexFormPage({ type = "contact", eyebrow, title, subtitle, fields, button, success }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [values, setValues] = useState(() =>
    Object.fromEntries(fields.map((f) => [FIELD_KEYS[f] || f, ""]))
  );
  const [notes, setNotes] = useState("");

  const update = (key, val) => setValues((prev) => ({ ...prev, [key]: val }));

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/apex/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          name: values.name || "",
          email: values.email,
          phone: values.phone,
          schoolName: values.schoolName,
          city: values.city,
          studentsCount: values.studentsCount || values.campusCount,
          notes,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.message || "Submission failed.");
        return;
      }
      trackApexEvent(APEX_EVENTS.LEAD_SUBMIT, { type, leadId: json.leadId });
      const joiner = success.includes("?") ? "&" : "?";
      window.location.href = `${success}${joiner}leadId=${encodeURIComponent(json.leadId)}`;
    } catch {
      setError("Could not reach server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ApexPortalShell eyebrow={eyebrow} title={title} subtitle={subtitle}>
      {error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-semibold text-red-300">
          {error}
        </div>
      )}
      <form onSubmit={submit} className="grid gap-5 rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 backdrop-blur-xl md:grid-cols-2 lg:p-8">
        {fields.map((field) => {
          const key = FIELD_KEYS[field] || field;
          return (
            <label key={field} className="space-y-2 text-sm font-bold text-slate-300">
              {field}
              <input
                required
                type={field === "Email" ? "email" : "text"}
                placeholder={field}
                value={values[key] || ""}
                onChange={(e) => update(key, e.target.value)}
                className={inputClass}
              />
            </label>
          );
        })}
        <label className="space-y-2 text-sm font-bold text-slate-300 md:col-span-2">
          Notes
          <textarea
            rows={5}
            placeholder="Tell us what you want to activate first."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={inputClass}
          />
        </label>
        <button disabled={loading} className="md:col-span-2 rounded-full bg-white px-6 py-4 font-black text-slate-950 disabled:opacity-60">
          {loading ? "Submitting..." : button}
        </button>
      </form>
    </ApexPortalShell>
  );
}

export function ApexOnboardingPage() {
  return (
    <ApexPortalShell
      eyebrow="School Onboarding"
      title="From pending school to active tenant"
      subtitle="APEX separates demo data from real school data and activates each school only after subscription verification."
    >
      <div className="grid gap-5 lg:grid-cols-2">
        {tenantActivationSteps.map((step, index) => (
          <div key={step} className="rounded-3xl border border-white/10 bg-white/[0.055] p-5">
            <div className="text-sm font-black text-cyan-200">Step {index + 1}</div>
            <div className="mt-2 text-lg font-bold">{step}</div>
          </div>
        ))}
      </div>
      <Link href="/apex/subscription-plans" className="mt-8 inline-flex rounded-full bg-cyan-300 px-7 py-3 font-black text-slate-950">
        Select Subscription Plan
      </Link>
    </ApexPortalShell>
  );
}

export function ApexFeaturesPage() {
  const features = [
    ["AI Paper Generator", "Board-pattern, Urdu/English, question bank and print-ready papers."],
    ["Daily Diary and Homework", "Teacher workflow connected to students and parents."],
    ["Fees and Finance", "Collection visibility, alerts, ledgers and reports."],
    ["Attendance and Monitoring", "Live trends for owners, admins, teachers and parents."],
    ["Role Dashboards", "Separate views for owner, admin, teacher, parent and student."],
    ["Tenant Isolation", "Every real school runs inside its own schoolId and tenantId boundary."],
  ];
  return (
    <ApexPortalShell eyebrow="Features" title="A connected AI operating system for schools" subtitle="Every module is designed to flow into one tenant-safe command center.">
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {features.map(([title, detail]) => (
          <Link key={title} href="/apex/demo-request" className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 transition hover:-translate-y-1 hover:border-cyan-300/30">
            <Sparkles className="h-5 w-5 text-cyan-300" />
            <h3 className="mt-5 text-xl font-black">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-400">{detail}</p>
          </Link>
        ))}
      </div>
    </ApexPortalShell>
  );
}

export function ApexAboutPage() {
  return (
    <ApexPortalShell eyebrow="About APEX" title="Built for real schools, not demo screens" subtitle="APEX is an AI-powered school OS for academics, exams, finance, communication, analytics and multi-tenant school operations.">
      <div className="grid gap-5 md:grid-cols-3">
        {["Real operations", "Tenant-first architecture", "AI across workflows"].map((item) => (
          <div key={item} className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6">
            <ShieldCheck className="h-6 w-6 text-cyan-300" />
            <h3 className="mt-5 text-xl font-black">{item}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-400">Designed for owners, admins, teachers, parents and students working in one connected platform.</p>
          </div>
        ))}
      </div>
    </ApexPortalShell>
  );
}

export function ApexContactPage() {
  return (
    <ApexPortalShell eyebrow="Contact" title="Talk to the APEX team" subtitle="For sales, onboarding, support or school activation, send us your details.">
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6">
          <Phone className="h-6 w-6 text-cyan-300" />
          <h3 className="mt-5 text-xl font-black">Sales and onboarding</h3>
          <p className="mt-3 text-slate-400">Use the demo request form for the fastest response.</p>
          <Mail className="mt-8 h-6 w-6 text-cyan-300" />
          <p className="mt-3 text-slate-300">support@apex.assps.edu.pk</p>
        </div>
        <ApexContactForm />
      </div>
    </ApexPortalShell>
  );
}

function ApexContactForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", email: "", schoolName: "", message: "" });

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/apex/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "contact",
          name: form.name,
          phone: form.phone,
          email: form.email,
          schoolName: form.schoolName,
          notes: form.message,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.message || "Failed to send message.");
        return;
      }
      trackApexEvent(APEX_EVENTS.LEAD_SUBMIT, { type: "contact", leadId: json.leadId });
      window.location.href = `/apex/contact?submitted=contact&leadId=${encodeURIComponent(json.leadId)}`;
    } catch {
      setError("Could not reach server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-5 rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 md:grid-cols-2 lg:p-8">
      {error && (
        <div className="md:col-span-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}
      {[
        ["Name", "name"],
        ["Phone", "phone"],
        ["Email", "email"],
        ["School Name", "schoolName"],
      ].map(([label, key]) => (
        <input
          key={key}
          required
          type={key === "email" ? "email" : "text"}
          placeholder={label}
          value={form[key]}
          onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
          className={inputClass}
        />
      ))}
      <textarea
        rows={5}
        placeholder="Message"
        value={form.message}
        onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
        className={`${inputClass} md:col-span-2`}
      />
      <button
        disabled={loading}
        className="md:col-span-2 rounded-full bg-white px-6 py-4 font-black text-slate-950 disabled:opacity-60"
      >
        {loading ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}

export function ApexPaymentStatePage({ state }) {
  const config = {
    success: ["Payment Submitted", "Your payment proof has been received. APEX Super Admin can now verify and activate your school tenant.", "Go to Dashboard Redirect"],
    failed: ["Payment Failed", "The payment could not be verified. Please retry checkout or contact support with transaction details.", "Retry Checkout"],
    pending: ["Pending Verification", "Your request is queued for Super Admin review. School status remains pending until approval.", "View Plans"],
  }[state];
  const href = state === "failed" ? "/apex/checkout" : state === "pending" ? "/apex/subscription-plans" : "/apex/dashboard-redirect";

  return (
    <ApexPortalShell eyebrow="Payment Status" title={config[0]} subtitle={config[1]}>
      <Link href={href} className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-7 py-3 font-black text-slate-950">
        {config[2]} <ArrowRight className="h-4 w-4" />
      </Link>
    </ApexPortalShell>
  );
}

export function ApexDashboardRedirectPage() {
  const roles = [
    ["Choose Login Portal", "/login?choose=1"],
    ["School Admin Login", "/login?role=admin"],
    ["Teacher Login", "/login?role=teacher"],
    ["Parent Login", "/login?role=parent"],
    ["Student Login", "/login?role=student"],
    ["Super Admin Login", "/login?role=admin"],
    ["Demo Access", "/login?school_code=DEMO&role=admin"],
  ];
  return (
    <ApexPortalShell eyebrow="Dashboard Redirect" title="Choose the correct APEX portal" subtitle="APEX branding stays visible while each user enters their own tenant-safe dashboard.">
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {roles.map(([label, href]) => (
          <Link key={label} href={href} className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 transition hover:border-cyan-300/30">
            <LockKeyhole className="h-6 w-6 text-cyan-300" />
            <div className="mt-5 text-lg font-black">{label}</div>
          </Link>
        ))}
      </div>
    </ApexPortalShell>
  );
}

export function ApexPolicyPage({ type }) {
  const titles = {
    privacy: "Privacy Policy",
    terms: "Terms and Conditions",
    refund: "Refund Policy",
  };
  return (
    <ApexPortalShell eyebrow="Legal" title={titles[type]} subtitle="Clear operating rules for schools using APEX.">
      <div className="space-y-5 rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 text-sm leading-8 text-slate-300">
        <p>APEX stores school data by tenantId and schoolId so real school records remain separate from demo data and other schools.</p>
        <p>Subscriptions may remain pending until payment proof is reviewed by Super Admin. Active access depends on approved payment and tenant status.</p>
        <p>Refunds, cancellation, data export, support response and service-level terms are finalized in the signed school agreement.</p>
      </div>
    </ApexPortalShell>
  );
}

export function ApexBusinessPortalSections() {
  return (
    <section id="activation" className="relative overflow-hidden bg-[#030712] py-20 text-white sm:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.12),transparent_48%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-3xl">
          <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-cyan-200">Business Portal Activation</div>
          <h2 className="mt-6 text-3xl font-black tracking-tight sm:text-5xl">APEX is now a complete SaaS activation flow</h2>
          <p className="mt-5 text-slate-300">Pricing, onboarding, checkout, payment verification, tenant status and dashboard redirects are connected into clear routes.</p>
        </div>

        <div className="mt-10">
          <PlanCards compact />
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {[
            ["Payment and activation", "Checkout captures method, amount, transaction ID and payment screenshot.", CreditCard, "/apex/checkout"],
            ["School onboarding", "Pending school tenants move through approval before active login.", FileCheck2, "/apex/onboarding"],
            ["Data isolation", "Every school is mapped to tenantId, schoolId, users, subscriptions and invoices.", ShieldCheck, "/apex/features"],
          ].map(([title, detail, Icon, href]) => (
            <Link key={title} href={href} className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 transition hover:-translate-y-1 hover:border-cyan-300/30">
              <Icon className="h-6 w-6 text-cyan-300" />
              <h3 className="mt-5 text-xl font-black">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">{detail}</p>
            </Link>
          ))}
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6">
            <h3 className="text-2xl font-black">Tenant activation steps</h3>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {tenantActivationSteps.map((step, index) => (
                <div key={step} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-300">
                  <span className="font-black text-cyan-200">{index + 1}. </span>{step}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6">
            <h3 className="text-2xl font-black">Backend-ready data structure</h3>
            <div className="mt-6 space-y-3">
              {Object.entries(backendReadyModels).map(([model, fields]) => (
                <div key={model} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="font-black capitalize text-cyan-100">{model}</div>
                  <div className="mt-2 text-xs leading-6 text-slate-400">{fields.join(" / ")}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.055] p-6">
          <h3 className="text-2xl font-black">FAQ</h3>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              ["Can demo data mix with real schools?", "No. Demo access is routed to a dummy tenant only."],
              ["Can a school log in before payment approval?", "The UI supports pending status. Full access activates after Super Admin approval."],
              ["Are payment gateways live?", "The checkout is gateway-ready and supports manual proof until APIs are connected."],
              ["Can pricing buttons work now?", "Yes. They open checkout with selected plan and billing cycle."],
            ].map(([q, a]) => (
              <div key={q} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="font-black text-white">{q}</div>
                <p className="mt-2 text-sm leading-6 text-slate-400">{a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href="/apex/register-school" className="rounded-full bg-cyan-300 px-7 py-3 text-center font-black text-slate-950">Get Started</Link>
          <Link href="/apex/demo-request" className="rounded-full border border-white/10 bg-white/[0.06] px-7 py-3 text-center font-black text-white">Book Demo</Link>
        </div>
      </div>
    </section>
  );
}
