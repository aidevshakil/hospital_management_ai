import { NextRequest, NextResponse } from 'next/server';

/**
 * Protects /admin/* — everything except /admin/login requires a valid admin
 * session cookie. Verification mirrors src/lib/session.ts: hex HMAC-SHA256 over
 * `admin:<id>`, done here with Web Crypto because middleware runs on the Edge
 * runtime (no node:crypto).
 *
 * This gate is signature-only; the admin layout additionally calls
 * getCurrentAdmin() (which confirms the id exists in the Admin table).
 */

const ADMIN_COOKIE = 'hma_admin_session';

function hex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function isValidAdminToken(token: string | undefined, secret: string): Promise<boolean> {
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
    ['sign']
  );
  const mac = await crypto.subtle.sign('HMAC', key, enc.encode(`admin:${id}`));
  const expectedSig = hex(mac);

  if (providedSig.length !== expectedSig.length) return false;
  // Constant-time-ish comparison.
  let diff = 0;
  for (let i = 0; i < expectedSig.length; i++) {
    diff |= providedSig.charCodeAt(i) ^ expectedSig.charCodeAt(i);
  }
  return diff === 0;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The login page must stay reachable without a session.
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  const secret = process.env.SESSION_SECRET;
  const token = request.cookies.get(ADMIN_COOKIE)?.value;

  if (!secret || !(await isValidAdminToken(token, secret))) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
