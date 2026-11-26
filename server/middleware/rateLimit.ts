import { Request, Response, NextFunction } from 'express';

// Simple in-memory sliding window rate limiter
interface RateLimitBucket {
  count: number;
  resetTime: number;
}

export function rateLimit(windowMs = 60000, maxRequests = 120) {
  const buckets = new Map<string, RateLimitBucket>();

  return (req: Request, res: Response, next: NextFunction) => {
    const rawIp = req.ip || req.headers['x-forwarded-for'] || 'anonymous';
    const key = Array.isArray(rawIp) ? rawIp[0] : String(rawIp);
    const now = Date.now();

    if (buckets.size > 5000) {
      for (const [k, b] of buckets.entries()) {
        if (now > b.resetTime) buckets.delete(k);
      }
    }

    let bucket = buckets.get(key);
    if (!bucket || now > bucket.resetTime) {
      bucket = {
        count: 1,
        resetTime: now + windowMs
      };
      buckets.set(key, bucket);
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
