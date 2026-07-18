import { NextRequest, NextResponse } from 'next/server';

/**
 * Route protection for the three signed-in areas:
 *   /admin/*   → admin session   (except /admin/login)
 *   /doctor/*  → doctor session  (except /doctor/login)
 *   /profile/* → patient session
 *
 * Verification mirrors src/lib/session.ts: hex HMAC-SHA256 over `<purpose>:<id>`,
 * done here with Web Crypto because middleware runs on the Edge runtime (no
 * node:crypto). Binding the purpose into the signature means one area's cookie
 * can never be replayed against another.
 *
 * This gate is signature-only; each area's server code additionally confirms the
 * id still exists (getCurrentAdmin / getCurrentDoctor / getSessionPatientId).
 */

type Purpose = 'admin' | 'doctor' | 'patient';

const COOKIE: Record<Purpose, string> = {
  admin: 'hma_admin_session',
  doctor: 'hma_doctor_session',
  patient: 'hma_session',
};

const LOGIN_PATH: Record<Purpose, string> = {
  admin: '/admin/login',
  doctor: '/doctor/login',
  patient: '/login',
};

function hex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function isValidToken(
  token: string | undefined,
  secret: string,
  purpose: Purpose,
): Promise<boolean> {
  if (!token) return false;
  const idx = token.lastIndexOf('.');
  if (idx <= 0) return false;
  const id = token.slice(0, idx);
  const providedSig = token.slice(idx + 1);

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const mac = await crypto.subtle.sign('HMAC', key, enc.encode(`${purpose}:${id}`));
  const expectedSig = hex(mac);

  if (providedSig.length !== expectedSig.length) return false;
  let diff = 0;
  for (let i = 0; i < expectedSig.length; i++) {
    diff |= providedSig.charCodeAt(i) ^ expectedSig.charCodeAt(i);
  }
  return diff === 0;
}

function purposeFor(pathname: string): Purpose | null {
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname.startsWith('/doctor')) return 'doctor';
  if (pathname.startsWith('/profile')) return 'patient';
  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const purpose = purposeFor(pathname);
  if (!purpose) return NextResponse.next();

  // Login pages must stay reachable without a session.
  if (pathname === LOGIN_PATH[purpose]) {
    return NextResponse.next();
  }

  const secret = process.env.SESSION_SECRET;
  const token = request.cookies.get(COOKIE[purpose])?.value;

  if (!secret || !(await isValidToken(token, secret, purpose))) {
    const loginUrl = new URL(LOGIN_PATH[purpose], request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/doctor/:path*', '/profile/:path*'],
};
