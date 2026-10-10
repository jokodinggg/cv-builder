const windows = new Map<string, { start: number; count: number }>();

/**
 * Fixed-window, in-memory limiter. Returns true when the call is allowed.
 * Per process only: fine for one server; use Redis or similar when running several instances.
 */
export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()): boolean {
  const current = windows.get(key);
  if (!current || now - current.start > windowMs) {
    windows.set(key, { start: now, count: 1 });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}
