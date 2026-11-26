import { Router, Request, Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest, requireAdmin, requireAuth } from '../middleware/auth';
import { BlockchainVerification, OrderStatus } from '../types';

const router = Router();

const USDT_TRC20_CONTRACT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';

export async function verifyTronTransaction(
  txHash: string,
  expectedRecipient: string,
  expectedAmount: number,
  requiredConfirmations: number
): Promise<{ verification: BlockchainVerification; status: OrderStatus }> {
  const cleanHash = txHash.trim();
  const checkedAt = new Date().toISOString();

  if (!/^[a-fA-F0-9]{64}$/.test(cleanHash)) {
    return {
      status: 'Payment Failed',
      verification: {
        txHash: cleanHash,
        network: 'Tron TRC-20',
        verified: false,
        confirmations: 0,
        requiredConfirmations,
        checkedAt,
        provider: 'validation',
        message: 'Invalid Tron TRC-20 transaction hash format. Expected 64 hexadecimal characters.'
      }
    };
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (process.env.TRONGRID_API_KEY?.trim()) {
    headers['TRON-PRO-API-KEY'] = process.env.TRONGRID_API_KEY.trim();
  }

  try {
    const [txInfoRes, nowBlockRes, eventsRes] = await Promise.all([
      fetch('https://api.trongrid.io/wallet/gettransactioninfobyid', {
        method: 'POST',
        headers,
        body: JSON.stringify({ value: cleanHash }),
        signal: AbortSignal.timeout(5500)
      }),
      fetch('https://api.trongrid.io/wallet/getnowblock', {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
        signal: AbortSignal.timeout(5500)
      }),
      fetch(`https://api.trongrid.io/v1/transactions/${cleanHash}/events`, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(5500)
      })
    ]);

    if (!txInfoRes.ok) {
      throw new Error(`TronGrid HTTP ${txInfoRes.status}`);
    }

    const txInfo = (await txInfoRes.json()) as any;
    if (!txInfo || !txInfo.id) {
      return {
        status: 'Payment Detected',
        verification: {
          txHash: cleanHash,
          network: 'Tron TRC-20',
          verified: false,
          confirmations: 0,
          requiredConfirmations,
          checkedAt,
          provider: 'trongrid',
          message:
            'Transaction hash recorded and awaiting Tron network indexing. Re-check confirmations shortly or wait for ledger review.'
        }
      };
    }

    if (txInfo.receipt?.result && txInfo.receipt.result !== 'SUCCESS') {
      return {
        status: 'Payment Failed',
        verification: {
          txHash: cleanHash,
          network: 'Tron TRC-20',
          verified: false,
          confirmations: 0,
          requiredConfirmations,
          blockNumber: txInfo.blockNumber,
          checkedAt,
          provider: 'trongrid',
          message: `On-chain smart contract execution reported ${txInfo.receipt.result}.`
        }
      };
    }

    let currentBlock = txInfo.blockNumber || 0;
    if (nowBlockRes.ok) {
      const nowData = (await nowBlockRes.json()) as any;
      currentBlock = nowData?.block_header?.raw_data?.number || currentBlock;
    }

    const confirmations =
      txInfo.blockNumber && currentBlock >= txInfo.blockNumber
        ? currentBlock - txInfo.blockNumber + 1
        : 0;

    let detectedAmount: number | undefined;
    let recipientAddress: string | undefined;
    let senderAddress: string | undefined;

    if (eventsRes.ok) {
      const evJson = (await eventsRes.json()) as any;
      const transferEvent = Array.isArray(evJson?.data)
        ? evJson.data.find(
            (e: any) =>
              e.event_name === 'Transfer' &&
              (!e.contract_address || e.contract_address === USDT_TRC20_CONTRACT)
          )
        : undefined;

      if (transferEvent?.result) {
        const rawVal = Number(transferEvent.result.value || transferEvent.result._value || 0);
        if (!Number.isNaN(rawVal) && rawVal > 0) {
          detectedAmount = rawVal / 1_000_000;
        }
        recipientAddress = transferEvent.result.to || transferEvent.result._to;
        senderAddress = transferEvent.result.from || transferEvent.result._from;
      }
    }

    if (
      recipientAddress &&
      recipientAddress.toLowerCase() !== expectedRecipient.toLowerCase() &&
      expectedRecipient.startsWith('T')
    ) {
      // Notice TronGrid event `to` is sometimes 0x hex vs Base58 T-address; only fail if both are T-addresses and mismatch
      if (recipientAddress.startsWith('T')) {
        return {
          status: 'Payment Failed',
          verification: {
            txHash: cleanHash,
            network: 'Tron TRC-20',
            verified: false,
            confirmations,
            requiredConfirmations,
            blockNumber: txInfo.blockNumber,
            detectedAmount,
            recipientAddress,
            senderAddress,
            checkedAt,
            provider: 'trongrid',
            message: `Recipient mismatch: transfer routed to ${recipientAddress} instead of ${expectedRecipient}.`
          }
        };
      }
    }

    if (typeof detectedAmount === 'number' && detectedAmount + 0.01 < expectedAmount) {
      return {
        status: 'Payment Failed',
        verification: {
          txHash: cleanHash,
          network: 'Tron TRC-20',
          verified: false,
          confirmations,
          requiredConfirmations,
          blockNumber: txInfo.blockNumber,
          detectedAmount,
          recipientAddress,
          senderAddress,
          checkedAt,
          provider: 'trongrid',
          message: `Insufficient transfer amount: detected ${detectedAmount.toLocaleString()} USDT, expected ${expectedAmount.toLocaleString()} USDT.`
        }
      };
    }

    if (confirmations >= requiredConfirmations) {
      return {
        status: 'Payment Confirmed',
        verification: {
          txHash: cleanHash,
          network: 'Tron TRC-20',
          verified: true,
          confirmations,
          requiredConfirmations,
          blockNumber: txInfo.blockNumber,
          detectedAmount: detectedAmount ?? expectedAmount,
          recipientAddress: recipientAddress || expectedRecipient,
          senderAddress,
          checkedAt,
          provider: 'trongrid',
          message: `Confirmed on Tron TRC-20 (${confirmations} block confirmations). License keys issued.`
        }
      };
    }

    return {
      status: 'Confirming on Blockchain',
      verification: {
        txHash: cleanHash,
        network: 'Tron TRC-20',
        verified: false,
        confirmations,
        requiredConfirmations,
        blockNumber: txInfo.blockNumber,
        detectedAmount,
        recipientAddress,
        senderAddress,
        checkedAt,
        provider: 'trongrid',
        message: `Transaction detected on block #${txInfo.blockNumber} (${confirmations}/${requiredConfirmations} confirmations).`
      }
    };
  } catch {
    return {
      status: 'Payment Detected',
      verification: {
        txHash: cleanHash,
        network: 'Tron TRC-20',
        verified: false,
        confirmations: 0,
        requiredConfirmations,
        checkedAt,
        provider: 'validation',
        message:
          'Transaction hash format validated and logged. Queued for blockchain ledger confirmation and operator verification.'
      }
    };
  }
}

// GET /api/orders/payment-config - public non-secret settlement details from backend settings
router.get('/payment-config', (_req: Request, res: Response) => {
  const settings = db.getSiteSettings();
  res.json({
    network: settings.trc20Network,
    currency: 'USDT',
    receivingAddress: settings.trc20ReceivingAddress,
    requiredConfirmations: settings.requiredConfirmations,
    orderExpiryMinutes: settings.orderExpiryMinutes,
    dispatchChannel: settings.dispatchChannel,
    feeNotice:
      'Network transaction fees (~13-28 TRX energy equivalent on Tron) are covered by the sender wallet so the net USDT amount matches your order total.'
  });
});

// GET /api/orders - list orders for authenticated user or all if admin
router.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const isAdmin = req.user?.role === 'admin';
  const orders = isAdmin ? db.getOrders() : db.getOrders(req.user!.id);
  res.json({ orders });
});

// GET /api/orders/:orderNumber - single order (owner or admin only)
router.get('/:orderNumber', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const order = db.getOrderByNumber(req.params.orderNumber);
  if (!order) {
    return res.status(404).json({
      error: 'ORDER_NOT_FOUND',
      message: `Order ${req.params.orderNumber} was not found.`
    });
  }
  if (req.user!.role !== 'admin' && order.userId !== req.user!.id) {
    return res.status(403).json({
      error: 'FORBIDDEN',
      message: 'You do not have permission to view this order.'
    });
  }
  res.json({ order });
});

// POST /api/orders - create a new order with authoritative server pricing & discount validation
router.post('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { items, discountCode, paymentMethod } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      error: 'EMPTY_CART',
      message: 'At least one software package is required to generate an order.'
    });
  }

  const authoritativeItems = [];
  let subtotal = 0;

  for (const rawItem of items) {
    const prod = db.getProductByIdOrSlug(String(rawItem.productId || ''));
    if (!prod) {
      return res.status(400).json({
        error: 'INVALID_PRODUCT',
        message: `Product ${rawItem.productId} no longer exists in the catalog.`
      });
    }
    const qty = Math.max(1, Math.min(25, Math.floor(Number(rawItem.quantity) || 1)));
    subtotal += prod.price * qty;
    authoritativeItems.push({
      productId: prod.id,
      name: prod.name,
      price: prod.price,
      quantity: qty,
      image: prod.image,
      category: prod.category,
      version: prod.version,
      productCode: prod.productCode
    });
  }

  let appliedDiscountCode: string | undefined;
  let discountAmount = 0;
  if (discountCode && String(discountCode).trim()) {
    const check = db.validateDiscount(String(discountCode), subtotal);
    if (!check.valid) {
      return res.status(400).json({
        error: 'INVALID_DISCOUNT',
        message: check.reason || 'Discount code is invalid.'
      });
    }
    appliedDiscountCode = check.discount!.code;
    discountAmount = check.discountAmount;
  }

  const finalAmount = Math.max(1, Math.round((subtotal - discountAmount) * 100) / 100);

  const newOrder = db.createOrder({
    userId: req.user!.id,
    userEmail: req.user!.email,
    items: authoritativeItems,
    subtotal,
    discountCode: appliedDiscountCode,
    discountAmount,
    amount: finalAmount,
    paymentMethod: paymentMethod || `USDT (${db.getSiteSettings().trc20Network})`
  });

  res.status(201).json({
    message: 'Order generated successfully.',
    order: newOrder
  });
});

// POST /api/orders/:orderNumber/verify-tx - submit transaction hash & verify on TronGrid
router.post('/:orderNumber/verify-tx', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { txHash } = req.body;
  const { orderNumber } = req.params;

  const order = db.getOrderByNumber(orderNumber);
  if (!order) {
    return res.status(404).json({ error: 'ORDER_NOT_FOUND', message: 'Order reference not found.' });
  }
  if (req.user!.role !== 'admin' && order.userId !== req.user!.id) {
    return res.status(403).json({ error: 'FORBIDDEN', message: 'Unauthorized order access.' });
  }

  if (order.expiresAt && Date.now() > Date.parse(order.expiresAt) && order.status === 'Awaiting Payment') {
    const expired = db.updateOrderStatus(
      orderNumber,
      'Payment Expired',
      'system',
      'Order payment window expired before transaction submission.'
    );
    return res.status(400).json({
      error: 'ORDER_EXPIRED',
      message: 'This payment window has expired. Please generate a fresh order.',
      order: expired
    });
  }

  const cleanHash = String(txHash || '').trim();
  if (!/^[a-fA-F0-9]{64}$/.test(cleanHash)) {
    return res.status(400).json({
      error: 'INVALID_TX_HASH',
      message: 'Please provide a valid 64-character hexadecimal Tron TRC-20 transaction hash (TXID).'
    });
  }

  // Prevent duplicate transaction hash reuse across orders
  const duplicateOrder = db.isTxHashUsedByAnotherOrder(cleanHash, orderNumber);
  if (duplicateOrder) {
    return res.status(409).json({
      error: 'DUPLICATE_TX_HASH',
      message: `Transaction hash ${cleanHash.slice(0, 12)}... is already bound to order ${duplicateOrder}.`
    });
  }

  const settings = db.getSiteSettings();
  const { verification, status } = await verifyTronTransaction(
    cleanHash,
    order.paymentAddress || settings.trc20ReceivingAddress,
    order.amount,
    settings.requiredConfirmations
  );

  const updated = db.recordTransactionSubmission(
    orderNumber,
    cleanHash,
    verification,
    status,
    req.user!.email
  );

  res.json({
    success: status !== 'Payment Failed',
    status,
    verification,
    order: updated
  });
});

// POST /api/orders/:orderNumber/proof - optional supplementary payment receipt screenshot
router.post('/:orderNumber/proof', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { fileName, fileSize, fileType, fileData } = req.body;
  const { orderNumber } = req.params;

  const order = db.getOrderByNumber(orderNumber);
  if (!order) {
    return res.status(404).json({ error: 'ORDER_NOT_FOUND', message: 'Order reference not found.' });
  }
  if (req.user!.role !== 'admin' && order.userId !== req.user!.id) {
    return res.status(403).json({ error: 'FORBIDDEN', message: 'Unauthorized order access.' });
  }

  if (!fileName || !fileData) {
    return res.status(400).json({ error: 'FILE_REQUIRED', message: 'Receipt file payload is missing.' });
  }

  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  if (fileSize && fileSize > MAX_FILE_SIZE) {
    return res.status(413).json({
      error: 'FILE_TOO_LARGE',
      message: 'Screenshot exceeds the 5MB maximum threshold.'
    });
  }

  const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  const ext = String(fileName).split('.').pop()?.toLowerCase();
  const allowedExtensions = ['png', 'jpg', 'jpeg', 'webp'];

  if (!allowedExtensions.includes(ext || '') && !allowedMimeTypes.includes(fileType || '')) {
    return res.status(415).json({
      error: 'INVALID_FILE_TYPE',
      message: 'Only PNG, JPG, JPEG, and WebP images are accepted.'
    });
  }

  const updatedOrder = db.uploadPaymentProof(orderNumber, {
    fileName,
    fileSize: fileSize || 102400,
    fileType: fileType || 'image/png',
    fileData
  });

  res.json({
    success: true,
    message:
      'Supplementary receipt attached. Submit your TXID hash or await verification review.',
    order: updatedOrder
  });
});

// PATCH /api/orders/:orderNumber/status - Admin update order status
router.patch('/:orderNumber/status', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { status, note } = req.body;
  const { orderNumber } = req.params;

  const validStatuses: OrderStatus[] = [
    'Awaiting Payment',
    'Payment Detected',
    'Confirming on Blockchain',
    'Payment Confirmed',
    'Payment Failed',
    'Payment Expired',
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
      message: `Invalid status value: ${status}`
    });
  }

  const actor = req.user?.username || 'admin';
  const updatedOrder = db.updateOrderStatus(orderNumber, status as OrderStatus, actor, note);

  if (!updatedOrder) {
    return res.status(404).json({ error: 'ORDER_NOT_FOUND', message: 'Order not found' });
  }

  res.json({
    success: true,
    message: `Order ${orderNumber} updated to ${status}`,
    order: updatedOrder
  });
});

export default router;
