import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  Product,
  Order,
  User,
  ActivityLog,
  OrderStatus,
  LicenseRecord,
  DiscountCode,
  SupportTicket,
  SiteSettings,
  BlockchainVerification
} from './types';

const DATA_DIR = path.join(process.cwd(), 'server', 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

export interface DatabaseStore {
  users: User[];
  products: Product[];
  orders: Order[];
  activityLogs: ActivityLog[];
  licenses: LicenseRecord[];
  discounts: DiscountCode[];
  tickets: SupportTicket[];
  usedTxHashes: Record<string, string>; // lowercase txHash -> orderNumber
  siteSettings: SiteSettings;
  adminPasscodeHash?: string | null;
}

const DEFAULT_MERCHANT_TRC20_ADDRESS =
  process.env.TRC20_WALLET_ADDRESS?.trim() || 'TL9sU4A1ydN9AT2LTaC7P94K4y4BdAgDFx';

const DEFAULT_SITE_SETTINGS: SiteSettings = {
  brandName: 'DEEPSEEK',
  tagline: 'Deephat & Developer Infrastructure Marketplace',
  supportEmail: 'support@deepseek-infra.io',
  announcementText:
    'Independent Deephat & Developer Infrastructure Marketplace · USDT (TRC-20) On-Chain Settlement',
  announcementActive: true,
  trc20ReceivingAddress: DEFAULT_MERCHANT_TRC20_ADDRESS,
  trc20Network: process.env.TRC20_NETWORK?.trim() || 'Tron TRC-20',
  requiredConfirmations: 19,
  orderExpiryMinutes: 60,
  dispatchChannel: '@getfilex_bot'
};

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${derived}`;
}

export function hashLegacySha256(password: string): string {
  return crypto
    .createHash('sha256')
    .update(password + 'cyberplaces_secret_salt_2026')
    .digest('hex');
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash) return false;
  if (storedHash.startsWith('scrypt:')) {
    const parts = storedHash.split(':');
    if (parts.length !== 3) return false;
    const [, salt, originalHex] = parts;
    const derived = crypto.scryptSync(password, salt, 64);
    const originalBuf = Buffer.from(originalHex, 'hex');
    if (derived.length !== originalBuf.length) return false;
    return crypto.timingSafeEqual(derived, originalBuf);
  }
  const legacyHex = hashLegacySha256(password);
  const a = Buffer.from(legacyHex, 'utf8');
  const b = Buffer.from(storedHash, 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

const INITIAL_DISCOUNTS: DiscountCode[] = [
  {
    id: 'disc-enterprise-10',
    code: 'DEEPSEEK10',
    type: 'percent',
    value: 10,
    active: true,
    maxUses: 100,
    usedCount: 0,
    description: '10% Enterprise Onboarding Credit',
    createdAt: new Date().toISOString()
  }
];

const INITIAL_USERS: User[] = [];

const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'log-01',
    action: 'SYSTEM_BOOT',
    category: 'ADMIN',
    details: 'DEEPSEEK marketplace engine initialized.',
    actor: 'system',
    timestamp: new Date().toISOString()
  }
];

class Database {
  private store: DatabaseStore;

  constructor() {
    this.store = {
      users: INITIAL_USERS,
      products: [],
      orders: [],
      activityLogs: INITIAL_LOGS,
      licenses: [],
      discounts: INITIAL_DISCOUNTS,
      tickets: [],
      usedTxHashes: {},
      siteSettings: { ...DEFAULT_SITE_SETTINGS },
      adminPasscodeHash: null
    };
    this.initStore();
  }

  private initStore() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(STORE_FILE)) {
        const raw = fs.readFileSync(STORE_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.products)) {
          this.store = {
            users: Array.isArray(parsed.users) ? parsed.users : INITIAL_USERS,
            products: parsed.products,
            orders: Array.isArray(parsed.orders) ? parsed.orders : [],
            activityLogs: Array.isArray(parsed.activityLogs) ? parsed.activityLogs : INITIAL_LOGS,
            licenses: Array.isArray(parsed.licenses) ? parsed.licenses : [],
            discounts: Array.isArray(parsed.discounts) ? parsed.discounts : INITIAL_DISCOUNTS,
            tickets: Array.isArray(parsed.tickets) ? parsed.tickets : [],
            usedTxHashes:
              parsed.usedTxHashes && typeof parsed.usedTxHashes === 'object'
                ? parsed.usedTxHashes
                : {},
            siteSettings: {
              ...DEFAULT_SITE_SETTINGS,
              ...(parsed.siteSettings || {}),
              brandName: 'DEEPSEEK',
              trc20ReceivingAddress:
                process.env.TRC20_WALLET_ADDRESS?.trim() ||
                parsed.siteSettings?.trc20ReceivingAddress ||
                DEFAULT_MERCHANT_TRC20_ADDRESS
            },
            adminPasscodeHash: parsed.adminPasscodeHash || null
          };
          this.saveStore();
          return;
        }
      }

      this.saveStore();
    } catch (err) {
      console.warn('[DB] Failed to read store.json, keeping safe in-memory state:', err);
    }
  }

  private saveStore() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(STORE_FILE, JSON.stringify(this.store, null, 2), 'utf-8');
    } catch (err) {
      console.warn('[DB] Failed to write store.json:', err);
    }
  }

  // Admin Bootstrap & Passcode Claim
  getAdminPasscodeStatus(): {
    envConfigured: boolean;
    claimed: boolean;
    setupRequired: boolean;
  } {
    const envConfigured = !!(process.env.ADMIN_PASSCODE && process.env.ADMIN_PASSCODE.trim().length > 0);
    const claimed = !!this.store.adminPasscodeHash;
    return {
      envConfigured,
      claimed,
      setupRequired: !envConfigured && !claimed
    };
  }

  claimAdminPasscode(passcode: string): User | null {
    const status = this.getAdminPasscodeStatus();
    if (!status.setupRequired) return null;
    this.store.adminPasscodeHash = hashPassword(passcode);
    let admin = this.store.users.find((u) => u.role === 'admin');
    if (!admin) {
      admin = {
        id: 'user-admin-01',
        username: 'deepseek_admin',
        email: 'admin@deepseek-infra.io',
        passwordHash: this.store.adminPasscodeHash,
        role: 'admin',
        organization: 'DEEPSEEK Operations',
        reputation: 100,
        createdAt: new Date().toISOString()
      };
      this.store.users.push(admin);
    } else {
      admin.passwordHash = this.store.adminPasscodeHash;
    }
    this.saveStore();
    this.logActivity('ADMIN_CLAIMED', 'AUTH', 'Administrator workspace passcode configured.', admin.username, admin.id);
    return admin;
  }

  verifyAdminPasscode(passcode: string): User | null {
    const envPass = process.env.ADMIN_PASSCODE?.trim();
    if (envPass) {
      const hashInput = crypto.createHash('sha256').update(passcode).digest();
      const hashTarget = crypto.createHash('sha256').update(envPass).digest();
      if (!crypto.timingSafeEqual(hashInput, hashTarget)) {
        return null;
      }
    } else if (this.store.adminPasscodeHash) {
      if (!verifyPassword(passcode, this.store.adminPasscodeHash)) {
        return null;
      }
    } else {
      return null;
    }

    let admin = this.store.users.find((u) => u.role === 'admin');
    if (!admin) {
      admin = {
        id: 'user-admin-01',
        username: 'deepseek_admin',
        email: 'admin@deepseek-infra.io',
        passwordHash: hashPassword(crypto.randomBytes(24).toString('hex')),
        role: 'admin',
        organization: 'DEEPSEEK Operations',
        reputation: 100,
        createdAt: new Date().toISOString()
      };
      this.store.users.push(admin);
      this.saveStore();
    }
    return admin;
  }

  // Site Settings
  getSiteSettings(): SiteSettings {
    return {
      ...this.store.siteSettings,
      trc20ReceivingAddress:
        process.env.TRC20_WALLET_ADDRESS?.trim() || this.store.siteSettings.trc20ReceivingAddress
    };
  }

  updateSiteSettings(updates: Partial<SiteSettings>, actor = 'admin'): SiteSettings {
    this.store.siteSettings = {
      ...this.store.siteSettings,
      ...updates,
      brandName: 'DEEPSEEK'
    };
    this.saveStore();
    this.logActivity('SETTINGS_UPDATED', 'ADMIN', 'Platform merchant and site settings updated.', actor);
    return this.getSiteSettings();
  }

  // Products
  getProducts(): Product[] {
    return this.store.products;
  }

  getProductByIdOrSlug(idOrSlug: string): Product | undefined {
    return this.store.products.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
  }

  addProduct(product: Omit<Product, 'id' | 'createdAt'>, actor = 'admin'): Product {
    const id = 'prod-' + crypto.randomBytes(4).toString('hex');
    const newProduct: Product = {
      ...product,
      id,
      slug: product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      createdAt: new Date().toISOString()
    };
    this.store.products.unshift(newProduct);
    this.saveStore();
    this.logActivity('PRODUCT_CREATED', 'PRODUCT', `Product ${newProduct.name} created`, actor, newProduct.id);
    return newProduct;
  }

  updateProduct(id: string, updates: Partial<Product>, actor = 'admin'): Product | null {
    const idx = this.store.products.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.store.products[idx] = { ...this.store.products[idx], ...updates, id };
    this.saveStore();
    this.logActivity(
      'PRODUCT_UPDATED',
      'PRODUCT',
      `Product ${this.store.products[idx].name} updated`,
      actor,
      id
    );
    return this.store.products[idx];
  }

  deleteProduct(id: string, actor = 'admin'): boolean {
    const idx = this.store.products.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    const removed = this.store.products.splice(idx, 1)[0];
    this.saveStore();
    this.logActivity('PRODUCT_DELETED', 'PRODUCT', `Product ${removed.name} removed`, actor, id);
    return true;
  }

  renameCategory(oldCategory: string, newCategory: string, actor = 'admin'): number {
    let count = 0;
    this.store.products = this.store.products.map((p) => {
      if (p.category === oldCategory) {
        count++;
        return { ...p, category: newCategory };
      }
      return p;
    });
    if (count > 0) {
      this.saveStore();
      this.logActivity(
        'CATEGORY_RENAMED',
        'PRODUCT',
        `Renamed category "${oldCategory}" to "${newCategory}" (${count} suites)`,
        actor
      );
    }
    return count;
  }

  // Discounts
  getDiscounts(): DiscountCode[] {
    return this.store.discounts;
  }

  validateDiscount(code: string, subtotal: number): {
    valid: boolean;
    discountAmount: number;
    discount?: DiscountCode;
    reason?: string;
  } {
    const normalized = code.trim().toUpperCase();
    if (!normalized) return { valid: false, discountAmount: 0, reason: 'Empty code' };
    const found = this.store.discounts.find((d) => d.code.toUpperCase() === normalized);
    if (!found) return { valid: false, discountAmount: 0, reason: 'Promo code not found.' };
    if (!found.active) return { valid: false, discountAmount: 0, reason: 'Promo code is inactive.' };
    if (found.usedCount >= found.maxUses) {
      return { valid: false, discountAmount: 0, reason: 'Promo code redemption limit reached.' };
    }
    const rawDiscount =
      found.type === 'percent' ? (subtotal * found.value) / 100 : Math.min(subtotal, found.value);
    const discountAmount = Math.max(0, Math.round(rawDiscount * 100) / 100);
    return { valid: true, discountAmount, discount: found };
  }

  createDiscount(data: Omit<DiscountCode, 'id' | 'usedCount' | 'createdAt'>, actor = 'admin'): DiscountCode {
    const code = data.code.trim().toUpperCase();
    const disc: DiscountCode = {
      id: 'disc-' + crypto.randomBytes(4).toString('hex'),
      code,
      type: data.type,
      value: Math.max(1, data.value),
      active: data.active ?? true,
      maxUses: Math.max(1, data.maxUses || 100),
      usedCount: 0,
      description: data.description || `${code} discount`,
      createdAt: new Date().toISOString()
    };
    this.store.discounts.unshift(disc);
    this.saveStore();
    this.logActivity('DISCOUNT_CREATED', 'DISCOUNT', `Promo code ${code} created`, actor, disc.id);
    return disc;
  }

  toggleDiscount(id: string, actor = 'admin'): DiscountCode | null {
    const found = this.store.discounts.find((d) => d.id === id);
    if (!found) return null;
    found.active = !found.active;
    this.saveStore();
    this.logActivity('DISCOUNT_TOGGLED', 'DISCOUNT', `Promo code ${found.code} set active=${found.active}`, actor, id);
    return found;
  }

  deleteDiscount(id: string, actor = 'admin'): boolean {
    const idx = this.store.discounts.findIndex((d) => d.id === id);
    if (idx === -1) return false;
    const removed = this.store.discounts.splice(idx, 1)[0];
    this.saveStore();
    this.logActivity('DISCOUNT_DELETED', 'DISCOUNT', `Promo code ${removed.code} deleted`, actor, id);
    return true;
  }

  // Orders & Verification
  getOrders(userId?: string): Order[] {
    if (userId) {
      return this.store.orders.filter((o) => o.userId === userId);
    }
    return this.store.orders;
  }

  getOrderByNumber(orderNumber: string): Order | undefined {
    return this.store.orders.find((o) => o.orderNumber === orderNumber);
  }

  isTxHashUsedByAnotherOrder(txHash: string, orderNumber: string): string | null {
    const normalized = txHash.trim().toLowerCase();
    const existing = this.store.usedTxHashes[normalized];
    if (existing && existing !== orderNumber) {
      return existing;
    }
    const orderMatch = this.store.orders.find(
      (o) =>
        o.orderNumber !== orderNumber &&
        o.txHash &&
        o.txHash.trim().toLowerCase() === normalized
    );
    return orderMatch ? orderMatch.orderNumber : null;
  }

  createOrder(orderData: {
    userId: string;
    userEmail: string;
    buyerName?: string;
    buyerOrganization?: string;
    buyerIp?: string;
    buyerDevice?: string;
    buyerLocation?: string;
    items: Order['items'];
    subtotal: number;
    discountCode?: string;
    discountAmount: number;
    amount: number;
    paymentMethod: string;
  }): Order {
    const settings = this.getSiteSettings();
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    const orderNumber = `DSK-2026-${randomHex}`;
    const id = 'ord-' + crypto.randomBytes(6).toString('hex');
    const now = Date.now();
    const expiresAt = new Date(now + settings.orderExpiryMinutes * 60 * 1000).toISOString();

    if (orderData.discountCode) {
      const disc = this.store.discounts.find(
        (d) => d.code.toUpperCase() === orderData.discountCode!.toUpperCase()
      );
      if (disc) disc.usedCount += 1;
    }

    const newOrder: Order = {
      id,
      orderNumber,
      userId: orderData.userId,
      userEmail: orderData.userEmail,
      buyerName: orderData.buyerName,
      buyerOrganization: orderData.buyerOrganization,
      buyerIp: orderData.buyerIp,
      buyerDevice: orderData.buyerDevice,
      buyerLocation: orderData.buyerLocation,
      items: orderData.items,
      subtotal: orderData.subtotal,
      discountCode: orderData.discountCode,
      discountAmount: orderData.discountAmount,
      amount: orderData.amount,
      currency: 'USDT',
      paymentMethod: orderData.paymentMethod || `USDT (${settings.trc20Network})`,
      paymentAddress: settings.trc20ReceivingAddress,
      txHash: undefined,
      blockchainVerification: null,
      paymentProof: null,
      status: 'Awaiting Payment',
      expiresAt,
      createdAt: new Date(now).toISOString(),
      updatedAt: new Date(now).toISOString(),
      statusHistory: [
        {
          status: 'Awaiting Payment',
          timestamp: new Date(now).toISOString(),
          note: `Order generated for ${orderData.amount.toLocaleString()} USDT on ${settings.trc20Network}.`
        }
      ]
    };

    this.store.orders.unshift(newOrder);
    this.saveStore();
    this.logActivity(
      'ORDER_CREATED',
      'ORDER',
      `Order ${orderNumber} created by ${orderData.buyerName || orderData.userEmail} for ${newOrder.amount} USDT`,
      orderData.userEmail,
      orderNumber,
      { ip: orderData.buyerIp, device: orderData.buyerDevice }
    );
    return newOrder;
  }

  recordTransactionSubmission(
    orderNumber: string,
    txHash: string,
    verification: BlockchainVerification,
    nextStatus: OrderStatus,
    actor: string
  ): Order | null {
    const order = this.getOrderByNumber(orderNumber);
    if (!order) return null;

    const normalized = txHash.trim().toLowerCase();
    this.store.usedTxHashes[normalized] = orderNumber;
    order.txHash = txHash.trim();
    order.blockchainVerification = verification;
    order.status = nextStatus;
    order.updatedAt = new Date().toISOString();
    order.statusHistory.push({
      status: nextStatus,
      timestamp: order.updatedAt,
      actor,
      note: verification.message
    });

    if (nextStatus === 'Payment Confirmed') {
      this.issueLicensesForOrder(order);
    }

    this.saveStore();
    this.logActivity(
      'TX_VERIFICATION',
      'PAYMENT',
      `TX ${txHash.slice(0, 12)}... checked for ${orderNumber} -> ${nextStatus}`,
      actor,
      orderNumber
    );
    return order;
  }

  uploadPaymentProof(
    orderNumber: string,
    proof: {
      fileName: string;
      fileSize: number;
      fileType: string;
      fileData: string;
    }
  ): Order | null {
    const order = this.getOrderByNumber(orderNumber);
    if (!order) return null;

    order.paymentProof = {
      ...proof,
      uploadedAt: new Date().toISOString()
    };
    if (order.status === 'Awaiting Payment' || order.status === 'Pending Payment') {
      order.status = 'Payment Detected';
    }
    order.updatedAt = new Date().toISOString();
    order.statusHistory.push({
      status: order.status,
      timestamp: order.updatedAt,
      note: `Supplementary receipt ${proof.fileName} attached. Requires transaction confirmation before license issuance.`
    });

    this.saveStore();
    this.logActivity(
      'PROOF_UPLOADED',
      'PAYMENT',
      `Receipt attached for ${orderNumber}`,
      order.userEmail,
      orderNumber
    );
    return order;
  }

  updateOrderStatus(orderNumber: string, status: OrderStatus, actor = 'admin', note?: string): Order | null {
    const order = this.getOrderByNumber(orderNumber);
    if (!order) return null;

    order.status = status;
    order.updatedAt = new Date().toISOString();
    order.statusHistory.push({
      status,
      timestamp: order.updatedAt,
      actor,
      note: note || `Status updated to ${status} by ${actor}`
    });

    if (status === 'Payment Confirmed' || status === 'Approved' || status === 'Completed') {
      this.issueLicensesForOrder(order);
    }

    this.saveStore();
    this.logActivity(
      'STATUS_UPDATED',
      'ORDER',
      `Order ${orderNumber} transitioned to ${status}`,
      actor,
      orderNumber
    );
    return order;
  }

  deleteOrder(orderNumber: string, actor = 'admin'): boolean {
    const idx = this.store.orders.findIndex((o) => o.orderNumber === orderNumber);
    if (idx === -1) return false;
    const removed = this.store.orders.splice(idx, 1)[0];
    if (removed.txHash) {
      delete this.store.usedTxHashes[removed.txHash.trim().toLowerCase()];
    }
    this.saveStore();
    this.logActivity('ORDER_DELETED', 'ORDER', `Order ${orderNumber} removed by administrator`, actor, orderNumber);
    return true;
  }

  // Licenses
  private issueLicensesForOrder(order: Order) {
    const existingForOrder = this.store.licenses.filter((l) => l.orderNumber === order.orderNumber);
    if (existingForOrder.length > 0) return;

    const issuedAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    for (const item of order.items) {
      const product = this.getProductByIdOrSlug(item.productId);
      for (let q = 0; q < (item.quantity || 1); q++) {
        const seg = () => crypto.randomBytes(2).toString('hex').toUpperCase();
        const licenseKey = `DSK-${seg()}-${seg()}-${seg()}-${seg()}`;
        const manifestHash = crypto
          .createHash('sha256')
          .update(`${order.orderNumber}:${item.productId}:${licenseKey}`)
          .digest('hex');

        const lic: LicenseRecord = {
          id: 'lic-' + crypto.randomBytes(4).toString('hex'),
          licenseKey,
          orderNumber: order.orderNumber,
          userId: order.userId,
          userEmail: order.userEmail,
          productId: item.productId,
          productName: item.name,
          productVersion: product?.version || item.version || 'v2026.1-LTS',
          status: 'Active',
          issuedAt,
          expiresAt,
          downloadManifestHash: manifestHash
        };
        this.store.licenses.unshift(lic);
        this.logActivity(
          'LICENSE_ISSUED',
          'LICENSE',
          `Issued ${licenseKey} for ${item.name} (${order.orderNumber})`,
          'system',
          lic.id
        );
      }
    }
  }

  getLicenses(userId?: string): LicenseRecord[] {
    if (userId) {
      return this.store.licenses.filter((l) => l.userId === userId);
    }
    return this.store.licenses;
  }

  toggleLicenseStatus(licenseId: string, actor = 'admin'): LicenseRecord | null {
    const lic = this.store.licenses.find((l) => l.id === licenseId);
    if (!lic) return null;
    lic.status = lic.status === 'Active' ? 'Revoked' : 'Active';
    this.saveStore();
    this.logActivity('LICENSE_STATUS', 'LICENSE', `License ${lic.licenseKey} set to ${lic.status}`, actor, lic.id);
    return lic;
  }

  // Support Tickets
  getTickets(userId?: string): SupportTicket[] {
    if (userId) {
      return this.store.tickets.filter((t) => t.userId === userId);
    }
    return this.store.tickets;
  }

  createTicket(data: {
    userId: string;
    userEmail: string;
    category: string;
    subject: string;
    message: string;
  }): SupportTicket {
    const ticketNumber = 'SUP-' + crypto.randomBytes(3).toString('hex').toUpperCase();
    const now = new Date().toISOString();
    const ticket: SupportTicket = {
      id: 'tkt-' + crypto.randomBytes(4).toString('hex'),
      ticketNumber,
      userId: data.userId,
      userEmail: data.userEmail,
      category: data.category,
      subject: data.subject,
      message: data.message,
      status: 'Open',
      replies: [],
      createdAt: now,
      updatedAt: now
    };
    this.store.tickets.unshift(ticket);
    this.saveStore();
    this.logActivity('TICKET_CREATED', 'SUPPORT', `Ticket ${ticketNumber}: ${data.subject}`, data.userEmail, ticket.id);
    return ticket;
  }

  replyToTicket(
    ticketId: string,
    author: string,
    role: 'user' | 'admin',
    message: string,
    status?: SupportTicket['status']
  ): SupportTicket | null {
    const ticket = this.store.tickets.find((t) => t.id === ticketId || t.ticketNumber === ticketId);
    if (!ticket) return null;
    const now = new Date().toISOString();
    ticket.replies.push({
      id: 'rep-' + crypto.randomBytes(3).toString('hex'),
      author,
      role,
      message,
      timestamp: now
    });
    if (status) {
      ticket.status = status;
    } else if (role === 'admin' && ticket.status === 'Open') {
      ticket.status = 'In Progress';
    }
    ticket.updatedAt = now;
    this.saveStore();
    this.logActivity('TICKET_REPLY', 'SUPPORT', `Reply added to ${ticket.ticketNumber}`, author, ticket.id);
    return ticket;
  }

  // Users & Auth
  getUsers(): User[] {
    return this.store.users;
  }

  getUserById(id: string): User | undefined {
    return this.store.users.find((u) => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  upgradeUserPasswordHash(userId: string, newPlaintext: string) {
    const user = this.getUserById(userId);
    if (!user) return;
    user.passwordHash = hashPassword(newPlaintext);
    this.saveStore();
  }

  createUser(
    username: string,
    email: string,
    passwordHash: string,
    role: 'user' | 'admin' = 'user',
    organization?: string,
    meta?: { ip?: string; device?: string; location?: string }
  ): User {
    const id = 'user-' + crypto.randomBytes(4).toString('hex');
    const now = new Date().toISOString();
    const newUser: User = {
      id,
      username,
      email,
      passwordHash,
      role,
      organization: organization || 'Independent Engineering Team',
      reputation: 100,
      createdAt: now,
      lastLoginAt: now,
      lastIp: meta?.ip,
      lastDevice: meta?.device,
      lastLocation: meta?.location
    };
    this.store.users.push(newUser);
    this.saveStore();
    this.logActivity('USER_REGISTER', 'AUTH', `New account registered: ${username}`, email, id, meta);
    return newUser;
  }

  recordUserLoginMeta(
    userId: string,
    meta?: { ip?: string; device?: string; location?: string }
  ) {
    const user = this.getUserById(userId);
    if (!user) return;
    user.lastLoginAt = new Date().toISOString();
    if (meta?.ip) user.lastIp = meta.ip;
    if (meta?.device) user.lastDevice = meta.device;
    if (meta?.location) user.lastLocation = meta.location;
    this.saveStore();
  }

  // Activity Logs
  getActivityLogs(limit = 100): ActivityLog[] {
    return this.store.activityLogs.slice(0, limit);
  }

  logActivity(
    action: string,
    category: ActivityLog['category'],
    details: string,
    actor: string,
    targetId?: string,
    meta?: { ip?: string; device?: string }
  ) {
    const log: ActivityLog = {
      id: 'log-' + crypto.randomBytes(4).toString('hex'),
      action,
      category,
      details,
      actor,
      targetId,
      ip: meta?.ip,
      device: meta?.device,
      timestamp: new Date().toISOString()
    };
    this.store.activityLogs.unshift(log);
    if (this.store.activityLogs.length > 500) {
      this.store.activityLogs.pop();
    }
    this.saveStore();
  }

  // Admin Stats
  getAdminStats() {
    const isConfirmed = (s: OrderStatus) =>
      s === 'Payment Confirmed' || s === 'Approved' || s === 'Completed';
    const isPending = (s: OrderStatus) =>
      s === 'Awaiting Payment' ||
      s === 'Payment Detected' ||
      s === 'Confirming on Blockchain' ||
      s === 'Pending Payment' ||
      s === 'Proof Uploaded' ||
      s === 'Under Review';
    const isFailed = (s: OrderStatus) =>
      s === 'Payment Failed' || s === 'Payment Expired' || s === 'Rejected';

    const totalOrders = this.store.orders.length;
    const pendingVerification = this.store.orders.filter((o) => isPending(o.status)).length;
    const approvedOrders = this.store.orders.filter((o) => isConfirmed(o.status)).length;
    const rejectedOrders = this.store.orders.filter((o) => isFailed(o.status)).length;
    const totalVolumeUSDT = this.store.orders
      .filter((o) => isConfirmed(o.status))
      .reduce((sum, o) => sum + o.amount, 0);

    return {
      totalOrders,
      pendingVerification,
      approvedOrders,
      rejectedOrders,
      totalVolumeUSDT,
      totalProducts: this.store.products.length,
      totalUsers: this.store.users.filter((u) => u.role !== 'admin').length,
      activeLicenses: this.store.licenses.filter((l) => l.status === 'Active').length,
      openTickets: this.store.tickets.filter((t) => t.status !== 'Resolved').length
    };
  }
}

export const db = new Database();
