import { redirect } from "next/navigation";

/** Super App login on this host. */
export default function SuperAppLoginRedirectPage() {
  redirect("/login");
}
