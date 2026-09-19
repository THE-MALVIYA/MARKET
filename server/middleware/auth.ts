import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { User } from '../types';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const userHeaderId = (req.headers['x-user-id'] || req.query.userId) as string;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    // Simple demo token format: demo-token-<userId>
    const parts = token.split(':');
    const userId = parts[0] || token;
    const user = db.getUserById(userId);
    if (user) {
      req.user = user;
      return next();
    }
  }

  if (userHeaderId) {
    const user = db.getUserById(userHeaderId);
    if (user) {
      req.user = user;
      return next();
    }
  }

  // Fallback to default demo user if unauthenticated for smooth demo experience
  const defaultAgent = db.getUsers().find(u => u.role === 'user');
  if (defaultAgent) {
    req.user = defaultAgent;
  }
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    // Check if header or query specifies admin simulation
    const roleHeader = (req.headers['x-user-role'] || req.query.role) as string;
    if (roleHeader === 'admin') {
      const adminUser = db.getUsers().find(u => u.role === 'admin');
      if (adminUser) {
        req.user = adminUser;
        return next();
      }
    }
    return res.status(403).json({
      error: 'ADMIN_ACCESS_REQUIRED',
      message: 'This operation requires administrator privileges.'
    });
  }
  next();
}
