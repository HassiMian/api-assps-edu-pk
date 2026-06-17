"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import LoginClient from "@/components/LoginClient";
import LoginPortalChooser from "@/components/LoginPortalChooser";

function LoginPageInner() {
  const searchParams = useSearchParams();
  const choose = searchParams.get("choose");

  if (choose === "1") {
    return <LoginPortalChooser />;
  }

  return <LoginClient />;
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400 text-sm">
          Loading login…
        </div>
      }
    >
      <LoginPageInner />
    </Suspense>
  );
}
