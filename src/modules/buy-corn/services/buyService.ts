import type { BuyApiResponse } from '@/modules/buy-corn/types';

export async function buyCorn(): Promise<BuyApiResponse> {
  const response = await fetch('/api/buy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok && response.status !== 429) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export function getRateLimitInfo(response: Response) {
  return {
    limit: parseInt(response.headers.get('X-RateLimit-Limit') || '0', 10),
    remaining: parseInt(response.headers.get('X-RateLimit-Limit') || '0', 10),
    reset: parseInt(response.headers.get('X-RateLimit-Limit') || '0', 10),
    retryAfter: parseInt(response.headers.get('X-RateLimit-Limit') || '0', 10),
  };
}
