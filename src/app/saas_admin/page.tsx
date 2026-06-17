import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/** Legacy underscore URL → canonical hyphen route. */
export default function SaasAdminLegacyRedirect() {
  redirect("/admin");
}
