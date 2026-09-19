import { Router, Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest, requireAdmin } from '../middleware/auth';
import { OrderStatus } from '../types';

const router = Router();

// Apply requireAdmin to all admin endpoints
router.use(requireAdmin);

// GET /api/admin/stats
router.get('/stats', (_req: AuthenticatedRequest, res: Response) => {
  const stats = db.getAdminStats();
  res.json({ stats });
});

// GET /api/admin/activity-logs
router.get('/activity-logs', (req: AuthenticatedRequest, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const logs = db.getActivityLogs(limit);
  res.json({ logs });
});

// GET /api/admin/payment-proofs
router.get('/payment-proofs', (_req: AuthenticatedRequest, res: Response) => {
  const orders = db.getOrders();
  const proofs = orders
    .filter((o) => !!o.paymentProof)
    .map((o) => ({
      orderNumber: o.orderNumber,
      orderId: o.id,
      amount: o.amount,
      currency: o.currency,
      userEmail: o.userEmail,
      status: o.status,
      createdAt: o.createdAt,
      items: o.items,
      paymentProof: o.paymentProof
    }));

  res.json({ proofs });
});

// POST /api/admin/orders/:orderNumber/review - quick approve or reject proof
router.post('/orders/:orderNumber/review', (req: AuthenticatedRequest, res: Response) => {
  const { decision, note } = req.body;
  const { orderNumber } = req.params;

  if (decision !== 'Approved' && decision !== 'Rejected' && decision !== 'Under Review') {
    return res.status(400).json({ error: 'INVALID_DECISION', message: 'Decision must be Approved, Rejected, or Under Review.' });
  }

  const actor = req.user?.username || 'root_overseer';
  const updatedOrder = db.updateOrderStatus(orderNumber, decision as OrderStatus, actor, note || `Proof ${decision} by administrator`);

  if (!updatedOrder) {
    return res.status(404).json({ error: 'ORDER_NOT_FOUND', message: 'Order reference not found' });
  }

  res.json({
    success: true,
    message: `Order ${orderNumber} proof review set to ${decision}`,
    order: updatedOrder
  });
});

// GET /api/admin/users - list simulated marketplace users
router.get('/users', (_req: AuthenticatedRequest, res: Response) => {
  const users = db.getUsers().map((u) => ({
    id: u.id,
    username: u.username,
    email: u.email,
    role: u.role,
    reputation: u.reputation,
    avatar: u.avatar,
    createdAt: u.createdAt
  }));
  res.json({ users });
});

export default router;
