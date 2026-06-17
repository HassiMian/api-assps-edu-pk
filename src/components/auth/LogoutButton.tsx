"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch (err) {
      console.error("Logout request failed:", err);
    }

    // Clean client-side authentication states
    localStorage.removeItem("token");
    localStorage.removeItem("al_siddique_token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("al_siddique_refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("al_siddique_user");
    localStorage.removeItem("schoolBranding");
    localStorage.removeItem("apex_school_branding");

    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 transition cursor-pointer"
    >
      Logout
    </button>
  );
}
