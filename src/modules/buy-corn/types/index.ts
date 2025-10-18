export interface RateLimitResults {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  limit: number;
}
export interface ClientIdentifier {
  id: string;
  type: 'ip' | 'session' | 'user';
}
export interface BuySuccessResponse {
  success: true;
  message: string;
  data: {
    purchasedAt: string;
    nextPurchaseAllowed: string;
  };
}
export interface BuyErrorResponse {
  success: false;
  error: string;
  retryAfter?: number;
}
export type BuyApiResponse = BuySuccessResponse | BuyErrorResponse;
export interface RateLimitDebugInfo {
  clientId: string;
  timestamp: number;
  windowStart: number;
  windowEnd: number;
  requestCount: number;
  isAllowed: number;
}
