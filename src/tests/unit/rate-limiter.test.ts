/**
 * Rate limiter unit tests
 *
 * Test for validation and configuration of rate limiting settings.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RATE_LIMIT_CONFIG } from '@/config/rate-limit.config';
import {
  checkRateLimit,
  getRateLimitDebugInfo,
  recordAttempt,
  resetRateLimit,
} from '@/lib/rate-limiter';
import { ClientIdentifier } from '@/modules/buy-corn/types';

describe('RateLimiter basico', () => {
  const mockClient: ClientIdentifier = {
    id: 'test-client-123',
    type: 'session',
  };

  beforeEach(async () => {
    await resetRateLimit(mockClient);
  });

  describe('checkRateLimit', () => {
    it(' deberia permitir solicitudes dentro del limite', async () => {
      const result = await checkRateLimit(mockClient);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(0);
      expect(result.limit).toBe(1);
      expect(result.resetAt).toBeGreaterThan(Date.now());
    });

    it('deberia bloquear el segundo intento dentro de la ventana', async () => {
      await recordAttempt(mockClient);
      const result = await checkRateLimit(mockClient);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.limit).toBe(1);
    });
    //it('', async () => {});
    it('deberia calcular el restear correctamente', async () => {
      const beforeTime = Date.now();
      await recordAttempt(mockClient);

      const result = await checkRateLimit(mockClient);
      const expectedResetTime = beforeTime + RATE_LIMIT_CONFIG.WINDOW_SECONDS * 1000;

      expect(result.resetAt).toBeGreaterThanOrEqual(expectedResetTime);
      expect(result.resetAt).toBeLessThan(expectedResetTime + 1000);
    });

    it('debería permmitir un nuevo intento depues de que cierre la ventana', async () => {
      const now = Date.now();
      const pastTime = now - (RATE_LIMIT_CONFIG.WINDOW_SECONDS * 1000 + 1000);

      vi.spyOn(Date, 'now').mockReturnValueOnce(pastTime);
      await recordAttempt(mockClient);

      vi.restoreAllMocks();

      const result = await checkRateLimit(mockClient);
      expect(result.allowed).toBe(true);
    });
  });

  describe('recordAttempt', () => {
    it('Deberia  registar un intento correctamente', async () => {
      await recordAttempt(mockClient);

      const result = await checkRateLimit(mockClient);
      expect(result.allowed).toBe(false);
    });

    it('Deberia actualizar el timestamp en cada intento', async () => {
      await recordAttempt(mockClient);
      const firstCheck = await getRateLimitDebugInfo(mockClient);

      await new Promise((resolve) => setTimeout(resolve, 10));

      await resetRateLimit(mockClient);
      await recordAttempt(mockClient);
      const secondCheck = await getRateLimitDebugInfo(mockClient);

      expect(secondCheck.timestamp).toBeGreaterThan(firstCheck.timestamp);
    });
  });

  describe('resetRateLimit', () => {
    it('Deberia limipiar el rate limit del cliente', async () => {
      await recordAttempt(mockClient);

      const resultBlocked = await checkRateLimit(mockClient);
      expect(resultBlocked.allowed).toBe(false);

      await resetRateLimit(mockClient);

      const resultAllowed = await checkRateLimit(mockClient);
      expect(resultAllowed.allowed).toBe(true);
    });

    it('deberia no causar error si se llama múltiples veces', async () => {
      await resetRateLimit(mockClient);
      await resetRateLimit(mockClient);
      await resetRateLimit(mockClient);

      const result = await checkRateLimit(mockClient);
      expect(result.allowed).toBe(true);
    });
    it('', async () => {});
  });

  describe('Obtener informacion de depuracion de limite de velocidad', () => {
    it('debería retornar informacion correcta cuando no hay intentos previos', async () => {
      const debugInfo = await getRateLimitDebugInfo(mockClient);

      expect(debugInfo.clientId).toBe(mockClient.id);
      expect(debugInfo.requestCount).toBe(0);
      expect(debugInfo.isAllowed).toBe(true);
      expect(debugInfo.timestamp).toBeGreaterThan(0);
      expect(debugInfo.windowEnd).toBeGreaterThan(debugInfo.windowStart);
    });

    it('debería retornar informacion correcta después de el intento', async () => {
      await recordAttempt(mockClient);
      const debugInfo = await getRateLimitDebugInfo(mockClient);

      expect(debugInfo.clientId).toBe(mockClient.id);
      expect(debugInfo.requestCount).toBe(1);
      expect(debugInfo.isAllowed).toBe(false);
      expect(debugInfo.windowEnd).toBeGreaterThan(debugInfo.windowStart);
    });

    it('debería calcular la ventana correctamente', async () => {
      await recordAttempt(mockClient);
      const debugInfo = await getRateLimitDebugInfo(mockClient);

      const expectedWindowDuration = RATE_LIMIT_CONFIG.WINDOW_SECONDS * 1000;
      const actualWindowDuration = debugInfo.windowEnd - debugInfo.windowStart;

      expect(actualWindowDuration).toBe(expectedWindowDuration);
    });
  });

  describe('multiples clientes', () => {
    it('deberia manejar informacion de depuración de limites por cliente', async () => {
      const client1: ClientIdentifier = { id: 'client1', type: 'session' };
      const client2: ClientIdentifier = { id: 'client2', type: 'session' };

      await recordAttempt(client1);

      const result1 = await checkRateLimit(client1);
      expect(result1.allowed).toBe(false);

      const result2 = await checkRateLimit(client2);
      expect(result2.allowed).toBe(true);

      await recordAttempt(client2);
      await recordAttempt(client2);
    });

    it('debería mantener información independiente al momento de revisar la info', async () => {
      const client1: ClientIdentifier = { id: 'client-1', type: 'session' };
      const client2: ClientIdentifier = { id: 'client-2', type: 'session' };

      await recordAttempt(client1);

      const debug1 = await getRateLimitDebugInfo(client1);
      const debug2 = await getRateLimitDebugInfo(client2);

      expect(debug1.requestCount).toBe(1);
      expect(debug2.requestCount).toBe(0);
      expect(debug1.isAllowed).toBe(false);
      expect(debug2.isAllowed).toBe(true);

      await resetRateLimit(client1);
      await resetRateLimit(client2);
    });
  });
});

describe('edge cases', () => {
  it('debería manejar IDS de usuarios vacios', async () => {
    const emptyClient: ClientIdentifier = { id: '', type: 'session' };

    const result = await checkRateLimit(emptyClient);
    expect(result.allowed).toBe(true);

    await resetRateLimit(emptyClient);
  });

  it('debería manejar diferentes tipos de indentificadores', async () => {
    const ipClient: ClientIdentifier = { id: '192.168.1.1', type: 'ip' };
    const sessionClient: ClientIdentifier = { id: 'session-123', type: 'session' };
    const userClient: ClientIdentifier = { id: 'user-456', type: 'user' };

    await recordAttempt(ipClient);
    await recordAttempt(sessionClient);
    await recordAttempt(userClient);

    const result1 = await checkRateLimit(ipClient);
    const result2 = await checkRateLimit(sessionClient);
    const result3 = await checkRateLimit(userClient);

    expect(result1.allowed).toBe(false);
    expect(result2.allowed).toBe(false);
    expect(result3.allowed).toBe(false);

    await resetRateLimit(ipClient);
    await resetRateLimit(sessionClient);
    await resetRateLimit(userClient);
  });
});
