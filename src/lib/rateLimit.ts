const rateLimitStore = new Map<string, number[]>();

export function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;

  if (!rateLimitStore.has(identifier)) {
    rateLimitStore.set(identifier, []);
  }

  const timestamps = rateLimitStore.get(identifier)!;

  // Remove old timestamps
  const validTimestamps = timestamps.filter(ts => ts > windowStart);
  rateLimitStore.set(identifier, validTimestamps);

  if (validTimestamps.length >= limit) {
    return false; // Rate limit exceeded
  }

  validTimestamps.push(now);
  return true;
}