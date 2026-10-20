import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Product, Order, User, CartItem, OrderStatus, AdminStats, ActivityLog } from '../types';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface MarketContextType {
  // Navigation & view
  activeTab: 'home' | 'marketplace' | 'orders' | 'admin' | 'support' | 'checkout';
  setActiveTab: (tab: 'home' | 'marketplace' | 'orders' | 'admin' | 'support' | 'checkout') => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Products
  products: Product[];
  categories: string[];
  isLoadingProducts: boolean;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  fetchProducts: () => Promise<void>;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cartTotal: number;
  cartItemCount: number;

  // Orders
  orders: Order[];
  isLoadingOrders: boolean;
  activeOrderNumber: string | null;
  setActiveOrderNumber: (orderNumber: string | null) => void;
  fetchOrders: () => Promise<void>;
  createOrder: (items: CartItem[]) => Promise<Order | null>;
  uploadPaymentProof: (orderNumber: string, file: { fileName: string; fileSize: number; fileType: string; fileData: string }) => Promise<Order | null>;
  updateOrderStatus: (orderNumber: string, status: OrderStatus, note?: string) => Promise<boolean>;

  // User & Auth
  currentUser: User | null;
  userRole: 'user' | 'admin';
  switchUserRole: (role: 'user' | 'admin') => Promise<void>;

  // Admin
  adminStats: AdminStats | null;
  activityLogs: ActivityLog[];
  fetchAdminData: () => Promise<void>;
  saveProduct: (productData: Partial<Product>) => Promise<boolean>;
  deleteProduct: (productId: string) => Promise<boolean>;

  // Toasts
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const MarketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'marketplace' | 'orders' | 'admin' | 'support' | 'checkout'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('dwm_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(false);
  const [activeOrderNumber, setActiveOrderNumber] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<User | null>({
    id: 'user-agent-01',
    username: 'dev_lead',
    email: 'developer@cyberplaces.io',
    role: 'user',
    reputation: 99.8,
    createdAt: new Date().toISOString()
  });
  const [userRole, setUserRole] = useState<'user' | 'admin'>('user');

  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

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

  // Save cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('dwm_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Could not persist cart', e);
    }
  }, [cart]);

  // Fetch Products
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoadingProducts(true);
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
        const uniqueCats = ['All Categories', ...Array.from(new Set(data.products.map((p: Product) => p.category))) as string[]];
        setCategories(uniqueCats);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      addToast({
        type: 'error',
        title: 'Connection Error',
        message: 'Could not communicate with marketplace server.'
      });
    } finally {
      setIsLoadingProducts(false);
    }
  }, [addToast]);

  // Fetch Orders
  const fetchOrders = useCallback(async () => {
    try {
      setIsLoadingOrders(true);
      const userId = currentUser?.id || 'user-agent-01';
      const headers: Record<string, string> = {
        'x-user-id': userId,
        'x-user-role': userRole
      };
      const res = await fetch(`/api/orders?userId=${encodeURIComponent(userId)}&role=${encodeURIComponent(userRole)}`, { headers });
      if (!res.ok) {
        throw new Error(`Server status ${res.status}`);
      }
      const data = await res.json();
      if (data && Array.isArray(data.orders)) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.warn('Network issue fetching orders:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  }, [currentUser?.id, userRole]);

  // Fetch Admin Data
  const fetchAdminData = useCallback(async () => {
    try {
      const headers: Record<string, string> = {
        'x-user-id': 'user-admin-01',
        'x-user-role': 'admin'
      };
      const [statsRes, logsRes] = await Promise.allSettled([
        fetch('/api/admin/stats?userId=user-admin-01&role=admin', { headers }),
        fetch('/api/admin/activity-logs?userId=user-admin-01&role=admin', { headers })
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
        const statsData = await statsRes.value.json();
        if (statsData.stats) setAdminStats(statsData.stats);
      }
      if (logsRes.status === 'fulfilled' && logsRes.value.ok) {
        const logsData = await logsRes.value.json();
        if (logsData.logs) setActivityLogs(logsData.logs);
      }
    } catch (err) {
      console.warn('Network issue fetching admin data:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, [fetchProducts, fetchOrders]);

  // Switch role between User and Admin
  const switchUserRole = async (targetRole: 'user' | 'admin') => {
    try {
      const res = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRole })
      });
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
        setUserRole(data.user.role);
        addToast({
          type: 'info',
          title: `Persona Switched: ${data.user.username.toUpperCase()}`,
          message: `Now accessing system as ${data.user.role === 'admin' ? 'Root Overseer (Admin)' : 'Cipher Agent (Buyer)'}`
        });
        if (targetRole === 'admin') {
          fetchAdminData();
        }
        fetchOrders();
      }
    } catch (err) {
      console.error('Failed to switch role:', err);
    }
  };

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
      message: `${product.name} (x${quantity}) added to your session.`
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

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Order creation
  const createOrder = async (items: CartItem[]): Promise<Order | null> => {
    try {
      const orderItems = items.map((i) => ({
        productId: i.product.id,
        name: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
        image: i.product.image,
        category: i.product.category
      }));

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || 'user-agent-01',
          'x-user-role': userRole
        },
        body: JSON.stringify({
          items: orderItems,
          amount: cartTotal,
          paymentMethod: 'USDT (TRC-20)',
          paymentAddress: 'TL9sU4A1ydN9AT2LTaC7P94K4y4BdAgDFx'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to initialize order');
      }

      clearCart();
      await fetchOrders();
      setActiveOrderNumber(data.order.orderNumber);
      addToast({
        type: 'success',
        title: 'Order Generated',
        message: `Reference ID: ${data.order.orderNumber}. Complete payment instructions.`
      });
      return data.order;
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Order Generation Failed',
        message: err.message || 'Network anomaly occurred.'
      });
      return null;
    }
  };

  // Upload Payment Proof
  const uploadPaymentProof = async (
    orderNumber: string,
    file: { fileName: string; fileSize: number; fileType: string; fileData: string }
  ): Promise<Order | null> => {
    try {
      const res = await fetch(`/api/orders/${orderNumber}/proof`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || 'user-agent-01',
          'x-user-role': userRole
        },
        body: JSON.stringify(file)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit payment proof');
      }

      await fetchOrders();
      addToast({
        type: 'success',
        title: 'Payment Proof Submitted Successfully',
        message: 'Order status updated to PENDING VERIFICATION.'
      });
      return data.order;
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Upload Rejected',
        message: err.message || 'File upload error.'
      });
      return null;
    }
  };

  // Update order status (Admin)
  const updateOrderStatus = async (orderNumber: string, status: OrderStatus, note?: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/orders/${orderNumber}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'user-admin-01',
          'x-user-role': 'admin'
        },
        body: JSON.stringify({ status, note })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update order status');
      }

      await fetchOrders();
      await fetchAdminData();
      addToast({
        type: 'info',
        title: `Order ${orderNumber} Status Updated`,
        message: `Current state: ${status}`
      });
      return true;
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Status Update Failed',
        message: err.message || 'Action rejected.'
      });
      return false;
    }
  };

  // Admin save product
  const saveProduct = async (productData: Partial<Product>): Promise<boolean> => {
    try {
      const isEdit = !!productData.id;
      const url = isEdit ? `/api/products/${productData.id}` : '/api/products';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'user-admin-01',
          'x-user-role': 'admin'
        },
        body: JSON.stringify(productData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save product');

      await fetchProducts();
      await fetchAdminData();
      addToast({
        type: 'success',
        title: isEdit ? 'Product Updated' : 'Product Created',
        message: `${data.product?.name || 'Item'} synchronized in catalog.`
      });
      return true;
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Save Product Failed',
        message: err.message
      });
      return false;
    }
  };

  // Admin delete product
  const deleteProduct = async (productId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': 'user-admin-01',
          'x-user-role': 'admin'
        }
      });

      if (!res.ok) throw new Error('Deletion rejected');

      await fetchProducts();
      await fetchAdminData();
      addToast({
        type: 'warning',
        title: 'Product Removed',
        message: 'Product archived from catalog.'
      });
      return true;
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: err.message
      });
      return false;
    }
  };

  return (
    <MarketContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        products,
        categories,
        isLoadingProducts,
        selectedProduct,
        setSelectedProduct,
        fetchProducts,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        cartTotal,
        cartItemCount,
        orders,
        isLoadingOrders,
        activeOrderNumber,
        setActiveOrderNumber,
        fetchOrders,
        createOrder,
        uploadPaymentProof,
        updateOrderStatus,
        currentUser,
        userRole,
        switchUserRole,
        adminStats,
        activityLogs,
        fetchAdminData,
        saveProduct,
        deleteProduct,
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
