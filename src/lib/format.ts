/**
 * Formatting helpers shared across server components.
 */

/** Format a date as "Oct 10, 2023". Returns a fallback for null/undefined. */
export function formatDate(date: Date | null | undefined, fallback = '—'): string {
  if (!date) return fallback;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Format a date as a relative label like "10 minutes ago", "Yesterday", "3 days ago". */
export function formatRelative(date: Date, now: Date = new Date()): string {
  const diffMs = now.getTime() - date.getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min} minute${min > 1 ? 's' : ''} ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hour${hr > 1 ? 's' : ''} ago`;
  const day = Math.floor(hr / 24);
  if (day === 1) return 'Yesterday';
  if (day < 7) return `${day} days ago`;
  return formatDate(date);
}
