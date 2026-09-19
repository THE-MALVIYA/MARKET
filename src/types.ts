export type OrderStatus = 
  | 'Pending Payment'
  | 'Proof Uploaded'
  | 'Under Review'
  | 'Approved'
  | 'Rejected'
  | 'Completed';

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
  createdAt: string;
}

export interface PaymentProof {
  fileName: string;
  fileSize: number;
  fileType: string;
  fileData: string; // base64 data url
  uploadedAt: string;
  verifiedAt?: string;
  adminNote?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  items: OrderItem[];
  amount: number;
  currency: 'USDT';
  paymentMethod: string;
  paymentAddress: string;
  paymentProof?: PaymentProof | null;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
    note?: string;
    actor?: string;
  }[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  reputation: number;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  category: 'ORDER' | 'PAYMENT' | 'PRODUCT' | 'AUTH' | 'ADMIN';
  details: string;
  actor: string;
  targetId?: string;
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
}
