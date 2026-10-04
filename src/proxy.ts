import { NextRequest, NextResponse } from "next/server";
import {
  coerceConnectRedirect,
  getConnectPortalPath,
  isPlatformOnlyRole,
} from "@/lib/connectPortal";
import { DOMAINS } from "@/lib/platform";

const CONNECT_HOSTS = new Set([DOMAINS.connect, "localhost"]);
const PORTAL_PREFIXES = ["/admin", "/teacher", "/parent", "/student"];

const LEGACY_ROLE_PATHS: Record<string, string> = {
  "/saas_admin": "/admin",
  "/super_admin": "/admin",
  "/school_admin": "/admin",
};

const PROTECTED_PREFIXES = [
  "/students",
  "/classes",
  "/settings",
  "/fee-management",
  "/examination",
  "/question-bank",
  "/paper-generator",
  "/transport",
  "/diary",
  "/employees",
];

function startsWithAny(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname.startsWith(prefix));
}

function redirectTo(req: NextRequest, target: string, status = 307) {
  if (target.startsWith("http")) {
    return NextResponse.redirect(target, status);
  }
  return NextResponse.redirect(new URL(target, req.url), status);
}

function connectPortal(role: string | undefined) {
  return getConnectPortalPath(role || "", undefined);
}

function clearConnectSession(response: NextResponse) {
  response.cookies.set("userId", "", { path: "/", maxAge: 0 });
  response.cookies.set("tenantId", "", { path: "/", maxAge: 0 });
  response.cookies.set("role", "", { path: "/", maxAge: 0 });
  response.cookies.set("authToken", "", { path: "/", maxAge: 0 });
  response.cookies.set("refreshToken", "", { path: "/", maxAge: 0 });
  return response;
}

type VerifiedSession = { role: string; userId: string; tenantId: string; refreshedCookies?: string[] };

async function verifyConnectSession(req: NextRequest): Promise<VerifiedSession | null> {
  const incomingCookie = req.headers.get("cookie") || "";
  if (!incomingCookie) return null;
  const origin = process.env.BACKEND_URL || "http://127.0.0.1:5000/api";
  const base = origin.replace(/\/$/, "");
  const readPayload = async (response: Response) => {
    if (!response.ok) return null;
    const result = await response.json().catch(() => null);
    const user = result?.user;
    if (!user?.id || !user?.role || !user?.school_id) return null;
    return { role: String(user.role), userId: String(user.id), tenantId: String(user.tenant_id || "") };
  };
  try {
    const current = await fetch(`${base}/auth/me`, {
      headers: { Cookie: incomingCookie, Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    const user = await readPayload(current);
    if (user) return user;
    if (!req.cookies.get("refreshToken")?.value) return null;
    const refreshed = await fetch(`${base}/auth/refresh`, {
      method: "POST",
      headers: { Cookie: incomingCookie, "Content-Type": "application/json" },
      body: "{}",
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    const newUser = await readPayload(refreshed);
    if (!newUser) return null;
    const cookieHeaders = refreshed.headers as Headers & { getSetCookie?: () => string[] };
    const cookies = typeof cookieHeaders.getSetCookie === "function"
      ? cookieHeaders.getSetCookie()
      : (refreshed.headers.get("set-cookie") ? [refreshed.headers.get("set-cookie") as string] : []);
    return { ...newUser, refreshedCookies: cookies };
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = req.headers.get("host")?.split(":")[0].toLowerCase();
  const onConnect = host ? CONNECT_HOSTS.has(host) : false;

  const legacyTarget = LEGACY_ROLE_PATHS[pathname];
  if (legacyTarget) {
    return redirectTo(req, legacyTarget);
  }

  if (onConnect && (pathname === "/saas-admin" || pathname.startsWith("/saas-admin/"))) {
    const saasAdminUrl = new URL(
      `${pathname}${req.nextUrl.search}`,
      `https://${DOMAINS.saas}`
    );
    return NextResponse.redirect(saasAdminUrl, 307);
  }

  if (host === DOMAINS.website && pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/apex";
    return NextResponse.rewrite(url);
  }

  if (onConnect && pathname === "/") {
    return redirectTo(req, "/login", 302);
  }

  let userId = req.cookies.get("userId")?.value;
  let tenantId = req.cookies.get("tenantId")?.value;
  let role = req.cookies.get("role")?.value;
  const needsCanonicalSession = onConnect && (
    PORTAL_PREFIXES.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`)) ||
    pathname === "/dashboard" || pathname.startsWith("/dashboard/") ||
    pathname === "/login"
  );
  if (needsCanonicalSession && req.nextUrl.searchParams.get("logout") !== "1" && req.nextUrl.searchParams.get("force") !== "1") {
    const verified = await verifyConnectSession(req);
    if (verified?.refreshedCookies?.length) {
      const response = NextResponse.redirect(new URL(req.nextUrl.pathname + req.nextUrl.search, req.url), 307);
      for (const cookie of verified.refreshedCookies) response.headers.append("Set-Cookie", cookie);
      response.headers.set("Cache-Control", "private, no-store");
      return response;
    }
    if (verified) {
      userId = verified.userId;
      tenantId = verified.tenantId;
      role = verified.role;
    } else {
      userId = undefined;
      tenantId = undefined;
      role = undefined;
    }
  }

  const isDashboardPath =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");

  if (isDashboardPath) {
    if (onConnect) {
      if (userId || role) {
        return redirectTo(req, connectPortal(role), 307);
      }
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("next", "/admin");
      return NextResponse.redirect(loginUrl, 307);
    }
  }

  const isPortalRoute = PORTAL_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  if (isPortalRoute && (!userId || !role)) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return clearConnectSession(NextResponse.redirect(loginUrl, 302));
  }

  if (isPortalRoute && onConnect && userId && role) {
    const expectedPortal = connectPortal(role);
    if (expectedPortal.startsWith("/login")) {
      return clearConnectSession(NextResponse.redirect(new URL("/login?cleared=1", req.url), 307));
    }
    const requestedRoot = PORTAL_PREFIXES.find(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );
    const expectedRoot = PORTAL_PREFIXES.find(
      (prefix) => expectedPortal === prefix || expectedPortal.startsWith(`${prefix}/`)
    );
    if (requestedRoot && expectedRoot && requestedRoot !== expectedRoot) {
      return redirectTo(req, expectedPortal, 307);
    }
  }

  if (pathname === "/login/saas") {
    const res = NextResponse.redirect(new URL("/login?force=1", req.url), 307);
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return res;
  }

  if (pathname === "/login") {
    const logout = req.nextUrl.searchParams.get("logout");
    if (logout === "1") {
      const res = NextResponse.redirect(new URL("/login?cleared=1", req.url));
      res.cookies.set("userId", "", { path: "/", maxAge: 0 });
      res.cookies.set("tenantId", "", { path: "/", maxAge: 0 });
      res.cookies.set("role", "", { path: "/", maxAge: 0 });
      return res;
    }
    const next = req.nextUrl.searchParams.get("next") || "";
    if (next === "/dashboard" || next.startsWith("/dashboard/") || next.startsWith("/saas-admin")) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.searchParams.set("next", "/admin");
      return NextResponse.redirect(loginUrl, 307);
    }
    if (userId && req.nextUrl.searchParams.get("force") !== "1") {
      if (onConnect && isPlatformOnlyRole(role || "")) {
        return clearConnectSession(
          NextResponse.redirect(new URL("/login?cleared=1", req.url), 307)
        );
      }
      return redirectTo(req, onConnect ? connectPortal(role) : "/admin", 307);
    }
  }

  const isProtected = startsWithAny(pathname, PROTECTED_PREFIXES);

  if (isProtected && !userId) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl, 302);
  }

  if (isProtected && onConnect && role && isPlatformOnlyRole(role)) {
    return clearConnectSession(
      NextResponse.redirect(new URL("/login?cleared=1", req.url), 307)
    );
  }

  if (isProtected && role !== "SAAS_ADMIN" && !tenantId && !onConnect) {
    const loginUrl = new URL("/login", req.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set("userId", "", { path: "/", maxAge: 0 });
    response.cookies.set("tenantId", "", { path: "/", maxAge: 0 });
    response.cookies.set("role", "", { path: "/", maxAge: 0 });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard",
    "/dashboard/:path*",
    "/admin",
    "/admin/:path*",
    "/teacher",
    "/teacher/:path*",
    "/parent",
    "/parent/:path*",
    "/student",
    "/student/:path*",
    "/saas-admin",
    "/saas-admin/:path*",
    "/students/:path*",
    "/classes/:path*",
    "/settings/:path*",
    "/fee-management/:path*",
    "/examination/:path*",
    "/question-bank/:path*",
    "/paper-generator/:path*",
    "/transport/:path*",
    "/diary/:path*",
    "/employees/:path*",
    "/saas_admin",
    "/school_admin",
    "/super_admin",
    "/login",
    "/login/saas",
    "/login/super-app",
    "/gateway",
  ],
};
