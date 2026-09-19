import { Request, Response, NextFunction } from 'express';

// Simple in-memory sliding window rate limiter
interface RateLimitBucket {
  count: number;
  resetTime: number;
}

const buckets = new Map<string, RateLimitBucket>();

export function rateLimit(windowMs = 60000, maxRequests = 120) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'anonymous';
    const key = `${ip}`;
    const now = Date.now();

    let bucket = buckets.get(key as string);
    if (!bucket || now > bucket.resetTime) {
      bucket = {
        count: 1,
        resetTime: now + windowMs
      };
      buckets.set(key as string, bucket);
    } else {
      bucket.count += 1;
      if (bucket.count > maxRequests) {
        return res.status(429).json({
          error: 'RATE_LIMIT_EXCEEDED',
          message: 'Rate limit exceeded. Please wait before retrying.',
          retryAfterMs: bucket.resetTime - now
        });
      }
    }

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - bucket.count));
    next();
  };
}
