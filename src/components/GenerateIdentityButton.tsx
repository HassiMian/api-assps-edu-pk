"use client";

import { useState } from "react";

export function GenerateIdentityButton({ studentId }: { studentId: string }) {
  const [loading, setLoading] = useState(false);

  async function generateIdentity() {
    setLoading(true);

    try {
      const res = await fetch(`/api/students/${studentId}/identity/generate`, {
        method: "POST",
      });
      const data = await res.json();

      if (!data.success) {
        window.alert(data.message || "Failed to generate identity assets");
        return;
      }

      window.alert("QR + Barcode generated successfully");
      window.location.reload();
    } catch (err) {
      window.alert("Failed to generate identity assets");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={generateIdentity}
      disabled={loading}
      className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-600"
    >
      {loading ? "Generating..." : "Generate QR + Barcode"}
    </button>
  );
}
