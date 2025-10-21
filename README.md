# 🌽 Buy Corn - Rate Limited Purchase System

A production-ready Next.js application demonstrating distributed rate limiting with Redis. Buy corn once every 60 seconds with a real-time countdown timer.

**Live Demo:** [buycorn.vercel.app](https://buycorn.vercel.app)

---

## Features

- **Rate Limiting (1 purchase/60s):** Each IP address can only purchase once per minute
- **Real-time Countdown:** Visual timer shows exactly when you can buy again
- **Distributed Architecture:** Redis-backed rate limiting (not in-memory)
- **Mobile Responsive:** Works seamlessly on all devices
- **Production Ready:** Full test suite, CI/CD pipeline, deployed on Vercel

---

## How It Works

### User Experience

1. **Click "Buy Corn"** → Purchase succeeds (takes ~500ms)
2. **Get Success Message** → "¡Successful purchase!"
3. **Button Blocks Automatically** → "Wait 60s to buy again"
4. **Countdown Appears** → 59, 58, 57... (decrements every second)
5. **After 60 seconds** → Button re-enables, ready for next purchase

### Technical Stack

```
Frontend:
├── Next.js 15 (App Router)
├── React 19 (Hooks)
├── TypeScript (strict mode)
└── Tailwind CSS v4

Backend:
├── API Route: POST /api/buy
├── Rate Limiter: Redis/Upstash
└── Error Handling: 429 Too Many Requests

Testing:
├── Unit Tests (Vitest): 38 tests
├── Integration Tests: 7 tests
├── E2E Tests (Playwright): 15 tests
└── Code Coverage: 80%+ branches
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Bun runtime
- Upstash Redis account (free tier available)

### Installation

```bash
# Clone repository
git clone <repo>
cd buycorn

# Install dependencies
bun install

# Create .env.local
cp .env.example .env.local

# Add your Upstash credentials
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

### Development

```bash
# Start dev server with Turbopack
bun run dev

# Open http://localhost:3000
```

---

## API Endpoint

### POST `/api/buy`

**Request:**

```bash
curl -X POST http://localhost:3000/api/buy \
  -H "Content-Type: application/json"
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Corn purchased successfully!",
  "data": {
    "purchasedAt": "2025-01-21T10:30:00Z",
    "nextPurchaseAllowedAt": "2025-01-21T10:31:00Z"
  }
}
```

**Rate Limited Response (429):**

```json
{
  "success": false,
  "error": "Too many requests. Please wait before trying again.",
  "retryAfter": 45
}
```

**Response Headers:**

```
X-RateLimit-Limit: 1
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1642755060
Retry-After: 45
```

---

## Architecture

### Rate Limiting Strategy

- **Window:** 60 seconds (sliding)
- **Limit:** 1 purchase per window per IP
- **Client Identification:** X-Forwarded-For header
- **Storage:** Redis (distributed), fallback to memory (development)
- **Response Time:** <100ms average

### Project Structure

```
src/
├── app/api/buy/route.ts          # API endpoint
├── components/
│   └── buy-corn/BuyButton.tsx    # Main component
├── modules/buy-corn/
│   ├── hooks/useBuyCorn.ts       # State management
│   ├── services/buyService.ts    # API client
│   └── types/index.ts            # TypeScript types
├── lib/
│   ├── rate-limiter.ts           # Core rate limiting logic
│   ├── redis.ts                  # Redis client
│   └── utils.ts                  # Helpers
└── config/
    └── rate-limit.config.ts      # Configuration
```

---

## Testing

```bash
# Unit + Integration tests
bun run test

# With coverage report
bun run test:coverage

# E2E tests (Chromium, Firefox, Safari)
bun run test:e2e

# Run entire CI pipeline locally
bun run ci
```

**Test Results:**

```
✓ 38 unit tests
✓ 7 integration tests
✓ 15 E2E tests
✓ 80%+ code coverage
✓ 0 ESLint warnings/errors
```

---

## Quality Assurance

### Code Quality

- **TypeScript:** Strict mode enabled
- **Linting:** ESLint with zero-warnings policy
- **Formatting:** Prettier (100% formatted)
- **Pre-commit Hooks:** Husky + lint-staged

### Quality Checks

```bash
bun run lint          # ESLint
bun run lint:fix      # Auto-fix issues
bun run format        # Prettier
bun run type-check    # TypeScript validation
```

---

## Deployment

### Deploy on Vercel (Recommended)

1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
4. Deploy

Automatic CI/CD runs all tests before deploying.

### Production Considerations

- Redis latency: Upstash adds ~10-20ms per request
- Fallback mechanism: In-memory store if Redis unavailable
- Rate limit window: Sliding 60-second window
- IP detection: Works behind proxies (Vercel, Cloudflare, etc.)

---

## Learning Resources

### What This Project Demonstrates

1. **Distributed Rate Limiting:** Not just in-memory, but using Redis
2. **React Hooks Best Practices:** Custom hooks, state management
3. **TypeScript at Scale:** Strict types, interfaces, generics
4. **API Design:** RESTful endpoints, proper HTTP status codes
5. **Testing Strategy:** Unit → Integration → E2E
6. **CI/CD Pipeline:** Automated tests before deployment
7. **Production-Ready Code:** Error handling, fallbacks, monitoring

### Useful Links

- [Rate Limiting Patterns](https://redis.io/glossary/rate-limiting/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-server-side/routes/route-handlers)
- [Upstash Redis](https://upstash.com/)
- [Playwright Testing](https://playwright.dev/)

## License

MIT

## Author

Made with S
