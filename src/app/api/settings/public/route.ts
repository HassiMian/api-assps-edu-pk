import { NextRequest, NextResponse } from "next/server";
import { envString } from "@/lib/server/env";

export const dynamic = "force-dynamic";

function backendApiUrl() {
  return envString("BACKEND_URL", "http://127.0.0.1:5000/api").replace(/\/$/, "");
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.toString();
  const url = `${backendApiUrl()}/settings/public${query ? `?${query}` : ""}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "X-Forwarded-Host": req.headers.get("host") || "api.assps.edu.pk",
        "X-Forwarded-Proto": "https",
      },
    });

    const data = await response.json().catch(() => ({
      success: false,
      message: "Invalid response from canonical settings service",
    }));

    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Canonical settings service is unavailable" },
      { status: 503 }
    );
  }
}
