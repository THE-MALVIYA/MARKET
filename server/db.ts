import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Product, Order, User, ActivityLog, OrderStatus } from './types';

const DATA_DIR = path.join(process.cwd(), 'server', 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

export interface DatabaseStore {
  users: User[];
  products: Product[];
  orders: Order[];
  activityLogs: ActivityLog[];
}

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'toolplaces_secret_salt_2026').digest('hex');
}

// Initial Products Catalog (7 High-Performance Enterprise Developer & Infrastructure Toolkits)
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-global-t',
    name: 'Global-T',
    slug: 'global-t',
    category: 'Enterprise Telemetry & Observability',
    price: 4276,
    currency: 'USDT',
    featured: true,
    rating: 4.96,
    productCode: 'GLB-T-4200',
    version: 'v4.1.2-ENTERPRISE',
    architecture: 'Distributed eBPF / Kubernetes / Multi-Cloud',
    description: 'Global-T is a high-performance distributed telemetry and system observability suite engineered for massive global-scale infrastructure. Features sub-millisecond event streaming, kernel-level eBPF tracing, automatic distributed mesh topology visualization, and autonomous anomaly detection.',
    features: [
      'Kernel-level eBPF distributed telemetry collection',
      'Sub-millisecond latency global metric aggregation',
      'Automated network topology dependency mapping',
      'Real-time multi-cloud metric streaming pipelines',
      'High-cardinality time-series analytics engine'
    ],
    requirements: [
      'Linux Kernel 5.4+ with eBPF support',
      'Minimum 8GB RAM allocation',
      'Multi-core x86_64 or ARM64 architecture',
      'Root / elevated supervisor privileges'
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80'
    ],
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date('2026-02-01T10:00:00Z').toISOString()
  },
  {
    id: 'prod-sp-kit',
    name: 'SP-kIT',
    slug: 'sp-kit',
    category: 'Stream Processing & Pipelines',
    price: 2214,
    currency: 'USDT',
    featured: true,
    rating: 4.92,
    productCode: 'SPK-PROC-220',
    version: 'v3.8.0-STABLE',
    architecture: 'Zero-Copy Native C++ / Rust Core',
    description: 'SP-kIT delivers ultra-low latency real-time stream processing and high-throughput event routing for mission-critical enterprise systems. Optimized for zero-copy memory allocation, parallel pipelining, and fault-tolerant state management across distributed event clusters.',
    features: [
      'Zero-copy memory mapped stream ingestion',
      'High-throughput distributed event broker connector',
      'Deterministic fault recovery and state snapshots',
      'Dynamic micro-batching and windowing operators',
      'Integrated Prometheus & OpenTelemetry instrumentation'
    ],
    requirements: [
      '64-bit Linux, macOS, or Windows Server',
      'Minimum 4GB RAM',
      'C++20 / Rust compatible runtime libraries'
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80'
    ],
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date('2026-02-05T12:00:00Z').toISOString()
  },
  {
    id: 'prod-enternalx',
    name: 'Enternalx',
    slug: 'enternalx',
    category: 'Enterprise Infrastructure & Gateways',
    price: 5213,
    currency: 'USDT',
    featured: true,
    rating: 4.98,
    productCode: 'ENX-CORE-5200',
    version: 'v5.4.0-LTS',
    architecture: 'Cloud-Native Microservices / Multi-AZ',
    description: 'Enternalx is a premier enterprise internal systems architecture and zero-trust service gateway. Provides unified API federation, cryptographic identity-based access control, distributed configuration consensus, and automated resilience management for hybrid cloud deployments.',
    features: [
      'Unified enterprise API federation and service mesh',
      'Cryptographic mutual TLS (mTLS) identity verification',
      'Distributed Raft-based configuration synchronization',
      'Automatic circuit breaking and dynamic traffic shedding',
      'Audit-grade compliance telemetry and tamper-evident logging'
    ],
    requirements: [
      'Kubernetes 1.25+ or Docker Engine 24.0+',
      '16GB RAM recommended for production clusters',
      'Dedicated private VPC or internal enterprise network'
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80'
    ],
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date('2026-02-10T14:30:00Z').toISOString()
  },
  {
    id: 'prod-m-global',
    name: 'M-global',
    slug: 'm-global',
    category: 'Multi-Cloud & Edge Orchestration',
    price: 2534,
    currency: 'USDT',
    featured: false,
    rating: 4.89,
    productCode: 'MGL-ORCH-250',
    version: 'v2.9.4-PRO',
    architecture: 'Cross-Cloud Agnostic / Edge Runtime',
    description: 'M-global orchestrates multi-region workloads and global edge computing nodes with instant failover and automated routing. Features automated GeoDNS traffic balancing, hybrid cloud container scheduling, and real-time edge state synchronization.',
    features: [
      'Intelligent GeoDNS and Anycast traffic optimization',
      'Cross-cloud hybrid workload synchronization',
      'Zero-downtime blue/green edge deployments',
      'Edge storage replication with optimistic concurrency',
      'Real-time health probes and autonomous node healing'
    ],
    requirements: [
      'Container Runtime (containerd, Docker, or Podman)',
      '2GB RAM per edge node',
      'Outbound HTTPS connectivity to control plane'
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=800&q=80'
    ],
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date('2026-02-14T09:15:00Z').toISOString()
  },
  {
    id: 'prod-global-c',
    name: 'global-c',
    slug: 'global-c',
    category: 'Distributed Compute & Cluster Systems',
    price: 6774,
    currency: 'USDT',
    featured: true,
    rating: 4.95,
    productCode: 'GLC-COMP-670',
    version: 'v6.0.2-ENTERPRISE',
    architecture: 'High Performance Compute (HPC) / GPU Accelerated',
    description: 'global-c is an industrial-grade distributed compute cluster coordinator designed for intense parallel computational workloads, algorithmic simulations, and massive data processing. Features hardware-accelerated scheduling and memory-locality optimizations.',
    features: [
      'Heterogeneous hardware job dispatching (CPU, GPU, FPGA)',
      'NUMA-aware memory scheduling and caching layer',
      'Automated cluster partition re-balancing on node flux',
      'High-efficiency remote direct memory access (RDMA) support',
      'Comprehensive cluster utilization telemetry dashboard'
    ],
    requirements: [
      'Clustered server nodes with Linux (RHEL, Ubuntu, Rocky Linux)',
      '32GB+ RAM recommended for coordinator node',
      'High-speed interconnect (10GbE or InfiniBand)'
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80'
    ],
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date('2026-02-18T16:00:00Z').toISOString()
  },
  {
    id: 'prod-cryptopro',
    name: 'Cryptopro',
    slug: 'cryptopro',
    category: 'Cryptographic Security & Verification',
    price: 4211,
    currency: 'USDT',
    featured: true,
    rating: 4.97,
    productCode: 'CPR-CRYPT-421',
    version: 'v4.6.0-PRO',
    architecture: 'FIPS 140-2 Level 3 Ready / Air-Gapped Capable',
    description: 'Cryptopro provides enterprise-grade cryptographic key management, zero-knowledge verification proofs, and post-quantum resilient cryptographic primitives. Built for banking-grade security architectures, audit compliance, and hardened air-gapped cryptographic workstations.',
    features: [
      'Post-quantum lattice-based encryption algorithms (Kyber, Dilithium)',
      'Zero-knowledge zk-SNARK computation and verification suite',
      'HSM integration (PKCS#11 compliant hardware tokens)',
      'Automated cryptographic key rotation and lifecycle policies',
      'Verifiable entropy generation and RNG validation harness'
    ],
    requirements: [
      'Hardware Security Module (HSM) or Air-Gapped Linux/Unix host',
      'Python 3.11+ or compiled native binary runtime',
      'Cryptographic hardware acceleration module (AES-NI / AVX-512)'
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80'
    ],
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date('2026-02-22T11:45:00Z').toISOString()
  },
  {
    id: 'prod-f-shoot',
    name: 'F-SHOOT v9.7.0',
    slug: 'f-shoot-v9-7-0',
    category: 'Automated Diagnostics & Fault Resolution',
    price: 27453,
    currency: 'USDT',
    featured: true,
    rating: 4.99,
    productCode: 'FSH-970-ULTRA',
    version: 'v9.7.0-FLAGSHIP',
    architecture: 'Autonomous Diagnostic Engine / Universal Linux & BSD',
    description: 'F-SHOOT v9.7.0 is the flagship autonomous troubleshooting and system fault-resolution suite for mission-critical tier-1 infrastructure. Features real-time root-cause analysis engines, automated kernel panic analysis, deep network bottleneck isolation, and instant remediation orchestration.',
    features: [
      'Autonomous root-cause diagnosis across 10,000+ infrastructure metrics',
      'Automated kernel coredump and thread deadlock inspector',
      'BGP route flapping and microburst packet-drop isolation',
      'One-click synthetic remediation scripts with rollback guarantees',
      '24/7 dedicated enterprise priority telemetry bridge'
    ],
    requirements: [
      'Enterprise Linux 8+, FreeBSD 13+, or Unix server',
      '16GB minimum system memory',
      'Root supervisor permissions for diagnostic probing'
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80'
    ],
    image: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date('2026-02-25T18:00:00Z').toISOString()
  }
];

// Initial pre-configured users
const INITIAL_USERS: User[] = [
  {
    id: 'user-admin-01',
    username: 'root_overseer',
    email: 'admin@toolplaces.io',
    passwordHash: hashPassword('admin123'),
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    reputation: 99.9,
    createdAt: new Date('2026-01-01T00:00:00Z').toISOString()
  },
  {
    id: 'user-agent-01',
    username: 'cipher_agent',
    email: 'agent@toolplaces.io',
    passwordHash: hashPassword('user123'),
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
    reputation: 98.4,
    createdAt: new Date('2026-01-05T00:00:00Z').toISOString()
  }
];

// Initial seeded orders (Empty)
const INITIAL_ORDERS: Order[] = [];

const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'log-01',
    action: 'SYSTEM_BOOT',
    category: 'ADMIN',
    details: 'ToolPlaces platform initialized. Catalog cleared.',
    actor: 'system',
    timestamp: new Date().toISOString()
  }
];

class Database {
  private store: DatabaseStore;

  constructor() {
    this.store = {
      users: INITIAL_USERS,
      products: INITIAL_PRODUCTS,
      orders: INITIAL_ORDERS,
      activityLogs: INITIAL_LOGS
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
        if (parsed.products && Array.isArray(parsed.products)) {
          this.store = parsed;
          return;
        }
      }

      this.saveStore();
    } catch (err) {
      console.warn('[DB] Using in-memory fallback store:', err);
    }
  }

  private saveStore() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(STORE_FILE, JSON.stringify(this.store, null, 2), 'utf-8');
    } catch (err) {
      console.warn('[DB] Failed to save store to file:', err);
    }
  }

  // Products
  getProducts(): Product[] {
    return this.store.products;
  }

  getProductByIdOrSlug(idOrSlug: string): Product | undefined {
    return this.store.products.find(
      (p) => p.id === idOrSlug || p.slug === idOrSlug
    );
  }

  addProduct(product: Omit<Product, 'id' | 'createdAt'>): Product {
    const id = 'prod-' + crypto.randomBytes(4).toString('hex');
    const newProduct: Product = {
      ...product,
      id,
      slug: product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      createdAt: new Date().toISOString()
    };
    this.store.products.unshift(newProduct);
    this.saveStore();
    this.logActivity('PRODUCT_CREATED', 'PRODUCT', `Product ${newProduct.name} created`, 'admin', newProduct.id);
    return newProduct;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const idx = this.store.products.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.store.products[idx] = { ...this.store.products[idx], ...updates };
    this.saveStore();
    this.logActivity('PRODUCT_UPDATED', 'PRODUCT', `Product ${this.store.products[idx].name} updated`, 'admin', id);
    return this.store.products[idx];
  }

  deleteProduct(id: string): boolean {
    const idx = this.store.products.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    const removed = this.store.products.splice(idx, 1)[0];
    this.saveStore();
    this.logActivity('PRODUCT_DELETED', 'PRODUCT', `Product ${removed.name} removed`, 'admin', id);
    return true;
  }

  // Orders
  getOrders(userId?: string): Order[] {
    if (userId) {
      return this.store.orders.filter((o) => o.userId === userId);
    }
    return this.store.orders;
  }

  getOrderByNumber(orderNumber: string): Order | undefined {
    return this.store.orders.find((o) => o.orderNumber === orderNumber);
  }

  createOrder(orderData: {
    userId: string;
    userEmail: string;
    items: Order['items'];
    amount: number;
    paymentMethod: string;
    paymentAddress: string;
  }): Order {
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    const orderNumber = `TP-2026-${randomHex}`;
    const id = 'ord-' + crypto.randomBytes(6).toString('hex');

    const newOrder: Order = {
      id,
      orderNumber,
      userId: orderData.userId,
      userEmail: orderData.userEmail,
      items: orderData.items,
      amount: orderData.amount,
      currency: 'USDT',
      paymentMethod: orderData.paymentMethod || 'USDT (TRC-20)',
      paymentAddress: orderData.paymentAddress || 'TL9sU4A1ydN9AT2LTaC7P94K4y4BdAgDFx',
      paymentProof: null,
      status: 'Pending Payment',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusHistory: [
        {
          status: 'Pending Payment',
          timestamp: new Date().toISOString(),
          note: 'Order generated. Awaiting USDT transfer.'
        }
      ]
    };

    this.store.orders.unshift(newOrder);
    this.saveStore();
    this.logActivity('ORDER_CREATED', 'ORDER', `New order ${orderNumber} created for ${newOrder.amount} USDT`, orderData.userEmail, orderNumber);
    return newOrder;
  }

  uploadPaymentProof(orderNumber: string, proof: {
    fileName: string;
    fileSize: number;
    fileType: string;
    fileData: string;
  }): Order | null {
    const order = this.getOrderByNumber(orderNumber);
    if (!order) return null;

    order.paymentProof = {
      ...proof,
      uploadedAt: new Date().toISOString()
    };
    order.status = 'Proof Uploaded';
    order.updatedAt = new Date().toISOString();
    order.statusHistory.push({
      status: 'Proof Uploaded',
      timestamp: new Date().toISOString(),
      note: `Screenshot proof ${proof.fileName} submitted. Pending admin review.`
    });

    this.saveStore();
    this.logActivity('PROOF_UPLOADED', 'PAYMENT', `Payment proof submitted for order ${orderNumber}`, order.userEmail, orderNumber);
    return order;
  }

  updateOrderStatus(orderNumber: string, status: OrderStatus, actor = 'admin', note?: string): Order | null {
    const order = this.getOrderByNumber(orderNumber);
    if (!order) return null;

    order.status = status;
    order.updatedAt = new Date().toISOString();
    order.statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      actor,
      note: note || `Status changed to ${status} by ${actor}`
    });

    this.saveStore();
    this.logActivity('STATUS_UPDATED', 'ORDER', `Order ${orderNumber} status changed to ${status}`, actor, orderNumber);
    return order;
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

  createUser(username: string, email: string, passwordHash: string, role: 'user' | 'admin' = 'user'): User {
    const id = 'user-' + crypto.randomBytes(4).toString('hex');
    const newUser: User = {
      id,
      username,
      email,
      passwordHash,
      role,
      reputation: 100,
      createdAt: new Date().toISOString()
    };
    this.store.users.push(newUser);
    this.saveStore();
    this.logActivity('USER_REGISTER', 'AUTH', `New user registered: ${username}`, username, id);
    return newUser;
  }

  // Activity Logs
  getActivityLogs(limit = 50): ActivityLog[] {
    return this.store.activityLogs.slice(0, limit);
  }

  logActivity(action: string, category: ActivityLog['category'], details: string, actor: string, targetId?: string) {
    const log: ActivityLog = {
      id: 'log-' + crypto.randomBytes(4).toString('hex'),
      action,
      category,
      details,
      actor,
      targetId,
      timestamp: new Date().toISOString()
    };
    this.store.activityLogs.unshift(log);
    if (this.store.activityLogs.length > 500) {
      this.store.activityLogs.pop();
    }
    this.saveStore();
  }

  // Stats
  getAdminStats() {
    const totalOrders = this.store.orders.length;
    const pendingVerification = this.store.orders.filter(
      (o) => o.status === 'Proof Uploaded' || o.status === 'Under Review' || o.status === 'Pending Payment'
    ).length;
    const approvedOrders = this.store.orders.filter((o) => o.status === 'Approved' || o.status === 'Completed').length;
    const rejectedOrders = this.store.orders.filter((o) => o.status === 'Rejected').length;
    const totalVolumeUSDT = this.store.orders
      .filter((o) => o.status === 'Approved' || o.status === 'Completed')
      .reduce((sum, o) => sum + o.amount, 0);

    return {
      totalOrders,
      pendingVerification,
      approvedOrders,
      rejectedOrders,
      totalVolumeUSDT,
      totalProducts: this.store.products.length,
      totalUsers: this.store.users.length
    };
  }
}

export const db = new Database();
