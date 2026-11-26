import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  Product,
  Order,
  User,
  CartItem,
  OrderStatus,
  AdminStats,
  ActivityLog,
  ActiveTab,
  LegalDocId,
  NotificationItem,
  UserActivityEntry,
  UserPreferences,
  PaymentConfig,
  SiteSettings,
  LicenseRecord,
  SupportTicket,
  DiscountCode
} from '../types';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface MarketContextType {
  // Navigation & view
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeLegalDoc: LegalDocId;
  openLegalDoc: (doc: LegalDocId) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Platform settings & payment config (fetched from backend)
  siteSettings: SiteSettings | null;
  paymentConfig: PaymentConfig | null;
  fetchPlatformMeta: () => Promise<void>;

  // Products
  products: Product[];
  categories: string[];
  isLoadingProducts: boolean;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  openProductDetails: (product: Product) => void;
  fetchProducts: () => Promise<void>;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;

  // Cart & Discounts
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cartTotal: number;
  cartItemCount: number;
  validateDiscountCode: (
    code: string,
    subtotal: number
  ) => Promise<{ valid: boolean; code?: string; discountAmount: number; description?: string; message?: string }>;

  // Orders & Blockchain Verification
  orders: Order[];
  isLoadingOrders: boolean;
  activeOrderNumber: string | null;
  setActiveOrderNumber: (orderNumber: string | null) => void;
  fetchOrders: () => Promise<void>;
  createOrder: (items: CartItem[], discountCode?: string) => Promise<Order | null>;
  submitTxVerification: (orderNumber: string, txHash: string) => Promise<Order | null>;
  uploadPaymentProof: (
    orderNumber: string,
    file: { fileName: string; fileSize: number; fileType: string; fileData: string }
  ) => Promise<Order | null>;
  updateOrderStatus: (orderNumber: string, status: OrderStatus, note?: string) => Promise<boolean>;

  // Licenses & Support Tickets (authenticated user)
  licenses: LicenseRecord[];
  tickets: SupportTicket[];
  fetchUserAssets: () => Promise<void>;
  submitSupportTicket: (category: string, subject: string, message: string) => Promise<SupportTicket | null>;
  downloadLicenseBundle: (licenseId: string, filenameHint: string) => Promise<void>;

  // Auth (Bearer token kept strictly in React memory)
  authToken: string | null;
  currentUser: User | null;
  userRole: 'guest' | 'user' | 'admin';
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  login: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  register: (
    username: string,
    email: string,
    password: string,
    organization?: string
  ) => Promise<{ ok: boolean; message?: string }>;
  logout: () => void;
  getAdminAuthStatus: () => Promise<{ envConfigured: boolean; claimed: boolean; setupRequired: boolean }>;
  adminLogin: (passcode: string) => Promise<{ ok: boolean; message?: string }>;
  claimAdmin: (passcode: string) => Promise<{ ok: boolean; message?: string }>;
  userPreferences: UserPreferences;
  updateUserPreferences: (updates: Partial<UserPreferences>, activityNote?: string) => void;

  // Notifications & Activity
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  recentActivity: UserActivityEntry[];
  recordActivity: (entry: Omit<UserActivityEntry, 'id' | 'timestamp'>) => void;

  // Admin Console Data & Operations
  adminStats: AdminStats | null;
  activityLogs: ActivityLog[];
  adminUsers: User[];
  adminLicenses: LicenseRecord[];
  adminDiscounts: DiscountCode[];
  adminTickets: SupportTicket[];
  adminSettings: SiteSettings | null;
  fetchAdminData: () => Promise<void>;
  saveProduct: (productData: Partial<Product>) => Promise<boolean>;
  deleteProduct: (productId: string) => Promise<boolean>;
  renameCategory: (oldCategory: string, newCategory: string) => Promise<boolean>;
  recheckOrderTx: (orderNumber: string) => Promise<boolean>;
  toggleLicenseStatus: (licenseId: string) => Promise<boolean>;
  createDiscount: (data: {
    code: string;
    type: 'percent' | 'fixed';
    value: number;
    maxUses: number;
    description: string;
  }) => Promise<boolean>;
  toggleDiscount: (id: string) => Promise<boolean>;
  deleteDiscount: (id: string) => Promise<boolean>;
  replyAdminTicket: (ticketId: string, message: string, status?: SupportTicket['status']) => Promise<boolean>;
  updateTicketStatus: (ticketId: string, status: SupportTicket['status']) => Promise<boolean>;
  deleteAdminOrder: (orderNumber: string) => Promise<boolean>;
  updateAdminSettings: (updates: Partial<SiteSettings>) => Promise<boolean>;

  // Toasts
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  displayName: 'Guest Engineer',
  organization: 'Enterprise Security Workspace',
  contactEmail: '',
  timezone: 'UTC+00:00 (Coordinated Universal Time)',
  twoFactorEnabled: true,
  hardwareKeyEnforced: false,
  ipAllowlistEnabled: false,
  sessionTimeoutMinutes: 60,
  notifyOrderUpdates: true,
  notifySecurityAdvisories: true,
  notifyToolReleases: true,
  notifyWeeklyDigest: false
};

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'On-Chain TRC-20 Verification Enabled',
    message: 'Submit a valid Tron TRC-20 TXID hash at checkout for automated blockchain settlement verification.',
    type: 'system',
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    id: 'notif-2',
    title: 'Catalog Manifests Synchronized',
    message: 'All software listings include SHA-256 package digests and verified compatibility specifications.',
    type: 'security',
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 140).toISOString()
  }
];

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const MarketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTabState] = useState<ActiveTab>('home');
  const [activeLegalDoc, setActiveLegalDoc] = useState<LegalDocId>('terms');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['All Categories']);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('dsk_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('dsk_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Auth state strictly in React memory (never persisted raw JWT/tokens in localStorage)
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  const userRole: 'guest' | 'user' | 'admin' = currentUser ? currentUser.role : 'guest';

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(false);
  const [activeOrderNumber, setActiveOrderNumber] = useState<string | null>(null);
  const [licenses, setLicenses] = useState<LicenseRecord[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  const [userPreferences, setUserPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [recentActivity, setRecentActivity] = useState<UserActivityEntry[]>([]);

  // Admin state
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [adminLicenses, setAdminLicenses] = useState<LicenseRecord[]>([]);
  const [adminDiscounts, setAdminDiscounts] = useState<DiscountCode[]>([]);
  const [adminTickets, setAdminTickets] = useState<SupportTicket[]>([]);
  const [adminSettings, setAdminSettings] = useState<SiteSettings | null>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const authHeaders = useCallback(
    (extra?: Record<string, string>): Record<string, string> => {
      const headers: Record<string, string> = { ...(extra || {}) };
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }
      return headers;
    },
    [authToken]
  );

  const setActiveTab = useCallback((tab: ActiveTab) => {
    setActiveTabState(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const openLegalDoc = useCallback(
    (doc: LegalDocId) => {
      setActiveLegalDoc(doc);
      setActiveTab('legal');
    },
    [setActiveTab]
  );

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const recordActivity = useCallback((entry: Omit<UserActivityEntry, 'id' | 'timestamp'>) => {
    const newEntry: UserActivityEntry = {
      ...entry,
      id: 'act-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString()
    };
    setRecentActivity((prev) => [newEntry, ...prev].slice(0, 25));
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('dsk_cart', JSON.stringify(cart));
    } catch {
      // ignore storage errors
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('dsk_wishlist', JSON.stringify(wishlist));
    } catch {
      // ignore storage errors
    }
  }, [wishlist]);

  const fetchPlatformMeta = useCallback(async () => {
    try {
      const [settingsRes, paymentRes] = await Promise.all([
        fetch('/api/platform/settings'),
        fetch('/api/orders/payment-config')
      ]);
      if (settingsRes.ok) {
        setSiteSettings(await settingsRes.json());
      }
      if (paymentRes.ok) {
        setPaymentConfig(await paymentRes.json());
      }
    } catch {
      // ignore transient offline state
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoadingProducts(true);
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
        const uniqueCats = [
          'All Categories',
          ...(Array.from(new Set(data.products.map((p: Product) => p.category))) as string[])
        ];
        setCategories(uniqueCats);
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Catalog Connection Error',
        message: 'Unable to load software catalog from server.'
      });
    } finally {
      setIsLoadingProducts(false);
    }
  }, [addToast]);

  const fetchOrders = useCallback(async () => {
    if (!authToken) {
      setOrders([]);
      return;
    }
    try {
      setIsLoadingOrders(true);
      const res = await fetch('/api/orders', { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingOrders(false);
    }
  }, [authToken, authHeaders]);

  const fetchUserAssets = useCallback(async () => {
    if (!authToken) {
      setLicenses([]);
      setTickets([]);
      return;
    }
    try {
      const [licRes, tktRes] = await Promise.all([
        fetch('/api/platform/licenses', { headers: authHeaders() }),
        fetch('/api/platform/tickets', { headers: authHeaders() })
      ]);
      if (licRes.ok) {
        const licData = await licRes.json();
        setLicenses(licData.licenses || []);
      }
      if (tktRes.ok) {
        const tktData = await tktRes.json();
        setTickets(tktData.tickets || []);
      }
    } catch {
      // ignore
    }
  }, [authToken, authHeaders]);

  const fetchAdminData = useCallback(async () => {
    if (!authToken || currentUser?.role !== 'admin') return;
    try {
      const headers = authHeaders();
      const [statsRes, logsRes, usersRes, licRes, discRes, tktRes, setRes] =
        await Promise.allSettled([
          fetch('/api/admin/stats', { headers }),
          fetch('/api/admin/activity-logs', { headers }),
          fetch('/api/admin/users', { headers }),
          fetch('/api/admin/licenses', { headers }),
          fetch('/api/admin/discounts', { headers }),
          fetch('/api/admin/tickets', { headers }),
          fetch('/api/admin/settings', { headers })
        ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
        const d = await statsRes.value.json();
        setAdminStats(d.stats || null);
      }
      if (logsRes.status === 'fulfilled' && logsRes.value.ok) {
        const d = await logsRes.value.json();
        setActivityLogs(d.logs || []);
      }
      if (usersRes.status === 'fulfilled' && usersRes.value.ok) {
        const d = await usersRes.value.json();
        setAdminUsers(d.users || []);
      }
      if (licRes.status === 'fulfilled' && licRes.value.ok) {
        const d = await licRes.value.json();
        setAdminLicenses(d.licenses || []);
      }
      if (discRes.status === 'fulfilled' && discRes.value.ok) {
        const d = await discRes.value.json();
        setAdminDiscounts(d.discounts || []);
      }
      if (tktRes.status === 'fulfilled' && tktRes.value.ok) {
        const d = await tktRes.value.json();
        setAdminTickets(d.tickets || []);
      }
      if (setRes.status === 'fulfilled' && setRes.value.ok) {
        const d = await setRes.value.json();
        setAdminSettings(d.settings || null);
      }
    } catch {
      // ignore
    }
  }, [authToken, authHeaders, currentUser?.role]);

  useEffect(() => {
    fetchPlatformMeta();
    fetchProducts();
  }, [fetchPlatformMeta, fetchProducts]);

  useEffect(() => {
    if (authToken && currentUser) {
      setUserPreferences((prev) => ({
        ...prev,
        displayName: currentUser.username,
        organization: currentUser.organization || prev.organization,
        contactEmail: currentUser.email
      }));
      fetchOrders();
      fetchUserAssets();
      if (currentUser.role === 'admin') {
        fetchAdminData();
      }
    } else {
      setOrders([]);
      setLicenses([]);
      setTickets([]);
      setAdminStats(null);
      setActivityLogs([]);
    }
  }, [authToken, currentUser, fetchOrders, fetchUserAssets, fetchAdminData]);

  // Auth actions
  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, message: data.message || 'Sign in failed.' };
      setAuthToken(data.token);
      setCurrentUser(data.user);
      setAuthModalOpen(false);
      addToast({
        type: 'success',
        title: 'Signed In',
        message: `Authenticated as ${data.user.email}`
      });
      recordActivity({
        title: 'Session Authenticated',
        detail: `Signed in as ${data.user.email}`,
        category: 'security'
      });
      return { ok: true };
    } catch {
      return { ok: false, message: 'Network error during authentication.' };
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    organization?: string
  ) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, organization })
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, message: data.message || 'Registration failed.' };
      setAuthToken(data.token);
      setCurrentUser(data.user);
      setAuthModalOpen(false);
      addToast({
        type: 'success',
        title: 'Account Created',
        message: `Welcome to DEEPSEEK, ${data.user.username}.`
      });
      return { ok: true };
    } catch {
      return { ok: false, message: 'Network error during registration.' };
    }
  };

  const logout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    setOrders([]);
    setLicenses([]);
    setTickets([]);
    setAdminStats(null);
    setUserPreferences(DEFAULT_PREFERENCES);
    addToast({ type: 'info', title: 'Signed Out', message: 'Your workspace session has ended.' });
  };

  const getAdminAuthStatus = async () => {
    const res = await fetch('/api/auth/admin-status');
    return res.json();
  };

  const adminLogin = async (passcode: string) => {
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode })
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, message: data.message || 'Invalid passcode.' };
      setAuthToken(data.token);
      setCurrentUser(data.user);
      addToast({ type: 'success', title: 'Admin Session Active', message: 'Management console unlocked.' });
      return { ok: true };
    } catch {
      return { ok: false, message: 'Unable to reach authentication service.' };
    }
  };

  const claimAdmin = async (passcode: string) => {
    try {
      const res = await fetch('/api/auth/claim-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode })
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, message: data.message || 'Claim failed.' };
      setAuthToken(data.token);
      setCurrentUser(data.user);
      addToast({ type: 'success', title: 'Admin Configured', message: 'Administrator console initialized.' });
      return { ok: true };
    } catch {
      return { ok: false, message: 'Network error configuring admin access.' };
    }
  };

  const openProductDetails = useCallback(
    (product: Product) => {
      setSelectedProduct(product);
      setActiveTab('product');
      recordActivity({
        title: `Viewed ${product.name}`,
        detail: `${product.productCode || product.id} · ${product.category}`,
        category: 'catalog'
      });
    },
    [recordActivity, setActiveTab]
  );

  const toggleWishlist = useCallback(
    (product: Product) => {
      setWishlist((prev) => {
        const exists = prev.includes(product.id);
        const next = exists ? prev.filter((id) => id !== product.id) : [product.id, ...prev];
        addToast({
          type: exists ? 'info' : 'success',
          title: exists ? 'Removed from Wishlist' : 'Saved to Wishlist',
          message: `${product.name} ${exists ? 'removed from' : 'added to'} your saved list.`
        });
        return next;
      });
    },
    [addToast]
  );

  const isInWishlist = useCallback((productId: string) => wishlist.includes(productId), [wishlist]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  const updateUserPreferences = useCallback(
    (updates: Partial<UserPreferences>, activityNote?: string) => {
      setUserPreferences((prev) => ({ ...prev, ...updates }));
      addToast({
        type: 'success',
        title: 'Settings Saved',
        message: activityNote || 'Account preferences updated.'
      });
      recordActivity({
        title: 'Updated Account Settings',
        detail: activityNote || 'Updated workspace profile preferences.',
        category: 'account'
      });
    },
    [addToast, recordActivity]
  );

  // Cart operations
  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { product, quantity }];
    });
    addToast({
      type: 'success',
      title: 'Added to Cart',
      message: `${product.name} (x${quantity}) added to licensing queue.`
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const validateDiscountCode = async (code: string, subtotal: number) => {
    try {
      const res = await fetch('/api/platform/discounts/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal })
      });
      const data = await res.json();
      if (!res.ok) return { valid: false, discountAmount: 0, message: data.message };
      return data;
    } catch {
      return { valid: false, discountAmount: 0, message: 'Unable to validate discount code.' };
    }
  };

  // Order creation (requires authenticated session)
  const createOrder = async (items: CartItem[], discountCode?: string): Promise<Order | null> => {
    if (!authToken) {
      setAuthModalOpen(true);
      addToast({
        type: 'warning',
        title: 'Sign In Required',
        message: 'Please sign in or create an account to generate a licensed order.'
      });
      return null;
    }

    try {
      const orderItems = items.map((i) => ({
        productId: i.product.id,
        quantity: i.quantity
      }));

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          items: orderItems,
          discountCode: discountCode || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Unable to generate order');
      }

      clearCart();
      await fetchOrders();
      setActiveOrderNumber(data.order.orderNumber);
      addToast({
        type: 'success',
        title: 'Order Generated',
        message: `Order ${data.order.orderNumber} ready for USDT (TRC-20) settlement.`
      });
      recordActivity({
        title: `Created Order ${data.order.orderNumber}`,
        detail: `${data.order.amount.toLocaleString()} USDT`,
        category: 'order'
      });
      return data.order;
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Order Creation Failed',
        message: err.message || 'Please try again.'
      });
      return null;
    }
  };

  // Submit TX Hash for real blockchain verification
  const submitTxVerification = async (orderNumber: string, txHash: string): Promise<Order | null> => {
    try {
      const res = await fetch(`/api/orders/${orderNumber}/verify-tx`, {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ txHash })
      });
      const data = await res.json();
      if (!res.ok && !data.order) {
        addToast({
          type: 'error',
          title: 'Verification Rejected',
          message: data.message || 'Transaction hash validation failed.'
        });
        return null;
      }

      await fetchOrders();
      await fetchUserAssets();

      const status = data.status as OrderStatus;
      addToast({
        type:
          status === 'Payment Confirmed'
            ? 'success'
            : status === 'Payment Failed'
            ? 'error'
            : 'info',
        title: `Payment Status: ${status}`,
        message: data.verification?.message
      });

      return data.order || null;
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Verification Error',
        message: err.message || 'Could not reach verification engine.'
      });
      return null;
    }
  };

  const uploadPaymentProof = async (
    orderNumber: string,
    file: { fileName: string; fileSize: number; fileType: string; fileData: string }
  ): Promise<Order | null> => {
    try {
      const res = await fetch(`/api/orders/${orderNumber}/proof`, {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(file)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');

      await fetchOrders();
      addToast({
        type: 'info',
        title: 'Receipt Attached',
        message: data.message
      });
      return data.order;
    } catch (err: any) {
      addToast({ type: 'error', title: 'Upload Rejected', message: err.message });
      return null;
    }
  };

  const submitSupportTicket = async (category: string, subject: string, message: string) => {
    if (!authToken) {
      setAuthModalOpen(true);
      addToast({
        type: 'warning',
        title: 'Sign In Required',
        message: 'Sign in to submit and track support tickets in your dashboard.'
      });
      return null;
    }
    try {
      const res = await fetch('/api/platform/tickets', {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ category, subject, message })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit ticket');
      await fetchUserAssets();
      addToast({
        type: 'success',
        title: 'Ticket Created',
        message: `Reference ${data.ticket.ticketNumber} assigned to DEEPSEEK engineering support.`
      });
      return data.ticket as SupportTicket;
    } catch (err: any) {
      addToast({ type: 'error', title: 'Ticket Error', message: err.message });
      return null;
    }
  };

  const downloadLicenseBundle = async (licenseId: string, filenameHint: string) => {
    try {
      const res = await fetch(`/api/platform/licenses/${licenseId}/bundle`, {
        headers: authHeaders()
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Unable to download license bundle');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DEEPSEEK-${filenameHint}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      addToast({
        type: 'success',
        title: 'Package Manifest Downloaded',
        message: 'Verified license manifest and installation commands saved.'
      });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Download Failed', message: err.message });
    }
  };

  // Admin actions
  const updateOrderStatus = async (orderNumber: string, status: OrderStatus, note?: string) => {
    try {
      const res = await fetch(`/api/orders/${orderNumber}/status`, {
        method: 'PATCH',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ status, note })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Status update rejected');
      await Promise.all([fetchOrders(), fetchUserAssets(), fetchAdminData()]);
      addToast({ type: 'info', title: `Order ${orderNumber}`, message: `Transitioned to ${status}` });
      return true;
    } catch (err: any) {
      addToast({ type: 'error', title: 'Update Failed', message: err.message });
      return false;
    }
  };

  const recheckOrderTx = async (orderNumber: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderNumber}/recheck-tx`, {
        method: 'POST',
        headers: authHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Recheck failed');
      await Promise.all([fetchOrders(), fetchAdminData()]);
      addToast({
        type: 'info',
        title: 'On-Chain Verification Complete',
        message: data.verification?.message
      });
      return true;
    } catch (err: any) {
      addToast({ type: 'error', title: 'Recheck Failed', message: err.message });
      return false;
    }
  };

  const saveProduct = async (productData: Partial<Product>) => {
    try {
      const isEdit = !!productData.id;
      const res = await fetch(isEdit ? `/api/products/${productData.id}` : '/api/products', {
        method: isEdit ? 'PUT' : 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(productData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save product');
      await Promise.all([fetchProducts(), fetchAdminData()]);
      addToast({
        type: 'success',
        title: isEdit ? 'Product Updated' : 'Product Added',
        message: data.product?.name
      });
      return true;
    } catch (err: any) {
      addToast({ type: 'error', title: 'Save Failed', message: err.message });
      return false;
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      if (!res.ok) throw new Error('Delete failed');
      await Promise.all([fetchProducts(), fetchAdminData()]);
      addToast({ type: 'warning', title: 'Product Removed', message: 'Catalog updated.' });
      return true;
    } catch (err: any) {
      addToast({ type: 'error', title: 'Delete Failed', message: err.message });
      return false;
    }
  };

  const renameCategory = async (oldCategory: string, newCategory: string) => {
    try {
      const res = await fetch('/api/admin/categories/rename', {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ oldCategory, newCategory })
      });
      if (!res.ok) throw new Error('Category update failed');
      await Promise.all([fetchProducts(), fetchAdminData()]);
      addToast({ type: 'success', title: 'Category Updated', message: `${oldCategory} -> ${newCategory}` });
      return true;
    } catch (err: any) {
      addToast({ type: 'error', title: 'Rename Failed', message: err.message });
      return false;
    }
  };

  const toggleLicenseStatus = async (licenseId: string) => {
    try {
      const res = await fetch(`/api/admin/licenses/${licenseId}/toggle`, {
        method: 'PATCH',
        headers: authHeaders()
      });
      if (!res.ok) throw new Error('Update failed');
      await fetchAdminData();
      return true;
    } catch {
      return false;
    }
  };

  const createDiscount = async (data: {
    code: string;
    type: 'percent' | 'fixed';
    value: number;
    maxUses: number;
    description: string;
  }) => {
    try {
      const res = await fetch('/api/admin/discounts', {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to create promo code');
      await fetchAdminData();
      addToast({ type: 'success', title: 'Discount Created', message: data.code.toUpperCase() });
      return true;
    } catch (err: any) {
      addToast({ type: 'error', title: 'Discount Error', message: err.message });
      return false;
    }
  };

  const toggleDiscount = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/discounts/${id}/toggle`, {
        method: 'PATCH',
        headers: authHeaders()
      });
      if (!res.ok) return false;
      await fetchAdminData();
      return true;
    } catch {
      return false;
    }
  };

  const deleteDiscount = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/discounts/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      if (!res.ok) return false;
      await fetchAdminData();
      return true;
    } catch {
      return false;
    }
  };

  const replyAdminTicket = async (
    ticketId: string,
    message: string,
    status?: SupportTicket['status']
  ) => {
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ message, status })
      });
      if (!res.ok) return false;
      await Promise.all([fetchAdminData(), fetchUserAssets()]);
      addToast({ type: 'success', title: 'Ticket Updated', message: 'Response sent to customer.' });
      return true;
    } catch {
      return false;
    }
  };

  const updateTicketStatus = async (ticketId: string, status: SupportTicket['status']) => {
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ status })
      });
      if (!res.ok) return false;
      await Promise.all([fetchAdminData(), fetchUserAssets()]);
      addToast({ type: 'info', title: 'Ticket Status Updated', message: `Marked as ${status}` });
      return true;
    } catch {
      return false;
    }
  };

  const deleteAdminOrder = async (orderNumber: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderNumber}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      if (!res.ok) throw new Error('Order deletion failed');
      await Promise.all([fetchOrders(), fetchAdminData()]);
      addToast({ type: 'warning', title: 'Order Deleted', message: `${orderNumber} removed.` });
      return true;
    } catch (err: any) {
      addToast({ type: 'error', title: 'Delete Failed', message: err.message });
      return false;
    }
  };

  const updateAdminSettings = async (updates: Partial<SiteSettings>) => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Settings update failed');
      await Promise.all([fetchAdminData(), fetchPlatformMeta()]);
      addToast({ type: 'success', title: 'Site Settings Saved', message: 'Configuration updated.' });
      return true;
    } catch (err: any) {
      addToast({ type: 'error', title: 'Settings Error', message: err.message });
      return false;
    }
  };

  return (
    <MarketContext.Provider
      value={{
        activeTab,
        setActiveTab,
        activeLegalDoc,
        openLegalDoc,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        siteSettings,
        paymentConfig,
        fetchPlatformMeta,
        products,
        categories,
        isLoadingProducts,
        selectedProduct,
        setSelectedProduct,
        openProductDetails,
        fetchProducts,
        wishlist,
        toggleWishlist,
        isInWishlist,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        cartTotal,
        cartItemCount,
        validateDiscountCode,
        orders,
        isLoadingOrders,
        activeOrderNumber,
        setActiveOrderNumber,
        fetchOrders,
        createOrder,
        submitTxVerification,
        uploadPaymentProof,
        updateOrderStatus,
        licenses,
        tickets,
        fetchUserAssets,
        submitSupportTicket,
        downloadLicenseBundle,
        authToken,
        currentUser,
        userRole,
        authModalOpen,
        setAuthModalOpen,
        login,
        register,
        logout,
        getAdminAuthStatus,
        adminLogin,
        claimAdmin,
        userPreferences,
        updateUserPreferences,
        notifications,
        unreadNotificationCount,
        markNotificationRead,
        markAllNotificationsRead,
        recentActivity,
        recordActivity,
        adminStats,
        activityLogs,
        adminUsers,
        adminLicenses,
        adminDiscounts,
        adminTickets,
        adminSettings,
        fetchAdminData,
        saveProduct,
        deleteProduct,
        renameCategory,
        recheckOrderTx,
        toggleLicenseStatus,
        createDiscount,
        toggleDiscount,
        deleteDiscount,
        replyAdminTicket,
        updateTicketStatus,
        deleteAdminOrder,
        updateAdminSettings,
        toasts,
        addToast,
        removeToast
      }}
    >
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error('useMarket must be used within a MarketProvider');
  }
  return context;
};
