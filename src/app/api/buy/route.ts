import { NextRequest, NextResponse } from 'next/server';

import { RATE_LIMIT_CONFIG } from '@/config/rate-limit.config';
import { checkRateLimit, recordAttempt } from '@/lib/rate-limiter';
import type { BuyApiResponse, ClientIdentifier } from '@/modules/buy-corn/types';

function getClientIdentifier(request: NextRequest): ClientIdentifier {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';

  return {
    id: ip,
    type: 'ip',
  };
}

function calculateRetryAfter(resetAt: number): number {
  const now = Date.now();
  const diffMs = resetAt - now;
  return Math.ceil(diffMs / 1000);
}

export async function POST(request: NextRequest) {
  try {
    const client = getClientIdentifier(request);
    const rateLimitResult = await checkRateLimit(client);
    if (!rateLimitResult.allowed) {
      const retryAfter = calculateRetryAfter(rateLimitResult.resetAt);

      const BuyErrorResponse: BuyApiResponse = {
        success: false,
        error: RATE_LIMIT_CONFIG.MESSAGES.RATE_LIMIT_EXCEEDED,
        retryAfter,
      };

      return NextResponse.json(BuyErrorResponse, {
        status: 429,
        headers: {
          [RATE_LIMIT_CONFIG.HEADERS.LIMIT]: rateLimitResult.limit.toString(),
          [RATE_LIMIT_CONFIG.HEADERS.REMAINING]: rateLimitResult.remaining.toString(),
          [RATE_LIMIT_CONFIG.HEADERS.RESET]: Math.floor(rateLimitResult.resetAt / 1000).toString(),
          'Retry-After': retryAfter.toString(),
        },
      });
    }
    await recordAttempt(client);
    const now = new Date();
    const nextPurchaseDate = new Date(rateLimitResult.resetAt);

    const successResponse: BuyApiResponse = {
      success: true,
      message: RATE_LIMIT_CONFIG.MESSAGES.PURCHASE_SUCCESS,
      data: {
        purchasedAt: now.toISOString(),
        nextPurchaseAllowedAt: nextPurchaseDate.toISOString(),
      },
    };

    return NextResponse.json(successResponse, {
      status: 200,
      headers: {
        [RATE_LIMIT_CONFIG.HEADERS.LIMIT]: rateLimitResult.limit.toString(),
        [RATE_LIMIT_CONFIG.HEADERS.REMAINING]: '0',
        [RATE_LIMIT_CONFIG.HEADERS.RESET]: Math.floor(rateLimitResult.resetAt / 1000).toString(),
      },
    });
  } catch (error) {
    console.error('error in /api/buy', error);

    const errorResponse: BuyApiResponse = {
      success: false,
      error: 'Internal server error. Please try again later',
    };
    return NextResponse.json(errorResponse, {
      status: 500,
    });
  }
}

export async function GET() {
  return NextResponse.json(
    {
      error: 'Method not allowed. Use POST to purchase corn.',
    },
    {
      status: 405,
      headers: {
        Allow: 'POST',
      },
    }
  );
}
