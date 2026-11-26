export type OrderStatus =
  | 'Awaiting Payment'
  | 'Payment Detected'
  | 'Confirming on Blockchain'
  | 'Payment Confirmed'
  | 'Payment Failed'
  | 'Payment Expired'
  | 'Pending Payment'
  | 'Proof Uploaded'
  | 'Under Review'
  | 'Approved'
  | 'Rejected'
  | 'Completed';

export type ActiveTab =
  | 'home'
  | 'products'
  | 'categories'
  | 'product'
  | 'research'
  | 'docs'
  | 'about'
  | 'support'
  | 'dashboard'
  | 'orders'
  | 'checkout'
  | 'admin'
  | 'legal';

export type LegalDocId = 'terms' | 'privacy' | 'refund' | 'payment' | 'contact';

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  currency: 'USDT';
  description: string;
  features: string[];
  image: string;
  rating: number;
  featured: boolean;
  requirements?: string[];
  screenshots?: string[];
  demoScreenshots?: string[];
  productCode?: string;
  version?: string;
  architecture?: string;
  supportedPlatforms?: string[];
  licenseType?: string;
  createdAt: string;
}

export interface PaymentProof {
  fileName: string;
  fileSize: number;
  fileType: string;
  fileData: string;
  uploadedAt: string;
  verifiedAt?: string;
  adminNote?: string;
}

export interface BlockchainVerification {
  txHash: string;
  network: string;
  verified: boolean;
  confirmations: number;
  requiredConfirmations: number;
  blockNumber?: number;
  detectedAmount?: number;
  recipientAddress?: string;
  senderAddress?: string;
  checkedAt: string;
  provider: 'trongrid' | 'manual_audit' | 'validation';
  message: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
  version?: string;
  productCode?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  items: OrderItem[];
  subtotal?: number;
  discountCode?: string;
  discountAmount?: number;
  amount: number;
  currency: 'USDT';
  paymentMethod: string;
  paymentAddress: string;
  txHash?: string;
  blockchainVerification?: BlockchainVerification | null;
  paymentProof?: PaymentProof | null;
  status: OrderStatus;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
    note?: string;
    actor?: string;
  }[];
  buyerName?: string;
  buyerOrganization?: string;
  buyerIp?: string;
  buyerDevice?: string;
  buyerLocation?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  organization?: string;
  avatar?: string;
  reputation: number;
  createdAt: string;
  lastLoginAt?: string;
  lastIp?: string;
  lastDevice?: string;
  lastLocation?: string;
  orderCount?: number;
  totalSpentUSDT?: number;
  licenseCount?: number;
  lastOrderAt?: string | null;
}

export interface LicenseRecord {
  id: string;
  licenseKey: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  productId: string;
  productName: string;
  productVersion: string;
  status: 'Active' | 'Revoked';
  issuedAt: string;
  expiresAt: string;
  downloadManifestHash: string;
}

export interface DiscountCode {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  active: boolean;
  maxUses: number;
  usedCount: number;
  description: string;
  createdAt: string;
}

export interface SupportTicketReply {
  id: string;
  author: string;
  role: 'user' | 'admin';
  message: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  userEmail: string;
  category: string;
  subject: string;
  message: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  replies: SupportTicketReply[];
  createdAt: string;
  updatedAt: string;
}

export interface PaymentConfig {
  network: string;
  currency: string;
  receivingAddress: string;
  requiredConfirmations: number;
  orderExpiryMinutes: number;
  dispatchChannel: string;
  feeNotice: string;
}

export interface SiteSettings {
  brandName: string;
  tagline: string;
  supportEmail: string;
  announcementText: string;
  announcementActive: boolean;
  trc20ReceivingAddress?: string;
  trc20Network: string;
  requiredConfirmations: number;
  orderExpiryMinutes?: number;
  dispatchChannel: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  category: 'ORDER' | 'PAYMENT' | 'PRODUCT' | 'AUTH' | 'ADMIN' | 'LICENSE' | 'SUPPORT' | 'DISCOUNT';
  details: string;
  actor: string;
  targetId?: string;
  ip?: string;
  device?: string;
  timestamp: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AdminStats {
  totalOrders: number;
  pendingVerification: number;
  approvedOrders: number;
  rejectedOrders: number;
  totalVolumeUSDT: number;
  totalProducts: number;
  totalUsers: number;
  activeLicenses?: number;
  openTickets?: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'security' | 'release' | 'order' | 'system';
  read: boolean;
  timestamp: string;
}

export interface UserActivityEntry {
  id: string;
  title: string;
  detail: string;
  category: 'catalog' | 'wishlist' | 'order' | 'security' | 'account';
  timestamp: string;
}

export interface UserPreferences {
  displayName: string;
  organization: string;
  contactEmail: string;
  timezone: string;
  twoFactorEnabled: boolean;
  hardwareKeyEnforced: boolean;
  ipAllowlistEnabled: boolean;
  sessionTimeoutMinutes: number;
  notifyOrderUpdates: boolean;
  notifySecurityAdvisories: boolean;
  notifyToolReleases: boolean;
  notifyWeeklyDigest: boolean;
}
