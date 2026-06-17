"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  Building2,
  CreditCard,
} from "lucide-react";

const requests = [
  {
    id: "REQ-001",
    school: "ABC Public School",
    owner: "Muhammad Ali",
    plan: "Professional",
    email: "abc@gmail.com",
    contact: "03001234567",
    status: "pending",
  },
  {
    id: "REQ-002",
    school: "The Smart School",
    owner: "Ahmed Khan",
    plan: "Starter",
    email: "smart@gmail.com",
    contact: "03112223344",
    status: "pending",
  },
];

export default function SubscriptionRequestsPage() {
  const [search, setSearch] = useState("");

  const filtered = requests.filter(
    (item) =>
      item.school.toLowerCase().includes(search.toLowerCase()) ||
      item.owner.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Subscription Requests</h1>

          <p className="text-slate-500">Approve or reject school subscriptions</p>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-3 rounded-2xl border bg-white p-4 text-slate-700">
        <Search size={18} />

        <input
          placeholder="Search school..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-3xl border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px]">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-4 text-left">Request ID</th>
                <th className="p-4 text-left">School</th>
                <th className="p-4 text-left">Owner</th>
                <th className="p-4 text-left">Plan</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="p-4">{item.id}</td>

                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Building2 size={16} />
                      {item.school}
                    </div>
                  </td>

                  <td className="p-4">{item.owner}</td>

                  <td className="p-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm">
                      <CreditCard size={14} />
                      {item.plan}
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-700">
                      Pending
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                    <Link
                      href={`/super-admin/subscription-requests/${item.id}`}
                      className="rounded-xl bg-slate-100 p-2 hover:bg-slate-200"
                    >
                      <Eye size={18} />
                    </Link>

                      <button className="rounded-xl bg-green-100 p-2 text-green-700 hover:bg-green-200" type="button">
                        <CheckCircle2 size={18} />
                      </button>

                      <button className="rounded-xl bg-red-100 p-2 text-red-700 hover:bg-red-200" type="button">
                        <XCircle size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
