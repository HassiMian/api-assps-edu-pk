import type { Metadata } from "next";
import { TITLES } from "@/lib/platform";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to APEX Connect — teachers, parents, students, and school admins.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
