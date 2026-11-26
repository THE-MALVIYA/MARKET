import { Router, Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest, requireAdmin } from '../middleware/auth';
import { verifyTronTransaction } from './orders';
import { OrderStatus, SupportTicket } from '../types';

const router = Router();

// Strict admin authorization on every route in this router
router.use(requireAdmin);

// GET /api/admin/stats
router.get('/stats', (_req: AuthenticatedRequest, res: Response) => {
  res.json({ stats: db.getAdminStats() });
});

// GET /api/admin/activity-logs
router.get('/activity-logs', (req: AuthenticatedRequest, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 100;
  res.json({ logs: db.getActivityLogs(limit) });
});

// GET /api/admin/users
router.get('/users', (_req: AuthenticatedRequest, res: Response) => {
  const allOrders = db.getOrders();
  const allLicenses = db.getLicenses();
  const users = db.getUsers().map((u) => {
    const userOrders = allOrders.filter((o) => o.userId === u.id || o.userEmail === u.email);
    const confirmedSpent = userOrders
      .filter(
        (o) =>
          o.status === 'Payment Confirmed' || o.status === 'Approved' || o.status === 'Completed'
      )
      .reduce((sum, o) => sum + o.amount, 0);
    const userLicenses = allLicenses.filter((l) => l.userId === u.id || l.userEmail === u.email);

    return {
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role,
      organization: u.organization,
      reputation: u.reputation,
      avatar: u.avatar,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt,
      lastIp: u.lastIp,
      lastDevice: u.lastDevice,
      lastLocation: u.lastLocation,
      orderCount: userOrders.length,
      totalSpentUSDT: confirmedSpent,
      licenseCount: userLicenses.length,
      lastOrderAt: userOrders[0]?.createdAt || null
    };
  });
  res.json({ users });
});

// POST /api/admin/categories/rename
router.post('/categories/rename', (req: AuthenticatedRequest, res: Response) => {
  const { oldCategory, newCategory } = req.body;
  if (!oldCategory || !newCategory) {
    return res.status(400).json({ error: 'INVALID_INPUT', message: 'Both category names are required.' });
  }
  const updatedCount = db.renameCategory(
    String(oldCategory).trim(),
    String(newCategory).trim(),
    req.user!.username
  );
  res.json({ success: true, updatedCount });
});

// POST /api/admin/orders/:orderNumber/recheck-tx
router.post('/orders/:orderNumber/recheck-tx', async (req: AuthenticatedRequest, res: Response) => {
  const order = db.getOrderByNumber(req.params.orderNumber);
  if (!order) {
    return res.status(404).json({ error: 'ORDER_NOT_FOUND', message: 'Order not found.' });
  }
  if (!order.txHash) {
    return res.status(400).json({ error: 'NO_TX_HASH', message: 'No transaction hash attached to this order.' });
  }

  const settings = db.getSiteSettings();
  const { verification, status } = await verifyTronTransaction(
    order.txHash,
    order.paymentAddress || settings.trc20ReceivingAddress,
    order.amount,
    settings.requiredConfirmations
  );
  const updated = db.recordTransactionSubmission(
    order.orderNumber,
    order.txHash,
    verification,
    status,
    req.user!.username
  );
  res.json({ success: true, order: updated, verification });
});

// POST /api/admin/orders/:orderNumber/review
router.post('/orders/:orderNumber/review', (req: AuthenticatedRequest, res: Response) => {
  const { decision, note } = req.body;
  const { orderNumber } = req.params;

  const allowed: OrderStatus[] = [
    'Payment Confirmed',
    'Payment Failed',
    'Confirming on Blockchain',
    'Payment Expired',
    'Approved',
    'Rejected'
  ];

  if (!allowed.includes(decision)) {
    return res.status(400).json({ error: 'INVALID_DECISION', message: 'Invalid verification decision.' });
  }

  const updated = db.updateOrderStatus(
    orderNumber,
    decision as OrderStatus,
    req.user!.username,
    note || `Order verification marked ${decision} by administrator.`
  );

  if (!updated) {
    return res.status(404).json({ error: 'ORDER_NOT_FOUND', message: 'Order not found.' });
  }

  res.json({ success: true, order: updated });
});

// DELETE /api/admin/orders/:orderNumber
router.delete('/orders/:orderNumber', (req: AuthenticatedRequest, res: Response) => {
  const ok = db.deleteOrder(req.params.orderNumber, req.user!.username);
  if (!ok) {
    return res.status(404).json({ error: 'ORDER_NOT_FOUND', message: 'Order not found.' });
  }
  res.json({ success: true });
});

// GET /api/admin/licenses
router.get('/licenses', (_req: AuthenticatedRequest, res: Response) => {
  res.json({ licenses: db.getLicenses() });
});

// PATCH /api/admin/licenses/:id/toggle
router.patch('/licenses/:id/toggle', (req: AuthenticatedRequest, res: Response) => {
  const lic = db.toggleLicenseStatus(req.params.id, req.user!.username);
  if (!lic) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'License record not found.' });
  }
  res.json({ license: lic });
});

// GET /api/admin/discounts
router.get('/discounts', (_req: AuthenticatedRequest, res: Response) => {
  res.json({ discounts: db.getDiscounts() });
});

// POST /api/admin/discounts
router.post('/discounts', (req: AuthenticatedRequest, res: Response) => {
  const { code, type, value, maxUses, description } = req.body;
  if (!code || !value) {
    return res.status(400).json({ error: 'INVALID_INPUT', message: 'Code and value are required.' });
  }
  const discount = db.createDiscount(
    {
      code: String(code),
      type: type === 'fixed' ? 'fixed' : 'percent',
      value: Number(value),
      active: true,
      maxUses: Number(maxUses) || 100,
      description: String(description || '')
    },
    req.user!.username
  );
  res.status(201).json({ discount });
});

// PATCH /api/admin/discounts/:id/toggle
router.patch('/discounts/:id/toggle', (req: AuthenticatedRequest, res: Response) => {
  const discount = db.toggleDiscount(req.params.id, req.user!.username);
  if (!discount) return res.status(404).json({ error: 'NOT_FOUND' });
  res.json({ discount });
});

// DELETE /api/admin/discounts/:id
router.delete('/discounts/:id', (req: AuthenticatedRequest, res: Response) => {
  const ok = db.deleteDiscount(req.params.id, req.user!.username);
  if (!ok) return res.status(404).json({ error: 'NOT_FOUND' });
  res.json({ success: true });
});

// GET /api/admin/tickets
router.get('/tickets', (_req: AuthenticatedRequest, res: Response) => {
  res.json({ tickets: db.getTickets() });
});

// POST /api/admin/tickets/:id/reply
router.post('/tickets/:id/reply', (req: AuthenticatedRequest, res: Response) => {
  const { message, status } = req.body;
  if (!message || !String(message).trim()) {
    return res.status(400).json({ error: 'MESSAGE_REQUIRED', message: 'Reply message is required.' });
  }
  const ticket = db.replyToTicket(
    req.params.id,
    req.user!.username,
    'admin',
    String(message).trim(),
    status as SupportTicket['status'] | undefined
  );
  if (!ticket) return res.status(404).json({ error: 'NOT_FOUND' });
  res.json({ ticket });
});

// PATCH /api/admin/tickets/:id/status
router.patch('/tickets/:id/status', (req: AuthenticatedRequest, res: Response) => {
  const { status } = req.body;
  if (!['Open', 'In Progress', 'Resolved'].includes(status)) {
    return res.status(400).json({ error: 'INVALID_STATUS', message: 'Invalid ticket status.' });
  }
  const ticket = db.getTickets().find((t) => t.id === req.params.id || t.ticketNumber === req.params.id);
  if (!ticket) return res.status(404).json({ error: 'NOT_FOUND' });
  const updated = db.replyToTicket(
    ticket.id,
    req.user!.username,
    'admin',
    `Ticket status changed to ${status}.`,
    status as SupportTicket['status']
  );
  res.json({ ticket: updated });
});

// GET & PUT /api/admin/settings
router.get('/settings', (_req: AuthenticatedRequest, res: Response) => {
  res.json({ settings: db.getSiteSettings() });
});

router.put('/settings', (req: AuthenticatedRequest, res: Response) => {
  const {
    tagline,
    supportEmail,
    announcementText,
    announcementActive,
    trc20ReceivingAddress,
    trc20Network,
    requiredConfirmations,
    orderExpiryMinutes,
    dispatchChannel
  } = req.body;

  const updated = db.updateSiteSettings(
    {
      ...(tagline !== undefined ? { tagline: String(tagline) } : {}),
      ...(supportEmail !== undefined ? { supportEmail: String(supportEmail) } : {}),
      ...(announcementText !== undefined ? { announcementText: String(announcementText) } : {}),
      ...(typeof announcementActive === 'boolean' ? { announcementActive } : {}),
      ...(trc20ReceivingAddress !== undefined
        ? { trc20ReceivingAddress: String(trc20ReceivingAddress).trim() }
        : {}),
      ...(trc20Network !== undefined ? { trc20Network: String(trc20Network) } : {}),
      ...(typeof requiredConfirmations === 'number'
        ? { requiredConfirmations: Math.max(1, requiredConfirmations) }
        : {}),
      ...(typeof orderExpiryMinutes === 'number'
        ? { orderExpiryMinutes: Math.max(15, orderExpiryMinutes) }
        : {}),
      ...(dispatchChannel !== undefined ? { dispatchChannel: String(dispatchChannel) } : {})
    },
    req.user!.username
  );
  res.json({ settings: updated });
});

export default router;
