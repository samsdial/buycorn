import { RATE_LIMIT_CONFIG } from '@/config/rate-limit.config';
import { ClientIdentifier, RateLimitResults } from '@/modules/buy-corn/types';

const mockStore = new Map<string, number>();

function generateRedisKey(clientId: string): string {
  return `${RATE_LIMIT_CONFIG.REDIS_KEY_PREFIX}:${clientId}`;
}

function calculateResentTimestamp(lastAttemptTime: number): number {
  return lastAttemptTime + RATE_LIMIT_CONFIG.WINDOW_SECONDS * 1000;
}

export async function checkRateLimit(client: ClientIdentifier): Promise<RateLimitResults> {
  const now = Date.now();
  const key = generateRedisKey(client.id);
  const lastAttempt = mockStore.get(key);

  if (!lastAttempt) {
    return {
      allowed: true,
      remaining: RATE_LIMIT_CONFIG.MAX_REQUEST_PER_WINDOW - 1,
      resetAt: calculateResentTimestamp(now),
      limit: RATE_LIMIT_CONFIG.MAX_REQUEST_PER_WINDOW,
    };
  }

  const timeElapsed = now - lastAttempt;
  const windowMs = RATE_LIMIT_CONFIG.WINDOW_SECONDS * 1000;

  if (timeElapsed >= windowMs) {
    return {
      allowed: true,
      remaining: RATE_LIMIT_CONFIG.MAX_REQUEST_PER_WINDOW - 1,
      resetAt: calculateResentTimestamp(now),
      limit: RATE_LIMIT_CONFIG.MAX_REQUEST_PER_WINDOW,
    };
  }
  return {
    allowed: false,
    remaining: 0,
    resetAt: calculateResentTimestamp(lastAttempt),
    limit: RATE_LIMIT_CONFIG.MAX_REQUEST_PER_WINDOW,
  };
}

export async function recordAttempt(client: ClientIdentifier) {
  const key = generateRedisKey(client.id);
  const now = Date.now();

  mockStore.set(key, now);
}
export async function resetRateLimit(client: ClientIdentifier): Promise<void> {
  const key = generateRedisKey(client.id);
  mockStore.delete(key);
}
export async function getRateLimitDebugInfo(client: ClientIdentifier) {
  const key = generateRedisKey(client.id);
  const lastAttempt = mockStore.get(key);
  const now = Date.now();
  if (!lastAttempt) {
    return {
      clientId: client.id,
      timestamp: now,
      windowStart: now,
      windowEnd: now + RATE_LIMIT_CONFIG.WINDOW_SECONDS * 1000,
      requestCount: 0,
      isAllowed: true,
    };
  }

  const windowMs = RATE_LIMIT_CONFIG.WINDOW_SECONDS * 1000;
  const timeElapsed = now - lastAttempt;
  const isAllowed = timeElapsed >= windowMs;

  return {
    clientId: client.id,
    timestamp: now,
    windowStart: lastAttempt,
    windowEnd: lastAttempt + windowMs,
    requestCount: isAllowed ? 0 : 1,
    isAllowed,
  };
}
