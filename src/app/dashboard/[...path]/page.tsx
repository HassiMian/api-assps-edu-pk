import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/** Legacy /dashboard/* → school admin portal (never loop back to /dashboard). */
export default function DashboardCatchAllPage() {
  redirect("/admin");
}
