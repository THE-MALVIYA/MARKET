import { Router, Request, Response } from 'express';
import { db, hashPassword } from '../db';
import { AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/auth/me - Current user session
router.get('/me', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: 'UNAUTHENTICATED' });
  }

  res.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      reputation: user.reputation,
      createdAt: user.createdAt
    }
  });
});

// POST /api/auth/login
router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'CREDENTIALS_REQUIRED', message: 'Email and passphrase are required.' });
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid credentials or user key.' });
  }

  const hashed = hashPassword(password);
  if (user.passwordHash !== hashed) {
    return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Passphrase verification failed.' });
  }

  const token = `${user.id}:${Buffer.from(user.email).toString('base64')}`;

  db.logActivity('USER_LOGIN', 'AUTH', `User ${user.username} logged into console`, user.username, user.id);

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      reputation: user.reputation,
      createdAt: user.createdAt
    }
  });
});

// POST /api/auth/register
router.post('/register', (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'FIELDS_REQUIRED', message: 'Alias, email, and passphrase required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'WEAK_PASSWORD', message: 'Passphrase must be at least 6 characters.' });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'USER_EXISTS', message: 'An identity with this email already exists.' });
  }

  const hashed = hashPassword(password);
  const newUser = db.createUser(username.trim(), email.trim(), hashed, 'user');
  const token = `${newUser.id}:${Buffer.from(newUser.email).toString('base64')}`;

  res.status(201).json({
    token,
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      avatar: newUser.avatar,
      reputation: newUser.reputation,
      createdAt: newUser.createdAt
    }
  });
});

// POST /api/auth/switch-role - For switching between User and Admin roles
router.post('/switch-role', (req: Request, res: Response) => {
  const { targetRole } = req.body; // 'admin' or 'user'
  const users = db.getUsers();
  const matchedUser = users.find((u) => u.role === (targetRole === 'admin' ? 'admin' : 'user')) || users[0];

  const token = `${matchedUser.id}:${Buffer.from(matchedUser.email).toString('base64')}`;

  db.logActivity('ROLE_SWITCH', 'AUTH', `Switched role to ${matchedUser.role} (${matchedUser.username})`, matchedUser.username);

  res.json({
    token,
    user: {
      id: matchedUser.id,
      username: matchedUser.username,
      email: matchedUser.email,
      role: matchedUser.role,
      avatar: matchedUser.avatar,
      reputation: matchedUser.reputation,
      createdAt: matchedUser.createdAt
    }
  });
});

export default router;
