// src/app/api/[...path]/route.ts
// Proxy all /api/* requests from the Next.js frontend to the backend.

import { NextRequest, NextResponse } from 'next/server';
import { envString } from '@/lib/server/env';
import { isIP } from 'node:net';

export const dynamic = 'force-dynamic';

function getBackendApiUrl() {
  const configured = envString('BACKEND_URL', 'http://127.0.0.1:5000/api');
  if (!configured) {
    throw new Error('Missing required environment variable: BACKEND_URL');
  }
  return configured.replace(/\/$/, '');
}

function notFound(req: NextRequest) {
  return NextResponse.json(
    { success: false, message: `Route not found: ${req.method} ${req.nextUrl.pathname}` },
    { status: 404 }
  );
}

async function dispatchLocalApi(req: NextRequest, targetPath: string) {
  const parts = targetPath.split('/');
  const [scope, resource, id, action] = parts;

  if (targetPath === 'school/settings/current' && req.method === 'GET') {
    const currentSchoolSettings = await import('../school/settings/current/route');
    return currentSchoolSettings.GET();
  }

  if (scope !== 'saas-admin' || resource !== 'subscription-requests') {
    return null;
  }

  if (!id && !action && req.method === 'GET') {
    const subscriptionList = await import('../saas-admin/subscription-requests/route');
    return subscriptionList.GET(req);
  }

  if (id && !action && req.method === 'GET') {
    const subscriptionDetail = await import('../saas-admin/subscription-requests/[id]/route');
    return subscriptionDetail.GET(req, { params: Promise.resolve({ id }) });
  }

  if (id && action === 'approve' && req.method === 'POST') {
    const subscriptionApprove = await import('../saas-admin/subscription-requests/[id]/approve/route');
    return subscriptionApprove.POST(req, { params: Promise.resolve({ id }) });
  }

  if (id && action === 'reject' && req.method === 'POST') {
    const subscriptionReject = await import('../saas-admin/subscription-requests/[id]/reject/route');
    return subscriptionReject.POST(req, { params: Promise.resolve({ id }) });
  }

  return notFound(req);
}

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const targetPath = path.join('/');
  // Protect one-time credential issuance against cross-origin browser requests.
  if ((targetPath === 'auth/users/provision-one' && req.method === 'POST') ||
      (targetPath === 'auth/users/guardian-contact' && req.method === 'PATCH') ||
      (targetPath === 'auth/users/resolve-distinct-guardian' && req.method === 'POST') ||
      (targetPath.startsWith('auth/users/pending-activation/') && req.method === 'POST') ||
      (targetPath.startsWith('portal/paper-studio/papers/') && req.method === 'PATCH')) {
    const origin = req.headers.get('origin');
    if (origin) {
      let allowed = false;
      try {
        const originUrl = new URL(origin);
        // Raw Host is the browser's request authority and is preserved by our Nginx config.
        // Do not trust X-Forwarded-Host here: it can be rewritten upstream and must not
        // become a CSRF bypass primitive. X-Forwarded-Proto is used only as an extra
        // scheme check when present behind the trusted reverse proxy.
        const requestHost = (req.headers.get('host') || req.nextUrl.host || '').toLowerCase();
        const forwardedProto = req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim()?.toLowerCase();
        const hostMatches = originUrl.host.toLowerCase() === requestHost;
        const schemeMatches = !forwardedProto || originUrl.protocol.toLowerCase() === `${forwardedProto}:`;
        allowed = hostMatches && schemeMatches;
      } catch {
        allowed = false;
      }
      if (!allowed) {
        return NextResponse.json({ success: false, message: 'Origin not allowed.' }, { status: 403 });
      }
    }
  }
  const localResponse = await dispatchLocalApi(req, targetPath);
  if (localResponse) {
    return localResponse;
  }

  const searchParams = req.nextUrl.searchParams.toString();
  let url: string;
  try {
    url = `${getBackendApiUrl()}/${targetPath}${searchParams ? `?${searchParams}` : ''}`;
  } catch {
    return NextResponse.json(
      { success: false, message: 'Backend URL is not configured.' },
      { status: 503 }
    );
  }

  const headers: Record<string, string> = {};
  const incomingContentType = req.headers.get('content-type');
  if (incomingContentType) {
    headers['Content-Type'] = incomingContentType;
  } else {
    headers['Content-Type'] = 'application/json';
  }

  const auth = req.headers.get('Authorization');
  if (auth) headers['Authorization'] = auth;
  const cookie = req.headers.get('cookie');
  if (cookie) headers['Cookie'] = cookie;
  // Nginx sets X-Real-IP from its verified connection (Cloudflare peer
  // ranges are pinned at Nginx). Pass one canonical value rather than a
  // user-controlled X-Forwarded-For chain. Backend trusts only one hop.
  const trustedClientIp = req.headers.get('x-real-ip')?.trim() || '';
  if (isIP(trustedClientIp)) headers['X-Forwarded-For'] = trustedClientIp;

  try {
    const body = req.method !== 'GET' && req.method !== 'HEAD' ? await req.arrayBuffer() : undefined;

    const response = await fetch(url, {
      method: req.method,
      headers,
      body,
    });

    const contentType = response.headers.get('content-type') || '';
    const copySetCookies = (out: NextResponse) => {
      const getSetCookie = (response.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie;
      const cookies = typeof getSetCookie === 'function'
        ? getSetCookie.call(response.headers)
        : (response.headers.get('set-cookie') ? [response.headers.get('set-cookie') as string] : []);
      for (const value of cookies) out.headers.append('Set-Cookie', value);
      for (const name of ['ratelimit-limit', 'ratelimit-remaining', 'ratelimit-reset', 'retry-after', 'cache-control', 'pragma']) {
        const value = response.headers.get(name);
        if (value) out.headers.set(name, value);
      }
      return out;
    };

    if (contentType.includes('application/json')) {
      const data = await response.json();
      return copySetCookies(NextResponse.json(data, { status: response.status }));
    }

    const text = await response.text();
    return copySetCookies(new NextResponse(text, {
      status: response.status,
      headers: {
        'Content-Type': contentType || 'text/plain; charset=utf-8',
      },
    }));
  } catch {
    return NextResponse.json(
      { success: false, message: 'Backend server is not reachable. Please start the backend on port 5000.' },
      { status: 503 }
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
export const OPTIONS = handler;
