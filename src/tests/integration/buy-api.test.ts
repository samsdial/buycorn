import type { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it } from 'vitest';

import { GET, POST } from '@/app/api/buy/route';
import { resetRateLimit } from '@/lib/rate-limiter';
import type { ClientIdentifier } from '@/modules/buy-corn/types';

function createMockRequest(ip: string = '127.0.0.1'): NextRequest {
  const headers = new Headers();
  headers.set('x-forwarded-for', ip);

  return {
    headers,
    method: 'POST',
    url: 'http://localhost:3000/api/buy',
  } as NextRequest;
}

describe('POST /api/buy', () => {
  const mockClient: ClientIdentifier = {
    id: '127.0.0.1',
    type: 'ip',
  };
  beforeEach(async () => {
    await resetRateLimit(mockClient);
  });

  it('debería permitir la primera compra', async () => {
    const request = createMockRequest();
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toContain('successfully');

    expect(data.data).toBeDefined();
    if (data.data) {
      expect(data.data).toHaveProperty('purchasedAt');
      expect(data.data).toHaveProperty('nextPurchaseAllowedAt');
    }
  });

  it('debería bloquear la segunda compra inmediata (429)', async () => {
    const request = createMockRequest();

    await POST(request);

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
    expect(data.retryAfter).toBeGreaterThan(0);
  });

  it('debería incluir headers de rate limit en la respuesta', async () => {
    const request = createMockRequest();
    const response = await POST(request);

    expect(response.headers.get('X-RateLimit-Limit')).toBe('1');
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
    expect(response.headers.get('X-RateLimit-Reset')).toBeDefined();
  });
  it('debería incluir Retry-After header cuando está bloqueado', async () => {
    const request = createMockRequest();

    await POST(request);

    const response = await POST(request);

    expect(response.headers.get('Retry-After')).toBeDefined();
    const retryAfter = parseInt(response.headers.get('Retry-After') || '0', 10);
    expect(retryAfter).toBeGreaterThan(0);
    expect(retryAfter).toBeLessThanOrEqual(60);
  });
  it('debería manejar diferentes IPs independientemente', async () => {
    const request1 = createMockRequest('192.168.1.1');
    const request2 = createMockRequest('192.168.1.2');

    const response1 = await POST(request1);
    expect(response1.status).toBe(200);

    const response2 = await POST(request2);
    expect(response2.status).toBe(200);

    await resetRateLimit({ id: '192.168.1.1', type: 'ip' });
    await resetRateLimit({ id: '192.168.1.2', type: 'ip' });
  });
  it('debería devolver respuesta válida incluso con errores', async () => {
    const request = createMockRequest();
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(600);
    expect(data).toBeDefined();
    expect(typeof data.success).toBe('boolean');
  });
});
describe('GET /api/buy', () => {
  it('', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(405);
    expect(data.error).toContain('Method not allowed');
    expect(response.headers.get('Allow')).toBe('POST');
  });
});
