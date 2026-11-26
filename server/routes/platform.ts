import { Router, Request, Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/platform/settings - Public non-sensitive site metadata
router.get('/settings', (_req: Request, res: Response) => {
  const settings = db.getSiteSettings();
  res.json({
    brandName: settings.brandName,
    tagline: settings.tagline,
    supportEmail: settings.supportEmail,
    announcementText: settings.announcementText,
    announcementActive: settings.announcementActive,
    trc20Network: settings.trc20Network,
    requiredConfirmations: settings.requiredConfirmations,
    dispatchChannel: settings.dispatchChannel
  });
});

// POST /api/platform/discounts/validate
router.post('/discounts/validate', (req: Request, res: Response) => {
  const { code, subtotal } = req.body;
  const numSubtotal = Number(subtotal) || 0;
  const check = db.validateDiscount(String(code || ''), numSubtotal);
  if (!check.valid) {
    return res.status(400).json({
      valid: false,
      message: check.reason || 'Invalid promo code.'
    });
  }
  res.json({
    valid: true,
    code: check.discount!.code,
    type: check.discount!.type,
    value: check.discount!.value,
    discountAmount: check.discountAmount,
    description: check.discount!.description
  });
});

// GET /api/platform/licenses - Current user's issued license keys
router.get('/licenses', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const licenses = db.getLicenses(req.user!.id);
  res.json({ licenses });
});

// GET /api/platform/licenses/:id/bundle - Generate real downloadable JSON license manifest for confirmed license
router.get('/licenses/:id/bundle', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const license = db.getLicenses().find((l) => l.id === req.params.id);
  if (!license) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'License record not found.' });
  }
  if (req.user!.role !== 'admin' && license.userId !== req.user!.id) {
    return res.status(403).json({ error: 'FORBIDDEN', message: 'Unauthorized license download.' });
  }
  if (license.status !== 'Active') {
    return res.status(403).json({ error: 'LICENSE_REVOKED', message: 'License is currently revoked.' });
  }

  const product = db.getProductByIdOrSlug(license.productId);
  const manifest = {
    vendor: 'DEEPSEEK Deephat & Developer Infrastructure Marketplace',
    licenseKey: license.licenseKey,
    orderReference: license.orderNumber,
    issuedTo: license.userEmail,
    issuedAt: license.issuedAt,
    expiresAt: license.expiresAt,
    sha256ManifestSignature: license.downloadManifestHash,
    package: {
      id: license.productId,
      code: product?.productCode || license.productId,
      name: license.productName,
      version: license.productVersion,
      architecture: product?.architecture || 'x86_64 / ARM64',
      requirements: product?.requirements || [],
      installCommand: `deepseek-cli verify --license ${license.licenseKey} --sha256 ${license.downloadManifestHash}`
    }
  };

  res.setHeader(
    'Content-Disposition',
    `attachment; filename="DEEPSEEK-${(product?.slug || license.productId)}-${license.orderNumber}.json"`
  );
  res.json(manifest);
});

// GET & POST /api/platform/tickets
router.get('/tickets', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const tickets = db.getTickets(req.user!.id);
  res.json({ tickets });
});

router.post('/tickets', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { category, subject, message } = req.body;
  if (!subject || !message) {
    return res.status(400).json({
      error: 'FIELDS_REQUIRED',
      message: 'Subject and message are required.'
    });
  }
  const ticket = db.createTicket({
    userId: req.user!.id,
    userEmail: req.user!.email,
    category: String(category || 'General Inquiry'),
    subject: String(subject).trim(),
    message: String(message).trim()
  });
  res.status(201).json({ ticket });
});

export default router;
