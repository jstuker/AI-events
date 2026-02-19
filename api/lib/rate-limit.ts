// Shared in-memory rate limiting for Vercel serverless functions.
// Resets on cold start — best-effort protection, not a substitute
// for edge-level rate limiting on high-traffic endpoints.

export interface RateLimitEntry {
  readonly count: number;
  readonly resetAt: number;
}

export function createRateLimitMap(): Map<string, RateLimitEntry> {
  return new Map<string, RateLimitEntry>();
}

export function isRateLimited(
  map: Map<string, RateLimitEntry>,
  ip: string,
  max: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const entry = map.get(ip);

  if (!entry || now > entry.resetAt) {
    map.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }

  const updated: RateLimitEntry = { count: entry.count + 1, resetAt: entry.resetAt };
  map.set(ip, updated);
  return updated.count > max;
}

/**
 * Extract the client IP from Vercel request headers.
 * Prefers x-real-ip (set by Vercel, not spoofable) over x-forwarded-for.
 */
export function getClientIp(headers: Record<string, string | string[] | undefined>): string {
  const realIp = headers["x-real-ip"];
  if (typeof realIp === "string" && realIp) {
    return realIp.trim();
  }
  const forwarded = headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return "unknown";
}
