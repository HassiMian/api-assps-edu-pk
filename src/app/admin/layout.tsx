import type { Metadata } from "next";
import { TITLES } from "@/lib/platform";

export const metadata: Metadata = {
  title: TITLES.connectAdmin,
  description: "APEX Connect school admin portal on api.assps.edu.pk",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
