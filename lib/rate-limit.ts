/**
 * Simple in-memory rate limiter for API routes
 * For production, consider using Redis or another distributed solution
 */

// Track request counts by IP
interface RateLimitCounter {
  count: number;
  resetTime: number;
}

// Store IP-based counters
const ipLimiters: Record<string, RateLimitCounter> = {};

// Store user-based counters
const userLimiters: Record<string, RateLimitCounter> = {};

// Default limits
const DEFAULT_WINDOW_MS = 60 * 1000; // 1 minute
const DEFAULT_MAX_REQUESTS = 20; // 20 requests per minute

/**
 * Limits requests by IP address
 */
export async function limitByIp(
  req: Request,
  options: {
    windowMs?: number;
    maxRequests?: number;
  } = {},
): Promise<boolean> {
  const windowMs = options.windowMs || DEFAULT_WINDOW_MS;
  const maxRequests = options.maxRequests || DEFAULT_MAX_REQUESTS;

  // Get client IP from headers or default to unknown
  const ip = (req.headers.get('x-forwarded-for') ?? '127.0.0.1')
    .split(',')[0]
    .trim();

  const now = Date.now();

  // Initialize or get existing counter
  if (!ipLimiters[ip] || ipLimiters[ip].resetTime < now) {
    ipLimiters[ip] = {
      count: 0,
      resetTime: now + windowMs,
    };
  }

  // Increment counter
  ipLimiters[ip].count++;

  // Check if limit exceeded
  return ipLimiters[ip].count > maxRequests;
}

/**
 * Limits requests by user ID
 */
export async function limitByUser(
  userId: string,
  options: {
    windowMs?: number;
    maxRequests?: number;
  } = {},
): Promise<boolean> {
  const windowMs = options.windowMs || DEFAULT_WINDOW_MS;
  const maxRequests = options.maxRequests || DEFAULT_MAX_REQUESTS;

  const now = Date.now();

  // Initialize or get existing counter
  if (!userLimiters[userId] || userLimiters[userId].resetTime < now) {
    userLimiters[userId] = {
      count: 0,
      resetTime: now + windowMs,
    };
  }

  // Increment counter
  userLimiters[userId].count++;

  // Check if limit exceeded
  return userLimiters[userId].count > maxRequests;
}

// Periodically clean up expired limiter entries
setInterval(() => {
  const now = Date.now();

  // Clean up IP limiters
  Object.keys(ipLimiters).forEach((ip) => {
    if (ipLimiters[ip].resetTime < now) {
      delete ipLimiters[ip];
    }
  });

  // Clean up user limiters
  Object.keys(userLimiters).forEach((userId) => {
    if (userLimiters[userId].resetTime < now) {
      delete userLimiters[userId];
    }
  });
}, 60 * 1000); // Run cleanup every minute
