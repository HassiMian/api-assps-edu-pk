// src/app/api/[...path]/route.ts
// Proxy all /api/* requests from the Next.js frontend to the backend.

import { NextRequest, NextResponse } from 'next/server';
import { envString } from '@/lib/server/env';
import * as subscriptionList from '../saas-admin/subscription-requests/route';
import * as subscriptionDetail from '../saas-admin/subscription-requests/[id]/route';
import * as subscriptionApprove from '../saas-admin/subscription-requests/[id]/approve/route';
import * as subscriptionReject from '../saas-admin/subscription-requests/[id]/reject/route';
import * as currentSchoolSettings from '../school/settings/current/route';

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
    return currentSchoolSettings.GET();
  }

  if (scope !== 'saas-admin' || resource !== 'subscription-requests') {
    return null;
  }

  if (!id && !action && req.method === 'GET') {
    return subscriptionList.GET(req);
  }

  if (id && !action && req.method === 'GET') {
    return subscriptionDetail.GET(req, { params: Promise.resolve({ id }) });
  }

  if (id && action === 'approve' && req.method === 'POST') {
    return subscriptionApprove.POST(req, { params: Promise.resolve({ id }) });
  }

  if (id && action === 'reject' && req.method === 'POST') {
    return subscriptionReject.POST(req, { params: Promise.resolve({ id }) });
  }

  return notFound(req);
}

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const targetPath = path.join('/');
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

  try {
    const body = req.method !== 'GET' && req.method !== 'HEAD' ? await req.arrayBuffer() : undefined;

    const response = await fetch(url, {
      method: req.method,
      headers,
      body,
    });

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: {
        'Content-Type': contentType || 'text/plain; charset=utf-8',
      },
    });
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
