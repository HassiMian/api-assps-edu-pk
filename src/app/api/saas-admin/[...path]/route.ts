import { NextResponse } from "next/server";
import * as subscriptionList from "../subscription-requests/route";
import * as subscriptionDetail from "../subscription-requests/[id]/route";
import * as subscriptionApprove from "../subscription-requests/[id]/approve/route";
import * as subscriptionReject from "../subscription-requests/[id]/reject/route";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

function notFound(req: Request) {
  return NextResponse.json(
    { success: false, message: `Route not found: ${req.method} ${new URL(req.url).pathname}` },
    { status: 404 }
  );
}

async function dispatch(req: Request, context: RouteContext) {
  const { path } = await context.params;
  const [resource, id, action] = path;

  if (resource !== "subscription-requests") {
    return notFound(req);
  }

  if (!id && !action && req.method === "GET") {
    return subscriptionList.GET(req);
  }

  if (id && !action && req.method === "GET") {
    return subscriptionDetail.GET(req, { params: Promise.resolve({ id }) });
  }

  if (id && action === "approve" && req.method === "POST") {
    return subscriptionApprove.POST(req, { params: Promise.resolve({ id }) });
  }

  if (id && action === "reject" && req.method === "POST") {
    return subscriptionReject.POST(req, { params: Promise.resolve({ id }) });
  }

  return notFound(req);
}

export const dynamic = "force-dynamic";

export const GET = dispatch;
export const POST = dispatch;
