import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { db } from '../db';
import { User } from '../types';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

const TOKEN_SECRET =
  process.env.SESSION_SECRET?.trim() || crypto.randomBytes(32).toString('hex');

export function signAuthToken(user: User): string {
  const payloadObj = {
    uid: user.id,
    role: user.role,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7
  };
  const payload = Buffer.from(JSON.stringify(payloadObj)).toString('base64url');
  const sig = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(payload)
    .digest('base64url');
  return `${payload}.${sig}`;
}

export function verifyAuthToken(token: string): { uid: string; role: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [payload, sig] = parts;
    const expectedSig = crypto
      .createHmac('sha256', TOKEN_SECRET)
      .update(payload)
      .digest('base64url');

    const sigBuf = Buffer.from(sig, 'utf8');
    const expectedBuf = Buffer.from(expectedSig, 'utf8');
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }

    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!decoded.uid || typeof decoded.exp !== 'number' || Date.now() > decoded.exp) {
      return null;
    }
    return { uid: decoded.uid, role: decoded.role };
  } catch {
    return null;
  }
}

export function authMiddleware(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const verified = verifyAuthToken(token);
    if (verified) {
      const user = db.getUserById(verified.uid);
      if (user) {
        req.user = user;
      }
    }
  }
  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: 'AUTH_REQUIRED',
      message: 'Authentication is required for this resource.'
    });
  }
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(req.user ? 403 : 401).json({
      error: 'ADMIN_ACCESS_REQUIRED',
      message: 'This operation requires verified administrator authentication.'
    });
  }
  next();
}
