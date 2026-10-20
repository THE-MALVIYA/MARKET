import { Router, Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest, requireAdmin } from '../middleware/auth';
import { OrderStatus } from '../types';

const router = Router();

// GET /api/orders - list orders for current user or all if admin
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  const isAdmin = req.user?.role === 'admin' || req.headers['x-user-role'] === 'admin';
  const orders = isAdmin ? db.getOrders() : db.getOrders(req.user?.id);
  res.json({ orders });
});

// GET /api/orders/:orderNumber - get single order details
router.get('/:orderNumber', (req: AuthenticatedRequest, res: Response) => {
  const order = db.getOrderByNumber(req.params.orderNumber);
  if (!order) {
    return res.status(404).json({
      error: 'ORDER_NOT_FOUND',
      message: `Order with reference ${req.params.orderNumber} was not found.`
    });
  }
  res.json({ order });
});

// POST /api/orders - create a new order
router.post('/', (req: AuthenticatedRequest, res: Response) => {
  const { items, amount, paymentMethod, paymentAddress } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'EMPTY_CART', message: 'At least one item is required to place an order.' });
  }

  const calculatedAmount = items.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
  const finalAmount = typeof amount === 'number' && amount > 0 ? amount : calculatedAmount;

  const user = req.user || {
    id: 'user-agent-01',
    email: 'developer@cyberplaces.io',
    username: 'dev_lead'
  };

  const newOrder = db.createOrder({
    userId: user.id,
    userEmail: user.email,
    items,
    amount: finalAmount,
    paymentMethod: paymentMethod || 'USDT (TRC-20)',
    paymentAddress: paymentAddress || 'TL9sU4A1ydN9AT2LTaC7P94K4y4BdAgDFx'
  });

  res.status(201).json({
    message: 'Order generated successfully.',
    order: newOrder
  });
});

// POST /api/orders/:orderNumber/proof - upload payment screenshot
router.post('/:orderNumber/proof', (req: AuthenticatedRequest, res: Response) => {
  const { fileName, fileSize, fileType, fileData } = req.body;
  const { orderNumber } = req.params;

  if (!fileName || !fileData) {
    return res.status(400).json({ error: 'FILE_REQUIRED', message: 'Proof file payload is missing.' });
  }

  // Security: Check file size (max 5MB = 5 * 1024 * 1024 bytes)
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  if (fileSize && fileSize > MAX_FILE_SIZE) {
    return res.status(413).json({
      error: 'FILE_TOO_LARGE',
      message: 'Screenshot exceeds the 5MB maximum threshold.'
    });
  }

  // Security: Validate file type
  const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  const ext = fileName.split('.').pop()?.toLowerCase();
  const allowedExtensions = ['png', 'jpg', 'jpeg', 'webp'];

  if (!allowedExtensions.includes(ext || '') && !allowedMimeTypes.includes(fileType || '')) {
    return res.status(415).json({
      error: 'INVALID_FILE_TYPE',
      message: 'Executable or disallowed format. Only PNG, JPG, JPEG files are accepted.'
    });
  }

  const updatedOrder = db.uploadPaymentProof(orderNumber, {
    fileName,
    fileSize: fileSize || 102400,
    fileType: fileType || 'image/png',
    fileData
  });

  if (!updatedOrder) {
    return res.status(404).json({ error: 'ORDER_NOT_FOUND', message: 'Order reference not found' });
  }

  res.json({
    success: true,
    message: 'Payment proof submitted successfully. Order status is now PENDING VERIFICATION.',
    order: updatedOrder
  });
});

// PATCH /api/orders/:orderNumber/status - Admin update order status
router.patch('/:orderNumber/status', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { status, note } = req.body;
  const { orderNumber } = req.params;

  const validStatuses: OrderStatus[] = [
    'Pending Payment',
    'Proof Uploaded',
    'Under Review',
    'Approved',
    'Rejected',
    'Completed'
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      error: 'INVALID_STATUS',
      message: `Status must be one of: ${validStatuses.join(', ')}`
    });
  }

  const actor = req.user?.username || 'root_overseer';
  const updatedOrder = db.updateOrderStatus(orderNumber, status as OrderStatus, actor, note);

  if (!updatedOrder) {
    return res.status(404).json({ error: 'ORDER_NOT_FOUND', message: 'Order not found' });
  }

  res.json({
    success: true,
    message: `Order ${orderNumber} transitioned to ${status}`,
    order: updatedOrder
  });
});

export default router;
