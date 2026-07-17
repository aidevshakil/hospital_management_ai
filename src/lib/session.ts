import 'server-only';

/**
 * Minimal signed-cookie sessions for patient and admin auth.
 *
 * A cookie holds `<id>.<hmac>` where the HMAC is computed over `<purpose>:<id>`
 * with SESSION_SECRET. Binding the purpose into the signature means a patient
 * cookie can never be replayed as an admin cookie (and vice-versa), even though
 * both are signed with the same secret. Cookies are httpOnly so client JS can't
 * read them.
 *
 * The signing scheme (hex HMAC-SHA256 over `purpose:id`) is mirrored with Web
 * Crypto in middleware.ts — keep the two in sync.
 */
import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'crypto';

type Purpose = 'patient' | 'admin';

const COOKIE_NAME: Record<Purpose, string> = {
  patient: 'hma_session',
  admin: 'hma_admin_session',
};
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error('SESSION_SECRET is not set. Add it to frontend/.env');
  return s;
}

function sign(purpose: Purpose, id: string): string {
  return createHmac('sha256', secret()).update(`${purpose}:${id}`).digest('hex');
}

function tokenFor(purpose: Purpose, id: string): string {
  return `${id}.${sign(purpose, id)}`;
}

function verify(purpose: Purpose, token: string | undefined): string | null {
  if (!token) return null;
  const idx = token.lastIndexOf('.');
  if (idx <= 0) return null;
  const id = token.slice(0, idx);
  const providedSig = token.slice(idx + 1);
  const expectedSig = sign(purpose, id);
  const a = Buffer.from(providedSig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return id;
}

async function getId(purpose: Purpose): Promise<string | null> {
  const store = await cookies();
  return verify(purpose, store.get(COOKIE_NAME[purpose])?.value);
}

async function setCookie(purpose: Purpose, id: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME[purpose], tokenFor(purpose, id), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  });
}

async function clearCookie(purpose: Purpose): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME[purpose]);
}

// Patient session
export const getSessionPatientId = () => getId('patient');
export const setSessionCookie = (id: string) => setCookie('patient', id);
export const clearSessionCookie = () => clearCookie('patient');

// Admin session
export const getSessionAdminId = () => getId('admin');
export const setAdminSessionCookie = (id: string) => setCookie('admin', id);
export const clearAdminSessionCookie = () => clearCookie('admin');
