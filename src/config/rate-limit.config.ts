/**
 * Rate limiter configuration
 *
 * Configuration center for the sistem for buy.
 * One place for settings everthing parameters the rate limiter
 */

export const RATE_LIMIT_CONFIG = {
  /**
   * Ventana de tiempo en segundos para el rate limit
   * @default 1 (1 compra por minuto)
   */
  WINDOW_SECONDS: 60,

  MAX_REQUEST_PER_WINDOW: 1,

  REDIS_KEY_PREFIX: 'rate-limit:buy-corn',

  REDIS_KEY_TTL: 65,

  HEADERS: {
    LIMIT: 'X-RateLimit-Limit',
    REMAINING: 'X-RateLimit-Remaining',
    RESET: 'X-RateLimit-Reset',
  },

  MESSAGES: {
    RATE_LIMIT_EXCEEDED: 'Too many requests. Please wait before trying again.',
    PURCHASE_SUCCESS: 'Corn purchased successfully',
    INVALID_CLIENT_ID: 'Invalid client identifier',
  },
} as const;

/**
 * type derivate on the config
 */

export type RateLimitConfig = typeof RATE_LIMIT_CONFIG;
