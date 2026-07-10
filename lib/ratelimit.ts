import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Rate limiting for the public /api/chat endpoint. Two independent windows,
// both keyed by client IP:
//   - minute:  5 requests / minute  → stops rapid-fire spamming
//   - daily:  50 requests / day     → protects the SHARED Groq free-tier quota
//                                      from one visitor draining it for everyone
//
// The Redis client is built only when both Upstash env vars are present. When
// they're missing (e.g. a local dev shell with no keys) we export nulls and the
// route falls open — but in production these MUST be set, which is why the route
// logs a warning if it ever runs unprotected.
const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

export const rateLimitConfigured = Boolean(url && token);

const redis = rateLimitConfigured ? new Redis({ url: url!, token: token! }) : null;

export const minuteLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      prefix: "kaolin:chat:min",
      analytics: false,
    })
  : null;

export const dailyLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(50, "1 d"),
      prefix: "kaolin:chat:day",
      analytics: false,
    })
  : null;
