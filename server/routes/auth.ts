import { Router, Request, Response } from 'express';
import { db, hashPassword, verifyPassword } from '../db';
import { AuthenticatedRequest, requireAuth, signAuthToken } from '../middleware/auth';

const router = Router();

function serializeUser(user: {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  organization?: string;
  avatar?: string;
  reputation: number;
  createdAt: string;
}) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    organization: user.organization,
    avatar: user.avatar,
    reputation: user.reputation,
    createdAt: user.createdAt
  };
}

// GET /api/auth/me - Current authenticated user session
router.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: serializeUser(req.user!) });
});

// POST /api/auth/login
router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: 'CREDENTIALS_REQUIRED',
      message: 'Email and password are required.'
    });
  }

  const user = db.getUserByEmail(String(email).trim());
  if (!user || !verifyPassword(String(password), user.passwordHash)) {
    return res.status(401).json({
      error: 'INVALID_CREDENTIALS',
      message: 'Invalid email or password.'
    });
  }

  // Upgrade legacy SHA-256 hash seamlessly on successful sign-in
  if (!user.passwordHash.startsWith('scrypt:')) {
    db.upgradeUserPasswordHash(user.id, String(password));
  }

  const token = signAuthToken(user);
  db.logActivity('USER_LOGIN', 'AUTH', `User ${user.username} signed in`, user.email, user.id);

  res.json({
    token,
    user: serializeUser(user)
  });
});

// POST /api/auth/register
router.post('/register', (req: Request, res: Response) => {
  const { username, email, password, organization } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      error: 'FIELDS_REQUIRED',
      message: 'Name, email, and password are required.'
    });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const cleanName = String(username).trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return res.status(400).json({
      error: 'INVALID_EMAIL',
      message: 'Please provide a valid email address.'
    });
  }

  if (String(password).length < 8) {
    return res.status(400).json({
      error: 'WEAK_PASSWORD',
      message: 'Password must be at least 8 characters.'
    });
  }

  if (db.getUserByEmail(cleanEmail)) {
    return res.status(409).json({
      error: 'USER_EXISTS',
      message: 'An account with this email already exists.'
    });
  }

  const hashed = hashPassword(String(password));
  const newUser = db.createUser(
    cleanName,
    cleanEmail,
    hashed,
    'user',
    organization ? String(organization).trim() : undefined
  );
  const token = signAuthToken(newUser);

  res.status(201).json({
    token,
    user: serializeUser(newUser)
  });
});

// GET /api/auth/admin-status - reports whether first-run admin setup is needed
router.get('/admin-status', (_req: Request, res: Response) => {
  const status = db.getAdminPasscodeStatus();
  res.json(status);
});

// POST /api/auth/claim-admin - one-time admin passphrase claim if unconfigured
router.post('/claim-admin', (req: Request, res: Response) => {
  const { passcode } = req.body;
  const status = db.getAdminPasscodeStatus();
  if (!status.setupRequired) {
    return res.status(409).json({
      error: 'ADMIN_ALREADY_CONFIGURED',
      message: 'Administrator access is already configured. Sign in with your admin credentials.'
    });
  }
  if (!passcode || String(passcode).trim().length < 8) {
    return res.status(400).json({
      error: 'WEAK_PASSCODE',
      message: 'Administrator passcode must be at least 8 characters.'
    });
  }

  const admin = db.claimAdminPasscode(String(passcode).trim());
  if (!admin) {
    return res.status(409).json({
      error: 'CLAIM_FAILED',
      message: 'Unable to claim administrator access.'
    });
  }

  const token = signAuthToken(admin);
  res.status(201).json({
    token,
    user: serializeUser(admin)
  });
});

// POST /api/auth/admin-login - verify server-side admin passcode
router.post('/admin-login', (req: Request, res: Response) => {
  const { passcode } = req.body;
  if (!passcode) {
    return res.status(400).json({
      error: 'PASSCODE_REQUIRED',
      message: 'Administrator passcode is required.'
    });
  }

  const admin = db.verifyAdminPasscode(String(passcode).trim());
  if (!admin) {
    return res.status(401).json({
      error: 'INVALID_ADMIN_PASSCODE',
      message: 'Administrator verification failed.'
    });
  }

  const token = signAuthToken(admin);
  db.logActivity('ADMIN_LOGIN', 'AUTH', 'Administrator console session unlocked', admin.email, admin.id);

  res.json({
    token,
    user: serializeUser(admin)
  });
});

export default router;
