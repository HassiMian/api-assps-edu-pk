"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Plus
} from "lucide-react";

type School = {
  id: number;
  school_name: string;
  code: string;
  tenant_id: string;
  status: "active" | "suspended" | "inactive";
  subscription_plan: string;
  owner_name: string;
  email: string;
  phone?: string;
  city?: string;
  address?: string;
  subscription_status?: string;
  subscription_start_date?: string;
  subscription_end_date?: string;
  logo_url?: string;
  active_students_count?: string;
};

type Stats = {
  total: number;
  active: number;
  suspended: number;
  inactive: number;
  mrrEstimatePkr: number;
};

export default function SaaSActiveSchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("");

  // Modal / Editing state
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [editSchoolName, setEditSchoolName] = useState("");
  const [editOwnerName, setEditOwnerName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editStatus, setEditStatus] = useState<"active" | "suspended" | "inactive">("active");
  const [editPlan, setEditPlan] = useState("Starter");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const url = `/api/saas-admin/schools?search=${encodeURIComponent(search)}&status=${statusFilter}&plan=${planFilter}`;
      const res = await fetch(url, { cache: "no-store" });
      const resData = await res.json();
      if (resData.success) {
        setSchools(resData.data);
        setStats(resData.stats);
      }
    } catch (err) {
      console.error("Failed to load schools:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [statusFilter, planFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const openEditModal = (school: School) => {
    setEditingSchool(school);
    setEditSchoolName(school.school_name || "");
    setEditOwnerName(school.owner_name || "");
    setEditEmail(school.email || "");
    setEditPhone(school.phone || "");
    setEditCity(school.city || "");
    setEditAddress(school.address || "");
    setEditStatus(school.status || "active");
    setEditPlan(school.subscription_plan || "Starter");
    setEditStartDate(school.subscription_start_date ? school.subscription_start_date.split("T")[0] : "");
    setEditEndDate(school.subscription_end_date ? school.subscription_end_date.split("T")[0] : "");
    setMessage(null);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchool) return;

    setActionLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/saas-admin/schools/${editingSchool.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          school_name: editSchoolName,
          owner_name: editOwnerName,
          email: editEmail,
          phone: editPhone,
          city: editCity,
          address: editAddress,
          status: editStatus,
          subscription_plan: editPlan,
          subscription_status: editStatus === "active" ? "active" : "suspended",
          subscription_start_date: editStartDate || null,
          subscription_end_date: editEndDate || null,
        }),
      });

      const resData = await res.json();
      if (resData.success) {
        setMessage({ text: resData.message || "Updated successfully.", type: "success" });
        setTimeout(() => {
          setEditingSchool(null);
          loadData();
        }, 1000);
      } else {
        setMessage({ text: resData.message || "Failed to update.", type: "error" });
      }
    } catch {
      setMessage({ text: "Error occurred during update.", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (schoolId: number) => {
    const ok = confirm("CRITICAL: Are you sure you want to completely delete this school tenant? This will wipe out all teachers, students, parents, settings, payments, and invoices for this school. This action CANNOT be undone.");
    if (!ok) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/saas-admin/schools/${schoolId}`, {
        method: "DELETE",
      });
      const resData = await res.json();
      if (resData.success) {
        alert("School deleted successfully.");
        setEditingSchool(null);
        loadData();
      } else {
        alert(resData.message || "Failed to delete school.");
      }
    } catch {
      alert("Error occurred during deletion.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl">
        
        {/* Navigation / Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Active Schools & Tenants</h1>
            <p className="mt-1 text-slate-400">
              Manage school tenants, billing status, subscription scopes, and account health.
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
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/15"
            >
              Subscription Requests
            </Link>

            <Link
              href="/saas-admin/apex-leads"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/15"
            >
              Leads
            </Link>

            <button
              onClick={loadData}
              className="rounded-xl border border-white/10 bg-white/10 p-3 hover:bg-white/20"
              title="Refresh"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">Total Schools</p>
              <p className="mt-1 text-3xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">Active Tenants</p>
              <p className="mt-1 text-3xl font-bold text-emerald-400">{stats.active}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">Suspended Tenants</p>
              <p className="mt-1 text-3xl font-bold text-amber-400">{stats.suspended}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">MRR Run-rate</p>
              <p className="mt-1 text-3xl font-bold text-cyan-400">Rs {stats.mrrEstimatePkr.toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-300">
              <Search size={18} />
              <input
                placeholder="Search by school name, code, city, owner, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent outline-none text-white text-sm"
              />
            </div>

            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="inactive">Inactive</option>
              </select>

              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm"
              >
                <option value="">All Plans</option>
                <option value="Starter">Starter</option>
                <option value="Professional">Professional</option>
                <option value="Enterprise">Enterprise</option>
              </select>

              <button
                type="submit"
                className="rounded-xl bg-cyan-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 active:scale-95"
              >
                Filter
              </button>
            </div>
          </form>
        </div>

        {/* Active Schools Table */}
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] shadow-2xl backdrop-blur-xl">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading active schools...</div>
          ) : schools.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No active schools found matching search criteria.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03]">
                    <th className="p-4 text-left text-xs uppercase tracking-wider text-slate-400">School ID / Code</th>
                    <th className="p-4 text-left text-xs uppercase tracking-wider text-slate-400">School Name</th>
                    <th className="p-4 text-left text-xs uppercase tracking-wider text-slate-400">Owner & Contact</th>
                    <th className="p-4 text-left text-xs uppercase tracking-wider text-slate-400">Plan</th>
                    <th className="p-4 text-center text-xs uppercase tracking-wider text-slate-400">Active Students</th>
                    <th className="p-4 text-left text-xs uppercase tracking-wider text-slate-400">Subscription Span</th>
                    <th className="p-4 text-left text-xs uppercase tracking-wider text-slate-400">Status</th>
                    <th className="p-4 text-center text-xs uppercase tracking-wider text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {schools.map((school, idx) => (
                    <tr
                      key={school.id}
                      className={`border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors ${
                        idx % 2 === 0 ? "bg-transparent" : "bg-white/[0.01]"
                      }`}
                    >
                      <td className="p-4">
                        <div className="font-mono text-sm font-bold text-cyan-300">{school.code}</div>
                        <div className="text-xs text-slate-500">ID: {school.id}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {school.logo_url ? (
                            <img
                              src={school.logo_url}
                              alt="Logo"
                              className="h-10 w-10 rounded-lg object-contain bg-slate-900 border border-white/10"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-900/40 text-cyan-200 border border-cyan-500/20 font-bold">
                              {school.school_name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-white">{school.school_name}</div>
                            {school.city && <div className="text-xs text-slate-400">{school.city}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{school.owner_name}</div>
                        <div className="text-xs text-slate-400">{school.email}</div>
                        {school.phone && <div className="text-xs text-slate-500">{school.phone}</div>}
                      </td>
                      <td className="p-4">
                        <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300">
                          {school.subscription_plan}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="font-bold text-white text-sm bg-slate-800/50 px-3 py-1 rounded-lg border border-slate-700/50">
                          {school.active_students_count || "0"}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-300">
                        {school.subscription_start_date ? (
                          <div>
                            <span className="text-slate-500">Ends:</span>{" "}
                            {new Date(school.subscription_end_date!).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-slate-500">No dates set</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold border ${
                            school.status === "active"
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                              : school.status === "suspended"
                              ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
                              : "bg-red-500/10 border-red-500/20 text-red-300"
                          }`}
                        >
                          {school.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => openEditModal(school)}
                            className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 p-2 text-cyan-200 hover:bg-cyan-400/20 transition-colors"
                            title="Edit school"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(school.id)}
                            className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-300 hover:bg-red-500/20 transition-colors"
                            title="Delete school"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit School Modal */}
      {editingSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleUpdate}
            className="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl overflow-y-auto max-h-[92vh]"
          >
            <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-xl font-bold">Manage School Tenant</h3>
                <p className="text-xs text-slate-400 mt-1">Tenant ID: {editingSchool.code}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingSchool(null)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white hover:bg-white/10"
              >
                Close
              </button>
            </div>

            {message && (
              <div
                className={`mb-4 rounded-xl border p-3.5 text-sm font-semibold ${
                  message.type === "success"
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                    : "bg-red-500/10 border-red-500/20 text-red-300"
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">SCHOOL NAME</label>
                <input
                  value={editSchoolName}
                  onChange={(e) => setEditSchoolName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-700 bg-black/20 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">OWNER NAME</label>
                <input
                  value={editOwnerName}
                  onChange={(e) => setEditOwnerName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-700 bg-black/20 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">EMAIL ADDRESS</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-700 bg-black/20 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">CONTACT PHONE</label>
                <input
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-black/20 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">CITY</label>
                <input
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-black/20 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">SCHOOL ADDRESS</label>
                <textarea
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-black/20 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500 min-h-[60px]"
                />
              </div>

              <div className="border-t border-white/10 pt-4 sm:col-span-2">
                <h4 className="text-xs uppercase tracking-widest text-cyan-400 font-bold mb-3">Subscription Details</h4>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">SUBSCRIPTION PLAN</label>
                <select
                  value={editPlan}
                  onChange={(e) => setEditPlan(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-850 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="Starter">Starter</option>
                  <option value="Professional">Professional</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">TENANT STATUS</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-850 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended (Locks login)</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">START DATE</label>
                <input
                  type="date"
                  value={editStartDate}
                  onChange={(e) => setEditStartDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-black/20 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">END / RENEWAL DATE</label>
                <input
                  type="date"
                  value={editEndDate}
                  onChange={(e) => setEditEndDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-black/20 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={() => setEditingSchool(null)}
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="rounded-xl bg-cyan-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-50"
              >
                {actionLoading ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
