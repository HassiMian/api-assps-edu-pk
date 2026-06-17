// src/app/api/proxy/[...path]/route.ts
// This proxy forwards all requests from the Next.js frontend to the backend
// eliminating CORS issues entirely.

import { NextRequest, NextResponse } from 'next/server';
import { envString } from '@/lib/server/env';

export const dynamic = 'force-dynamic';

function getBackendApiUrl() {
  const configured = envString('BACKEND_URL', 'http://127.0.0.1:5000/api');
  if (!configured) {
    throw new Error('Missing required environment variable: BACKEND_URL');
  }
  return configured.replace(/\/$/, '');
}

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const targetPath = path.join('/');
  const searchParams = req.nextUrl.searchParams.toString();
  const isUploadAsset = targetPath.startsWith('uploads/');
  let url: string;
  try {
    const backendApiUrl = getBackendApiUrl();
    const backendRoot = backendApiUrl.replace(/\/api\/?$/i, '').replace(/\/$/, '');
    const urlBase = isUploadAsset ? backendRoot : backendApiUrl;
    url = `${urlBase}/${targetPath}${searchParams ? `?${searchParams}` : ''}`;
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

  // Forward the Authorization header if present
  const auth = req.headers.get('Authorization');
  if (auth) headers['Authorization'] = auth;

  try {
    const body = req.method !== 'GET' && req.method !== 'HEAD'
      ? await req.arrayBuffer()
      : undefined;

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

    const buffer = await response.arrayBuffer();
    return new NextResponse(buffer, {
      status: response.status,
      headers: {
        'Content-Type': contentType || 'application/octet-stream',
        'Cache-Control': response.headers.get('cache-control') || 'no-store',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Backend server is not reachable. Please start the backend on port 3001.' },
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
