import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  const res = NextResponse.redirect("/login?force=1", 307);
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  return res;
}
