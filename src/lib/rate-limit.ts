import 'server-only';

import { headers } from 'next/headers';

/**
 * Best-effort in-memory rate limiter for Server Actions.
 *
 * A fixed-window counter keyed by `<bucket>:<identifier>`. This lives in the
 * process memory, so it is per-instance (a horizontally-scaled deployment would
 * want Redis instead) — but it stops trivial brute-force / spam from a single
 * client, which is the goal here.
 */

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

export interface RateLimitResult {
  ok: boolean;
  retryAfterSec: number;
}

/**
 * Record a hit against `key` and report whether it is within `limit` per
 * `windowMs`. Call once per protected action.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }

  entry.count += 1;
  if (entry.count > limit) {
    return { ok: false, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfterSec: 0 };
}

/** Best-effort client IP from proxy headers; falls back to 'unknown'. */
export async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]!.trim();
  return h.get('x-real-ip') ?? 'unknown';
}

// Opportunistic cleanup so the map can't grow unbounded across a long-lived
// process. Runs on write when the map gets large.
function maybeSweep(): void {
  if (store.size < 5000) return;
  const now = Date.now();
  for (const [k, v] of store) {
    if (now >= v.resetAt) store.delete(k);
  }
}

const _rateLimit = rateLimit;
export function rateLimitWithSweep(key: string, limit: number, windowMs: number): RateLimitResult {
  maybeSweep();
  return _rateLimit(key, limit, windowMs);
}
