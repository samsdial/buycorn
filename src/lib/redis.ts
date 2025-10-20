import { Redis } from '@upstash/redis';

function validateRedisConfig(): {
  url: string;
  token: string;
} {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error(
      'Missing Redis configuration. Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env.local'
    );
  }
  return { url, token };
}

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (redisClient) {
    return redisClient;
  }
  const { url, token } = validateRedisConfig();

  redisClient = new Redis({
    url,
    token,
    retry: {
      retries: 3,
      backoff: (retryCount) => Math.min(1000 * 2 ** retryCount, 3000),
    },
  });

  return redisClient;
}

export async function testRedisConnection(): Promise<boolean> {
  try {
    const redis = getRedisClient();
    const result = await redis.ping();
    return result === 'PONG';
  } catch (error) {
    console.error('Redis connection test failed:', error);
    return false;
  }
}

export function closeRedisConnection(): void {
  redisClient = null;
}

export function isRedisAvailable(): boolean {
  try {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    return Boolean(url && token);
  } catch {
    return false;
  }
}
