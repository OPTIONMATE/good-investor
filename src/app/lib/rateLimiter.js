/**
 * Rate Limiting Module
 * 
 * Memory-based rate limiter for development
 * For production with multiple instances: use Redis
 * 
 * Supports:
 * - Per-IP rate limiting
 * - Per-user rate limiting
 * - Per-endpoint rate limiting
 * - Different limits for different routes
 */

// Store: { key: [timestamp, timestamp, timestamp, ...] }
const rateLimitStore = new Map();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  const MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours
  
  for (const [key, timestamps] of rateLimitStore.entries()) {
    const filtered = timestamps.filter(ts => now - ts < MAX_AGE);
    if (filtered.length === 0) {
      rateLimitStore.delete(key);
    } else {
      rateLimitStore.set(key, filtered);
    }
  }
}, 5 * 60 * 1000);

/**
 * Get client IP from request
 * Handles X-Forwarded-For and X-Real-IP headers
 */
function getClientIp(request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

/**
 * Check if request is rate limited
 * @param {string} key - Unique identifier (e.g., "ip:127.0.0.1", "user:123", "login:user@email.com")
 * @param {number} maxRequests - Max requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {object} { limited: boolean, remaining: number, resetTime: number }
 */
export function isRateLimited(key, maxRequests = 10, windowMs = 60 * 1000) {
  const now = Date.now();
  
  // Get or initialize timestamps array
  let timestamps = rateLimitStore.get(key) || [];
  
  // Remove timestamps outside the window
  timestamps = timestamps.filter(ts => now - ts < windowMs);
  
  // Check if limited
  const limited = timestamps.length >= maxRequests;
  const remaining = Math.max(0, maxRequests - timestamps.length);
  const resetTime = timestamps.length > 0 
    ? timestamps[0] + windowMs 
    : now + windowMs;
  
  // Add current timestamp if not limited (allow request)
  if (!limited) {
    timestamps.push(now);
    rateLimitStore.set(key, timestamps);
  }
  
  return {
    limited,
    remaining,
    resetTime,
    retryAfter: limited ? Math.ceil((resetTime - now) / 1000) : 0,
  };
}

/**
 * Rate limit middleware factory
 * Creates middleware for specific endpoints
 */
export function createRateLimiter(options = {}) {
  const {
    maxRequests = 10,
    windowMs = 60 * 1000,
    keyGenerator = getClientIp,
    skip = () => false,
  } = options;
  
  return function rateLimitMiddleware(request) {
    // Skip rate limiting if condition met
    if (skip(request)) {
      return { limited: false };
    }
    
    // Generate unique key
    const key = keyGenerator(request);
    
    // Check rate limit
    return isRateLimited(key, maxRequests, windowMs);
  };
}

/**
 * Predefined rate limiters
 */
export const rateLimiters = {
  // Strict - for login, payment, admin
  strict: createRateLimiter({
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  }),
  
  // Medium - for API endpoints
  medium: createRateLimiter({
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minute
  }),
  
  // Lenient - for public endpoints
  lenient: createRateLimiter({
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  }),
};

/**
 * Per-user rate limiter (for authenticated endpoints)
 */
export function createPerUserRateLimiter(userId, maxRequests = 20, windowMs = 60 * 1000) {
  const key = `user:${userId}`;
  return isRateLimited(key, maxRequests, windowMs);
}

/**
 * Per-IP rate limiter
 */
export function createPerIpRateLimiter(request, maxRequests = 10, windowMs = 60 * 1000) {
  const ip = getClientIp(request);
  const key = `ip:${ip}`;
  return isRateLimited(key, maxRequests, windowMs);
}

/**
 * Per-email rate limiter (for OTP, password reset, etc.)
 */
export function createPerEmailRateLimiter(email, maxRequests = 5, windowMs = 15 * 60 * 1000) {
  const key = `email:${email.toLowerCase()}`;
  return isRateLimited(key, maxRequests, windowMs);
}

/**
 * Reset rate limit for a key (admin use)
 */
export function resetRateLimit(key) {
  rateLimitStore.delete(key);
}

/**
 * Clear all rate limits (admin use)
 */
export function clearAllRateLimits() {
  rateLimitStore.clear();
}

/**
 * Get rate limit stats (for monitoring)
 */
export function getRateLimitStats() {
  return {
    totalKeys: rateLimitStore.size,
    entries: Array.from(rateLimitStore.entries()).map(([key, timestamps]) => ({
      key,
      count: timestamps.length,
      oldestRequest: timestamps[0],
      newestRequest: timestamps[timestamps.length - 1],
    })),
  };
}
