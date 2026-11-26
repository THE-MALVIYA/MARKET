import React, { useState, useEffect, useMemo } from 'react';
import { useMarket } from '../context/MarketContext';
import { Order, OrderStatus, Product, SiteSettings, SupportTicket, User } from '../types';
import {
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Plus,
  Eye,
  Package,
  Layers,
  Terminal,
  X,
  Check,
  RefreshCw,
  KeyRound,
  Tag,
  Users,
  MessageSquare,
  Settings,
  LayoutGrid,
  Hash,
  Lock,
  Send,
  Search,
  Globe,
  MonitorSmartphone,
  Copy,
  AlertTriangle
} from 'lucide-react';

type AdminTabId =
  | 'overview'
  | 'orders'
  | 'transactions'
  | 'products'
  | 'categories'
  | 'customers'
  | 'licenses'
  | 'discounts'
  | 'tickets'
  | 'settings';

export const AdminDashboard: React.FC = () => {
  const {
    userRole,
    getAdminAuthStatus,
    adminLogin,
    claimAdmin,
    adminStats,
    activityLogs,
    adminUsers,
    adminLicenses,
    adminDiscounts,
    adminTickets,
    adminSettings,
    orders,
    products,
    fetchAdminData,
    fetchOrders,
    updateOrderStatus,
    deleteAdminOrder,
    recheckOrderTx,
    saveProduct,
    deleteProduct,
    renameCategory,
    toggleLicenseStatus,
    createDiscount,
    toggleDiscount,
    deleteDiscount,
    replyAdminTicket,
    updateTicketStatus,
    updateAdminSettings,
    addToast
  } = useMarket();

  const [authStatus, setAuthStatus] = useState<{
    envConfigured: boolean;
    claimed: boolean;
    setupRequired: boolean;
  } | null>(null);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTabId>('overview');
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<Order | null>(null);
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState<User | null>(null);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [deleteProductTarget, setDeleteProductTarget] = useState<Product | null>(null);
  const [deleteOrderTarget, setDeleteOrderTarget] = useState<Order | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>('');

  // Search & filters
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');
  const [customerSearch, setCustomerSearch] = useState('');

  // Category rename
  const [renamingCategory, setRenamingCategory] = useState<{ oldName: string; newName: string } | null>(null);

  // New discount form
  const [newDiscount, setNewDiscount] = useState({
    code: '',
    type: 'percent' as 'percent' | 'fixed',
    value: 10,
    maxUses: 100,
    description: ''
  });

  // Ticket reply state
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [ticketStatuses, setTicketStatuses] = useState<Record<string, SupportTicket['status']>>({});
  const [sendingTicketId, setSendingTicketId] = useState<string | null>(null);

  // Settings draft
  const [settingsDraft, setSettingsDraft] = useState<Partial<SiteSettings>>({});
  const [savingSettings, setSavingSettings] = useState(false);

  const syncAll = async () => {
    setIsSyncing(true);
    await Promise.all([fetchAdminData(), fetchOrders()]);
    setLastSyncedAt(new Date().toLocaleTimeString());
    setIsSyncing(false);
  };

  useEffect(() => {
    if (userRole !== 'admin') {
      getAdminAuthStatus()
        .then(setAuthStatus)
        .catch(() => setAuthStatus({ envConfigured: false, claimed: true, setupRequired: false }));
      return;
    }

    syncAll();
    const intervalId = window.setInterval(() => {
      fetchAdminData();
      fetchOrders();
      setLastSyncedAt(new Date().toLocaleTimeString());
    }, 6000);

    return () => window.clearInterval(intervalId);
  }, [userRole, getAdminAuthStatus, fetchAdminData, fetchOrders]);

  useEffect(() => {
    if (adminSettings) {
      setSettingsDraft(adminSettings);
    }
  }, [adminSettings]);

  const handleAdminAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    const result = authStatus?.setupRequired
      ? await claimAdmin(passcodeInput)
      : await adminLogin(passcodeInput);
    setAuthLoading(false);
    if (!result.ok) {
      setAuthError(result.message || 'Authentication rejected.');
    } else {
      setPasscodeInput('');
    }
  };

  const categoryCounts = useMemo(
    () =>
      Array.from(new Set(products.map((p) => p.category))).map((cat) => ({
        name: cat,
        count: products.filter((p) => p.category === cat).length,
        avgPrice: Math.round(
          products.filter((p) => p.category === cat).reduce((s, p) => s + p.price, 0) /
            Math.max(1, products.filter((p) => p.category === cat).length)
        )
      })),
    [products]
  );

  const filteredOrders = useMemo(() => {
    const q = orderSearch.trim().toLowerCase();
    return orders.filter((o) => {
      if (orderStatusFilter !== 'ALL' && o.status !== orderStatusFilter) return false;
      if (!q) return true;
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.userEmail.toLowerCase().includes(q) ||
        (o.buyerName || '').toLowerCase().includes(q) ||
        (o.buyerIp || '').toLowerCase().includes(q) ||
        (o.txHash || '').toLowerCase().includes(q) ||
        o.items.some((i) => i.name.toLowerCase().includes(q))
      );
    });
  }, [orders, orderSearch, orderStatusFilter]);

  const customerAccounts = useMemo(() => {
    const q = customerSearch.trim().toLowerCase();
    return adminUsers.filter((u) => {
      if (!q) return true;
      return (
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.organization || '').toLowerCase().includes(q) ||
        (u.lastIp || '').toLowerCase().includes(q) ||
        (u.lastDevice || '').toLowerCase().includes(q)
      );
    });
  }, [adminUsers, customerSearch]);

  if (userRole !== 'admin') {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="p-7 rounded-2xl dsk-surface space-y-5">
          <div className="flex items-center gap-3">
            <div className="dsk-icon-3d w-10 h-10 rounded-xl flex items-center justify-center text-[#00D69A]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#00D69A] block">
                Restricted Management Access
              </span>
              <h1 className="text-xl font-extrabold text-white">
                {authStatus?.setupRequired
                  ? 'Initialize Administrator Passcode'
                  : 'DEEPSEEK Admin Authentication'}
              </h1>
            </div>
          </div>

          <p className="text-xs text-[#CBD5E1] leading-relaxed">
            {authStatus?.setupRequired
              ? 'No administrator credential is configured yet. Set an administrator passcode to unlock and manage the DEEPSEEK console.'
              : 'Enter the verified administrator passcode to unlock live customer telemetry, order verification, license management, and catalog controls.'}
          </p>

          {authError && (
            <div className="p-3 rounded-lg bg-red-950/60 border border-red-700/70 text-xs text-red-200">
              {authError}
            </div>
          )}

          <form onSubmit={handleAdminAuthSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#CBD5E1] font-medium mb-1.5">
                Administrator Passcode
              </label>
              <input
                type="password"
                required
                minLength={authStatus?.setupRequired ? 8 : 1}
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                placeholder="Enter administrator passcode"
                className="w-full rounded-lg dsk-input-3d px-3.5 py-2.5 text-white placeholder-[#94A3B8] focus:border-[#00D69A] focus:outline-none font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-2.5 px-4 rounded-lg dsk-btn-3d cursor-pointer disabled:opacity-50"
            >
              {authLoading
                ? 'Verifying Passcode...'
                : authStatus?.setupRequired
                ? 'Initialize Admin Console'
                : 'Unlock Admin Console'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const handleStatusChange = async (orderNumber: string, newStatus: OrderStatus) => {
    setUpdatingOrderId(orderNumber);
    await updateOrderStatus(orderNumber, newStatus, `Admin transition to ${newStatus}`);
    setUpdatingOrderId(null);
    if (selectedOrderDetail?.orderNumber === orderNumber) {
      const updated = orders.find((o) => o.orderNumber === orderNumber);
      setSelectedOrderDetail(updated ? { ...updated, status: newStatus } : null);
    }
  };

  const handleRecheck = async (orderNumber: string) => {
    setUpdatingOrderId(orderNumber);
    await recheckOrderTx(orderNumber);
    setUpdatingOrderId(null);
  };

  const handleSaveProductForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name || !editingProduct.price) return;
    const ok = await saveProduct(editingProduct);
    if (ok) {
      setEditingProduct(null);
      setIsCreatingProduct(false);
    }
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renamingCategory || !renamingCategory.newName.trim()) return;
    const ok = await renameCategory(renamingCategory.oldName, renamingCategory.newName.trim());
    if (ok) setRenamingCategory(null);
  };

  const handleCreateDiscountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiscount.code.trim()) return;
    const ok = await createDiscount(newDiscount);
    if (ok) {
      setNewDiscount({ code: '', type: 'percent', value: 10, maxUses: 100, description: '' });
    }
  };

  const handleSaveSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    await updateAdminSettings(settingsDraft);
    setSavingSettings(false);
  };

  const ordersWithTx = orders.filter((o) => !!o.txHash);
  const nonAdminUsersCount = adminUsers.filter((u) => u.role !== 'admin').length;

  const navTabs: {
    id: AdminTabId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'orders', label: 'Orders', icon: Package, badge: orders.length },
    { id: 'customers', label: 'Customers', icon: Users, badge: nonAdminUsersCount },
    { id: 'transactions', label: 'Transactions', icon: Hash, badge: ordersWithTx.length },
    { id: 'products', label: 'Products', icon: Layers, badge: products.length },
    { id: 'categories', label: 'Categories', icon: Tag, badge: categoryCounts.length },
    { id: 'licenses', label: 'Licenses', icon: KeyRound, badge: adminLicenses.length },
    { id: 'discounts', label: 'Discounts', icon: Tag, badge: adminDiscounts.length },
    { id: 'tickets', label: 'Tickets', icon: MessageSquare, badge: adminTickets.length },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const copyText = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    addToast({ type: 'info', title: `${label} Copied`, message: value });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-[#253445]">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              DEEPSEEK Operations Console
            </h1>
            <span className="px-2.5 py-0.5 rounded bg-[#00D69A]/15 border border-[#00D69A]/45 text-[#00D69A] font-mono text-[11px] font-semibold flex items-center gap-1">
              <Check className="w-3 h-3" />
              ADMIN SESSION
            </span>
            <span className="px-2.5 py-0.5 rounded bg-[#0C131D] border border-[#253445] text-[#CBD5E1] font-mono text-[10px]">
              AUTO-SYNC 6S {lastSyncedAt ? `· ${lastSyncedAt}` : ''}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#CBD5E1] mt-1">
            Real-time cross-device customers, purchases, TXID ledger reconciliation, licenses, catalog control, and platform settings.
          </p>
        </div>

        <button
          onClick={syncAll}
          disabled={isSyncing}
          className="px-4 py-2 rounded-lg dsk-btn-secondary-3d text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#00D69A] ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : 'Sync Telemetry'}</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1.5 pb-3 border-b border-[#253445] text-xs">
        {navTabs.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-2 rounded-lg flex items-center gap-1.5 font-medium cursor-pointer ${
                active
                  ? 'dsk-btn-3d'
                  : 'dsk-btn-secondary-3d text-[#CBD5E1] hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
              {typeof t.badge === 'number' && (
                <span className="text-[10px] font-mono opacity-85 tabular-nums">({t.badge})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-xl dsk-surface">
              <span className="text-[11px] font-mono text-[#CBD5E1] uppercase block mb-1">
                Confirmed Volume
              </span>
              <div className="text-2xl font-mono font-bold text-[#00D69A] tabular-nums">
                {(adminStats?.totalVolumeUSDT ?? 0).toLocaleString()} <span className="text-xs">USDT</span>
              </div>
              <span className="text-[11px] text-[#CBD5E1]">Settled TRC-20 Revenue</span>
            </div>

            <div className="p-4 rounded-xl dsk-surface">
              <span className="text-[11px] font-mono text-[#CBD5E1] uppercase block mb-1">
                Total Orders
              </span>
              <div className="text-2xl font-mono font-bold text-white tabular-nums">
                {adminStats?.totalOrders ?? orders.length}
              </div>
              <span className="text-[11px] text-[#E5B84B]">
                {adminStats?.pendingVerification ?? 0} pending · {adminStats?.approvedOrders ?? 0} confirmed
              </span>
            </div>

            <div className="p-4 rounded-xl dsk-surface">
              <span className="text-[11px] font-mono text-[#CBD5E1] uppercase block mb-1">
                Registered Users
              </span>
              <div className="text-2xl font-mono font-bold text-[#38BDF8] tabular-nums">
                {nonAdminUsersCount}
              </div>
              <span className="text-[11px] text-[#CBD5E1]">Cross-Device Accounts</span>
            </div>

            <div className="p-4 rounded-xl dsk-surface">
              <span className="text-[11px] font-mono text-[#CBD5E1] uppercase block mb-1">
                Active Licenses
              </span>
              <div className="text-2xl font-mono font-bold text-[#00D69A] tabular-nums">
                {adminStats?.activeLicenses ?? adminLicenses.filter((l) => l.status === 'Active').length}
              </div>
              <span className="text-[11px] text-[#CBD5E1]">Issued Cryptographic Keys</span>
            </div>

            <div className="p-4 rounded-xl dsk-surface">
              <span className="text-[11px] font-mono text-[#CBD5E1] uppercase block mb-1">
                Catalog &amp; Tickets
              </span>
              <div className="text-2xl font-mono font-bold text-white tabular-nums">
                {products.length} <span className="text-xs text-[#CBD5E1]">suites</span>
              </div>
              <span className="text-[11px] text-[#E5B84B]">
                {adminStats?.openTickets ?? 0} open support tickets
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Buyers / Cross-Device Purchases */}
            <div className="p-5 rounded-2xl dsk-surface space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-[#253445]">
                <h3 className="text-xs font-mono font-bold text-[#00D69A] uppercase flex items-center gap-1.5">
                  <Package className="w-4 h-4" />
                  <span>Latest Cross-Device Purchases</span>
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-[11px] font-mono text-[#CBD5E1] hover:text-[#00D69A] cursor-pointer"
                >
                  View All &rarr;
                </button>
              </div>
              {orders.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#CBD5E1] dsk-panel-3d rounded-xl">
                  No orders yet. Any purchase from any device will appear here automatically.
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {orders.slice(0, 6).map((o) => (
                    <button
                      key={o.id}
                      onClick={() => setSelectedOrderDetail(o)}
                      className="w-full text-left p-3 rounded-xl dsk-panel-3d hover:border-[#00D69A]/50 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">
                          {o.orderNumber} · {o.buyerName || o.userEmail}
                        </div>
                        <div className="text-[10px] font-mono text-[#CBD5E1] truncate mt-0.5">
                          {o.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                        </div>
                        <div className="text-[10px] font-mono text-[#94A3B8] mt-0.5">
                          {o.buyerDevice || 'Web'} · {o.buyerIp || 'IP logged'} · {o.buyerLocation || 'Global'}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono text-xs font-bold text-[#00D69A] tabular-nums">
                          {o.amount.toLocaleString()} USDT
                        </div>
                        <div className="text-[10px] font-mono text-[#E5B84B]">{o.status}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Signups / Customers */}
            <div className="p-5 rounded-2xl dsk-surface space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-[#253445]">
                <h3 className="text-xs font-mono font-bold text-[#38BDF8] uppercase flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>Latest Registered Users</span>
                </h3>
                <button
                  onClick={() => setActiveTab('customers')}
                  className="text-[11px] font-mono text-[#CBD5E1] hover:text-[#00D69A] cursor-pointer"
                >
                  View All &rarr;
                </button>
              </div>
              {adminUsers.filter((u) => u.role !== 'admin').length === 0 ? (
                <div className="p-6 text-center text-xs text-[#CBD5E1] dsk-panel-3d rounded-xl">
                  No registered customer accounts yet. New user signups will sync here live.
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {adminUsers
                    .filter((u) => u.role !== 'admin')
                    .slice(0, 6)
                    .map((u) => (
                      <button
                        key={u.id}
                        onClick={() => setSelectedCustomerDetail(u)}
                        className="w-full text-left p-3 rounded-xl dsk-panel-3d hover:border-[#38BDF8]/50 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">
                            {u.username} <span className="font-mono font-normal text-[#CBD5E1]">({u.email})</span>
                          </div>
                          <div className="text-[10px] font-mono text-[#94A3B8] mt-0.5 truncate">
                            {u.lastDevice || 'Device captured on activity'} · {u.lastIp || '—'} ·{' '}
                            {u.lastLocation || 'Global'}
                          </div>
                        </div>
                        <div className="text-right shrink-0 font-mono">
                          <div className="text-xs font-bold text-[#00D69A] tabular-nums">
                            {u.orderCount ?? 0} Orders
                          </div>
                          <div className="text-[10px] text-[#CBD5E1] tabular-nums">
                            {(u.totalSpentUSDT ?? 0).toLocaleString()} USDT
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>

          <div className="p-5 rounded-2xl dsk-surface font-mono">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#253445] text-xs">
              <span className="flex items-center gap-1.5 text-[#00D69A] font-bold">
                <Terminal className="w-4 h-4" />
                <span>SYSTEM AUDIT TRAIL (ALL DEVICES)</span>
              </span>
              <span className="text-[#CBD5E1] tabular-nums">{activityLogs.length} EVENTS</span>
            </div>

            <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1 text-xs">
              {activityLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-lg dsk-panel-3d flex flex-wrap items-center justify-between gap-3 text-[11px]"
                >
                  <div className="flex items-start gap-2 min-w-0">
                    <span className="text-[#00D69A] font-bold shrink-0">[{log.category}]</span>
                    <span className="text-[#CBD5E1] font-semibold shrink-0">{log.action}:</span>
                    <span className="text-white break-words">{log.details}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0 text-[#CBD5E1] text-[10px] tabular-nums">
                    {log.device && <span className="text-[#38BDF8]">{log.device}</span>}
                    {log.ip && <span>{log.ip}</span>}
                    <span>{log.actor}</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl dsk-surface flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between text-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search by Order Ref, Customer Email, Product, IP, or TXID..."
                className="w-full rounded-lg dsk-input-3d pl-9 pr-3 py-2 text-white placeholder-[#94A3B8] focus:border-[#00D69A] focus:outline-none"
              />
            </div>

            <select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
              className="rounded-lg dsk-input-3d px-3 py-2 text-white focus:border-[#00D69A] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Order Statuses ({orders.length})</option>
              <option value="Awaiting Payment">Awaiting Payment</option>
              <option value="Payment Detected">Payment Detected</option>
              <option value="Confirming on Blockchain">Confirming on Blockchain</option>
              <option value="Payment Confirmed">Payment Confirmed</option>
              <option value="Payment Failed">Payment Failed</option>
              <option value="Payment Expired">Payment Expired</option>
            </select>
          </div>

          <div className="overflow-x-auto rounded-2xl dsk-surface">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#070B11] text-[#CBD5E1] border-b border-[#253445]">
                <tr>
                  <th className="p-3.5">Order Ref</th>
                  <th className="p-3.5">Buyer &amp; Device</th>
                  <th className="p-3.5">Items</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2936]">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-[#CBD5E1]">
                      No orders match the current view. Orders placed from any device appear here live.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#0D131D]/70 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-[#00D69A]">{order.orderNumber}</div>
                        <div className="text-[10px] text-[#94A3B8]">
                          {new Date(order.createdAt).toLocaleString()}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="text-white font-semibold">
                          {order.buyerName || 'Customer'}
                        </div>
                        <div className="text-[11px] text-[#CBD5E1]">{order.userEmail}</div>
                        <div className="text-[10px] text-[#38BDF8] mt-0.5">
                          {order.buyerDevice || 'Web'} · {order.buyerIp || 'IP logged'}
                        </div>
                      </td>
                      <td className="p-3.5 max-w-[200px]">
                        <div className="text-white truncate">
                          {order.items.map((i) => `${i.name} x${i.quantity}`).join(', ')}
                        </div>
                        {order.txHash && (
                          <div className="text-[10px] text-[#00D69A] truncate" title={order.txHash}>
                            TX: {order.txHash.slice(0, 14)}...
                          </div>
                        )}
                      </td>
                      <td className="p-3.5 font-bold text-white tabular-nums">
                        {order.amount.toLocaleString()} USDT
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border whitespace-nowrap ${
                            order.status === 'Payment Confirmed' ||
                            order.status === 'Approved' ||
                            order.status === 'Completed'
                              ? 'bg-[#00D69A]/15 text-[#00D69A] border-[#00D69A]/45'
                              : order.status === 'Payment Failed' ||
                                order.status === 'Payment Expired' ||
                                order.status === 'Rejected'
                              ? 'bg-red-950/60 text-red-300 border-red-700'
                              : 'bg-[#E5B84B]/15 text-[#E5B84B] border-[#E5B84B]/45'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            onClick={() => setSelectedOrderDetail(order)}
                            className="px-2.5 py-1 rounded dsk-btn-secondary-3d text-[#00D69A] flex items-center gap-1 cursor-pointer text-[10px] font-semibold"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Inspect</span>
                          </button>

                          {order.txHash && (
                            <button
                              onClick={() => handleRecheck(order.orderNumber)}
                              disabled={updatingOrderId === order.orderNumber}
                              className="px-2 py-1 rounded dsk-btn-secondary-3d text-[#38BDF8] text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>Recheck</span>
                            </button>
                          )}

                          <select
                            value={order.status}
                            disabled={updatingOrderId === order.orderNumber}
                            onChange={(e) =>
                              handleStatusChange(order.orderNumber, e.target.value as OrderStatus)
                            }
                            className="dsk-input-3d rounded px-2 py-1 text-white text-[10px] focus:outline-none focus:border-[#00D69A] cursor-pointer"
                          >
                            <option value="Awaiting Payment">Awaiting Payment</option>
                            <option value="Payment Detected">Payment Detected</option>
                            <option value="Confirming on Blockchain">Confirming on Blockchain</option>
                            <option value="Payment Confirmed">Payment Confirmed</option>
                            <option value="Payment Failed">Payment Failed</option>
                            <option value="Payment Expired">Payment Expired</option>
                          </select>

                          {order.status !== 'Payment Confirmed' && (
                            <button
                              onClick={() =>
                                handleStatusChange(order.orderNumber, 'Payment Confirmed')
                              }
                              disabled={updatingOrderId === order.orderNumber}
                              className="px-2.5 py-1 rounded dsk-btn-3d text-[10px] flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3 h-3" />
                              <span>Confirm</span>
                            </button>
                          )}

                          <button
                            onClick={() => setDeleteOrderTarget(order)}
                            className="p-1.5 rounded text-[#CBD5E1] hover:text-red-400 hover:bg-[#070B11] transition-colors cursor-pointer"
                            title="Delete Order"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: CUSTOMERS */}
      {activeTab === 'customers' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl dsk-surface flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between text-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Search customer by name, email, organization, IP, or device..."
                className="w-full rounded-lg dsk-input-3d pl-9 pr-3 py-2 text-white placeholder-[#94A3B8] focus:border-[#00D69A] focus:outline-none"
              />
            </div>
            <span className="font-mono text-[#00D69A]">
              {customerAccounts.length} Accounts Synced
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl dsk-surface">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#070B11] text-[#CBD5E1] border-b border-[#253445]">
                <tr>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Organization</th>
                  <th className="p-3.5">Orders / Spent</th>
                  <th className="p-3.5">Device &amp; IP / Region</th>
                  <th className="p-3.5">Registered / Active</th>
                  <th className="p-3.5">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2936]">
                {customerAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-[#CBD5E1]">
                      No registered users found yet. Every user who signs up or buys from any device appears here.
                    </td>
                  </tr>
                ) : (
                  customerAccounts.map((u) => (
                    <tr key={u.id} className="hover:bg-[#0D131D]/70 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{u.username}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] uppercase ${
                              u.role === 'admin'
                                ? 'bg-[#E5B84B]/15 text-[#E5B84B]'
                                : 'bg-[#00D69A]/15 text-[#00D69A]'
                            }`}
                          >
                            {u.role}
                          </span>
                        </div>
                        <div className="text-[#CBD5E1] text-[11px]">{u.email}</div>
                      </td>
                      <td className="p-3.5 text-[#CBD5E1]">{u.organization || '—'}</td>
                      <td className="p-3.5 tabular-nums">
                        <div className="text-white font-bold">{u.orderCount ?? 0} Orders</div>
                        <div className="text-[#00D69A] text-[11px]">
                          {(u.totalSpentUSDT ?? 0).toLocaleString()} USDT · {u.licenseCount ?? 0} Keys
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="text-[#38BDF8] text-[11px]">
                          {u.lastDevice || 'Web Client'}
                        </div>
                        <div className="text-[#CBD5E1] text-[10px]">
                          {u.lastIp || '—'} · {u.lastLocation || 'Global Web'}
                        </div>
                      </td>
                      <td className="p-3.5 text-[#CBD5E1] text-[11px] tabular-nums">
                        <div>Reg: {new Date(u.createdAt).toLocaleDateString()}</div>
                        <div className="text-[#94A3B8]">
                          Seen: {new Date(u.lastLoginAt || u.createdAt).toLocaleString()}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <button
                          onClick={() => setSelectedCustomerDetail(u)}
                          className="px-2.5 py-1 rounded dsk-btn-secondary-3d text-[#00D69A] flex items-center gap-1 cursor-pointer text-[10px] font-semibold"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Full Info</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: TRANSACTIONS LEDGER */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl dsk-surface flex items-center justify-between text-xs">
            <div>
              <h3 className="font-bold text-white">Blockchain TXID Verification Ledger</h3>
              <p className="text-[#CBD5E1] mt-0.5">
                Every submitted Tron TRC-20 transaction hash is checked for uniqueness across orders and queried against TronGrid.
              </p>
            </div>
            <span className="font-mono text-[#00D69A]">{ordersWithTx.length} Submitted Hashes</span>
          </div>

          <div className="overflow-x-auto rounded-2xl dsk-surface">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#070B11] text-[#CBD5E1] border-b border-[#253445]">
                <tr>
                  <th className="p-3.5">Order / Buyer</th>
                  <th className="p-3.5">TXID Hash</th>
                  <th className="p-3.5">Detected USDT</th>
                  <th className="p-3.5">Confirmations</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2936]">
                {ordersWithTx.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#CBD5E1]">
                      No blockchain transaction hashes submitted yet.
                    </td>
                  </tr>
                ) : (
                  ordersWithTx.map((o) => (
                    <tr key={o.id} className="hover:bg-[#0D131D]/70">
                      <td className="p-3.5">
                        <div className="text-[#00D69A] font-bold">{o.orderNumber}</div>
                        <div className="text-[#CBD5E1] text-[10px]">{o.userEmail}</div>
                      </td>
                      <td className="p-3.5 text-white break-all max-w-xs">{o.txHash}</td>
                      <td className="p-3.5 tabular-nums text-white">
                        {o.blockchainVerification?.detectedAmount ?? o.amount} USDT
                      </td>
                      <td className="p-3.5 tabular-nums text-[#38BDF8]">
                        {o.blockchainVerification?.confirmations ?? 0} /{' '}
                        {o.blockchainVerification?.requiredConfirmations ?? 19}
                      </td>
                      <td className="p-3.5 text-[#E5B84B]">{o.status}</td>
                      <td className="p-3.5">
                        <button
                          onClick={() => handleRecheck(o.orderNumber)}
                          disabled={updatingOrderId === o.orderNumber}
                          className="px-2.5 py-1 rounded dsk-btn-secondary-3d text-[#00D69A] text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw
                            className={`w-3 h-3 ${
                              updatingOrderId === o.orderNumber ? 'animate-spin' : ''
                            }`}
                          />
                          <span>Query TronGrid</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: PRODUCTS */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">
              Software Catalog ({products.length} Suites)
            </h3>
            <button
              onClick={() => {
                setEditingProduct({
                  name: '',
                  category: 'Security Infrastructure',
                  price: 499,
                  currency: 'USDT',
                  description: '',
                  features: ['Verified enterprise build'],
                  requirements: ['Linux / macOS / Windows x86_64 or ARM64'],
                  image: '/assets/sql_flash_module.jpg',
                  version: 'v1.0.0',
                  architecture: 'x86_64 / ARM64',
                  licenseType: 'Enterprise Perpetual',
                  featured: false
                });
                setIsCreatingProduct(true);
              }}
              className="px-4 py-2 rounded-lg dsk-btn-3d text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Software Suite</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl dsk-surface">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#070B11] text-[#CBD5E1] border-b border-[#253445]">
                <tr>
                  <th className="p-3.5">Product ID</th>
                  <th className="p-3.5">Name</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Price</th>
                  <th className="p-3.5">Version</th>
                  <th className="p-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2936]">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-[#0D131D]/70 transition-colors">
                    <td className="p-3.5 text-[#00D69A]">{prod.productCode || prod.id}</td>
                    <td className="p-3.5 font-bold text-white">{prod.name}</td>
                    <td className="p-3.5 text-[#CBD5E1]">{prod.category}</td>
                    <td className="p-3.5 text-white font-bold tabular-nums">
                      {prod.price.toLocaleString()} USDT
                    </td>
                    <td className="p-3.5 text-[#CBD5E1]">{prod.version || 'v2026.1'}</td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingProduct(prod);
                            setIsCreatingProduct(false);
                          }}
                          className="p-1.5 rounded text-[#CBD5E1] hover:text-[#00D69A] hover:bg-[#070B11] transition-colors cursor-pointer"
                          title="Edit product"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteProductTarget(prod)}
                          className="p-1.5 rounded text-[#CBD5E1] hover:text-red-400 hover:bg-[#070B11] transition-colors cursor-pointer"
                          title="Delete product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryCounts.map((cat) => (
            <div
              key={cat.name}
              className="p-5 rounded-2xl dsk-surface flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-[#00D69A] mb-1">
                  <span>{cat.count} SUITES</span>
                  <span className="text-[#CBD5E1]">Avg {cat.avgPrice.toLocaleString()} USDT</span>
                </div>
                <h3 className="text-sm font-bold text-white">{cat.name}</h3>
              </div>

              {renamingCategory?.oldName === cat.name ? (
                <form onSubmit={handleRenameSubmit} className="flex gap-2 text-xs">
                  <input
                    type="text"
                    required
                    value={renamingCategory.newName}
                    onChange={(e) =>
                      setRenamingCategory({ ...renamingCategory, newName: e.target.value })
                    }
                    className="flex-1 rounded-lg dsk-input-3d border-[#00D69A] px-2.5 py-1.5 text-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg dsk-btn-3d cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setRenamingCategory(null)}
                    className="px-2 py-1.5 rounded-lg dsk-btn-secondary-3d text-[#CBD5E1] cursor-pointer"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setRenamingCategory({ oldName: cat.name, newName: cat.name })}
                  className="px-3 py-1.5 rounded-lg dsk-btn-secondary-3d text-xs font-medium text-white cursor-pointer self-start"
                >
                  Rename Category
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB: LICENSES */}
      {activeTab === 'licenses' && (
        <div className="overflow-x-auto rounded-2xl dsk-surface">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#070B11] text-[#CBD5E1] border-b border-[#253445]">
              <tr>
                <th className="p-3.5">License Key</th>
                <th className="p-3.5">Product</th>
                <th className="p-3.5">Order</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2936]">
              {adminLicenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#CBD5E1]">
                    Licenses are issued automatically when orders transition to Payment Confirmed.
                  </td>
                </tr>
              ) : (
                adminLicenses.map((lic) => (
                  <tr key={lic.id} className="hover:bg-[#0D131D]/70">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[#00D69A] font-bold">{lic.licenseKey}</span>
                        <button
                          onClick={() => copyText(lic.licenseKey, 'License Key')}
                          className="text-[#94A3B8] hover:text-white cursor-pointer"
                          title="Copy License Key"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="p-3.5 text-white">{lic.productName}</td>
                    <td className="p-3.5 text-[#CBD5E1]">{lic.orderNumber}</td>
                    <td className="p-3.5 text-[#CBD5E1]">{lic.userEmail}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] ${
                          lic.status === 'Active'
                            ? 'bg-[#00D69A]/15 text-[#00D69A]'
                            : 'bg-red-950/60 text-red-300'
                        }`}
                      >
                        {lic.status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <button
                        onClick={() => toggleLicenseStatus(lic.id)}
                        className="px-2.5 py-1 rounded dsk-btn-secondary-3d text-[#E5B84B] text-[10px] cursor-pointer"
                      >
                        {lic.status === 'Active' ? 'Revoke' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB: DISCOUNTS */}
      {activeTab === 'discounts' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <form
            onSubmit={handleCreateDiscountSubmit}
            className="lg:col-span-4 p-5 rounded-2xl dsk-surface space-y-3 text-xs"
          >
            <h3 className="text-sm font-bold text-white">Create Promotional Code</h3>
            <div>
              <label className="text-[#CBD5E1] block mb-1">Code</label>
              <input
                type="text"
                required
                placeholder="e.g. ENTERPRISE15"
                value={newDiscount.code}
                onChange={(e) =>
                  setNewDiscount({ ...newDiscount, code: e.target.value.toUpperCase() })
                }
                className="w-full rounded-lg dsk-input-3d p-2.5 text-white font-mono uppercase focus:border-[#00D69A] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[#CBD5E1] block mb-1">Type</label>
                <select
                  value={newDiscount.type}
                  onChange={(e) =>
                    setNewDiscount({ ...newDiscount, type: e.target.value as 'percent' | 'fixed' })
                  }
                  className="w-full rounded-lg dsk-input-3d p-2.5 text-white focus:outline-none"
                >
                  <option value="percent">Percent (%)</option>
                  <option value="fixed">Fixed (USDT)</option>
                </select>
              </div>
              <div>
                <label className="text-[#CBD5E1] block mb-1">Value</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={newDiscount.value}
                  onChange={(e) =>
                    setNewDiscount({ ...newDiscount, value: Number(e.target.value) || 1 })
                  }
                  className="w-full rounded-lg dsk-input-3d p-2.5 text-[#00D69A] font-mono focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[#CBD5E1] block mb-1">Max Uses</label>
              <input
                type="number"
                min={1}
                required
                value={newDiscount.maxUses}
                onChange={(e) =>
                  setNewDiscount({ ...newDiscount, maxUses: Number(e.target.value) || 1 })
                }
                className="w-full rounded-lg dsk-input-3d p-2.5 text-white font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[#CBD5E1] block mb-1">Description</label>
              <input
                type="text"
                placeholder="Campaign description"
                value={newDiscount.description}
                onChange={(e) => setNewDiscount({ ...newDiscount, description: e.target.value })}
                className="w-full rounded-lg dsk-input-3d p-2.5 text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg dsk-btn-3d cursor-pointer"
            >
              Add Discount Code
            </button>
          </form>

          <div className="lg:col-span-8 overflow-x-auto rounded-2xl dsk-surface">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#070B11] text-[#CBD5E1] border-b border-[#253445]">
                <tr>
                  <th className="p-3.5">Code</th>
                  <th className="p-3.5">Discount</th>
                  <th className="p-3.5">Usage</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2936]">
                {adminDiscounts.map((d) => (
                  <tr key={d.id} className="hover:bg-[#0D131D]/70">
                    <td className="p-3.5 font-bold text-[#00D69A]">
                      <div>{d.code}</div>
                      <div className="text-[10px] text-[#CBD5E1] font-sans font-normal">
                        {d.description}
                      </div>
                    </td>
                    <td className="p-3.5 text-white tabular-nums">
                      {d.type === 'percent' ? `${d.value}%` : `${d.value} USDT`}
                    </td>
                    <td className="p-3.5 text-[#CBD5E1] tabular-nums">
                      {d.usedCount} / {d.maxUses}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] ${
                          d.active ? 'bg-[#00D69A]/15 text-[#00D69A]' : 'bg-[#070B11] text-[#CBD5E1]'
                        }`}
                      >
                        {d.active ? 'Active' : 'Paused'}
                      </span>
                    </td>
                    <td className="p-3.5 flex items-center gap-2">
                      <button
                        onClick={() => toggleDiscount(d.id)}
                        className="px-2 py-1 rounded dsk-btn-secondary-3d text-white text-[10px] cursor-pointer"
                      >
                        {d.active ? 'Pause' : 'Enable'}
                      </button>
                      <button
                        onClick={() => deleteDiscount(d.id)}
                        className="p-1.5 rounded text-[#CBD5E1] hover:text-red-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: SUPPORT TICKETS */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          {adminTickets.length === 0 ? (
            <div className="p-10 rounded-2xl dsk-surface text-center text-xs text-[#CBD5E1]">
              No customer support tickets opened yet.
            </div>
          ) : (
            adminTickets.map((tkt) => (
              <div
                key={tkt.id}
                className="p-5 rounded-2xl dsk-surface space-y-3 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#253445]">
                  <div>
                    <span className="font-mono text-[#00D69A] font-bold mr-2">
                      {tkt.ticketNumber}
                    </span>
                    <span className="font-bold text-white">{tkt.subject}</span>
                    <div className="text-[11px] text-[#CBD5E1] mt-0.5">
                      {tkt.userEmail} · {tkt.category} · {new Date(tkt.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <select
                    value={ticketStatuses[tkt.id] || tkt.status}
                    onChange={async (e) => {
                      const next = e.target.value as SupportTicket['status'];
                      setTicketStatuses({ ...ticketStatuses, [tkt.id]: next });
                      await updateTicketStatus(tkt.id, next);
                    }}
                    className="rounded-lg dsk-input-3d px-2.5 py-1 text-white cursor-pointer"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                <p className="text-white dsk-panel-3d p-3 rounded-lg">
                  {tkt.message}
                </p>

                {tkt.replies.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-3 rounded-lg dsk-panel-3d border-[#00D69A]/35 ml-4"
                  >
                    <div className="text-[10px] font-mono text-[#00D69A] mb-1">
                      {rep.author} ({rep.role}) · {new Date(rep.timestamp).toLocaleString()}
                    </div>
                    <div className="text-white">{rep.message}</div>
                  </div>
                ))}

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Write official support reply..."
                    value={replyDrafts[tkt.id] || ''}
                    onChange={(e) => setReplyDrafts({ ...replyDrafts, [tkt.id]: e.target.value })}
                    className="flex-1 rounded-lg dsk-input-3d px-3 py-2 text-white focus:border-[#00D69A] focus:outline-none"
                  />
                  <button
                    disabled={sendingTicketId === tkt.id}
                    onClick={async () => {
                      const msg = replyDrafts[tkt.id] || '';
                      if (!msg.trim()) return;
                      setSendingTicketId(tkt.id);
                      const ok = await replyAdminTicket(
                        tkt.id,
                        msg.trim(),
                        ticketStatuses[tkt.id] || tkt.status
                      );
                      setSendingTicketId(null);
                      if (ok) {
                        setReplyDrafts({ ...replyDrafts, [tkt.id]: '' });
                      }
                    }}
                    className="px-4 py-2 rounded-lg dsk-btn-3d flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{sendingTicketId === tkt.id ? 'Sending...' : 'Send Reply'}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB: WEBSITE & PAYMENT SETTINGS */}
      {activeTab === 'settings' && (
        <form
          onSubmit={handleSaveSettingsSubmit}
          className="max-w-3xl p-6 rounded-2xl dsk-surface space-y-4 text-xs"
        >
          <h3 className="text-base font-bold text-white pb-3 border-b border-[#253445]">
            Platform &amp; Settlement Configuration
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[#CBD5E1] block mb-1 font-medium">Support Email</label>
              <input
                type="email"
                value={settingsDraft.supportEmail || ''}
                onChange={(e) =>
                  setSettingsDraft({ ...settingsDraft, supportEmail: e.target.value })
                }
                className="w-full rounded-lg dsk-input-3d p-2.5 text-white focus:border-[#00D69A] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[#CBD5E1] block mb-1 font-medium">Dispatch Channel</label>
              <input
                type="text"
                value={settingsDraft.dispatchChannel || ''}
                onChange={(e) =>
                  setSettingsDraft({ ...settingsDraft, dispatchChannel: e.target.value })
                }
                className="w-full rounded-lg dsk-input-3d p-2.5 text-white font-mono focus:border-[#00D69A] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[#CBD5E1] block mb-1 font-medium">Platform Tagline</label>
            <input
              type="text"
              value={settingsDraft.tagline || ''}
              onChange={(e) => setSettingsDraft({ ...settingsDraft, tagline: e.target.value })}
              className="w-full rounded-lg dsk-input-3d p-2.5 text-white focus:border-[#00D69A] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[#CBD5E1] block mb-1 font-medium">Announcement Banner Text</label>
            <input
              type="text"
              value={settingsDraft.announcementText || ''}
              onChange={(e) =>
                setSettingsDraft({ ...settingsDraft, announcementText: e.target.value })
              }
              className="w-full rounded-lg dsk-input-3d p-2.5 text-white focus:border-[#00D69A] focus:outline-none"
            />
            <label className="inline-flex items-center gap-2 mt-2 text-white cursor-pointer">
              <input
                type="checkbox"
                checked={!!settingsDraft.announcementActive}
                onChange={(e) =>
                  setSettingsDraft({ ...settingsDraft, announcementActive: e.target.checked })
                }
                className="accent-[#00D69A]"
              />
              <span>Display top announcement bar across marketplace</span>
            </label>
          </div>

          <div className="pt-3 border-t border-[#253445] grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-[#CBD5E1] block mb-1 font-medium">
                USDT TRC-20 Receiving Wallet Address
              </label>
              <input
                type="text"
                value={settingsDraft.trc20ReceivingAddress || ''}
                onChange={(e) =>
                  setSettingsDraft({ ...settingsDraft, trc20ReceivingAddress: e.target.value })
                }
                className="w-full rounded-lg dsk-input-3d p-2.5 text-[#00D69A] font-mono focus:border-[#00D69A] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[#CBD5E1] block mb-1 font-medium">
                Required Block Confirmations
              </label>
              <input
                type="number"
                min={1}
                max={64}
                value={settingsDraft.requiredConfirmations ?? 19}
                onChange={(e) =>
                  setSettingsDraft({
                    ...settingsDraft,
                    requiredConfirmations: Number(e.target.value) || 19
                  })
                }
                className="w-full rounded-lg dsk-input-3d p-2.5 text-white font-mono focus:border-[#00D69A] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[#CBD5E1] block mb-1 font-medium">
                Checkout Window (Minutes)
              </label>
              <input
                type="number"
                min={10}
                max={240}
                value={settingsDraft.orderExpiryMinutes ?? 60}
                onChange={(e) =>
                  setSettingsDraft({
                    ...settingsDraft,
                    orderExpiryMinutes: Number(e.target.value) || 60
                  })
                }
                className="w-full rounded-lg dsk-input-3d p-2.5 text-white font-mono focus:border-[#00D69A] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={savingSettings}
            className="px-5 py-2.5 rounded-lg dsk-btn-3d cursor-pointer disabled:opacity-60"
          >
            {savingSettings ? 'Saving Configuration...' : 'Save Platform Settings'}
          </button>
        </form>
      )}

      {/* Edit/Create Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/86 flex items-center justify-center p-4">
          <div className="dsk-surface rounded-2xl max-w-lg w-full p-6 relative text-xs max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingProduct(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg dsk-btn-secondary-3d text-[#CBD5E1] hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-white mb-4">
              {isCreatingProduct ? 'Add Software Suite' : `Edit ${editingProduct.name}`}
            </h3>

            <form onSubmit={handleSaveProductForm} className="space-y-3">
              <div>
                <label className="text-[#CBD5E1] block mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full dsk-input-3d rounded-lg p-2.5 text-white focus:border-[#00D69A] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#CBD5E1] block mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.category || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, category: e.target.value })
                    }
                    className="w-full dsk-input-3d rounded-lg p-2.5 text-white focus:border-[#00D69A] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#CBD5E1] block mb-1">Price (USDT)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editingProduct.price || 0}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        price: parseFloat(e.target.value) || 0
                      })
                    }
                    className="w-full dsk-input-3d rounded-lg p-2.5 text-[#00D69A] font-mono font-bold focus:border-[#00D69A] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#CBD5E1] block mb-1">Product ID / Code</label>
                  <input
                    type="text"
                    value={editingProduct.productCode || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, productCode: e.target.value })
                    }
                    className="w-full dsk-input-3d rounded-lg p-2.5 text-white font-mono focus:border-[#00D69A] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#CBD5E1] block mb-1">Version</label>
                  <input
                    type="text"
                    value={editingProduct.version || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, version: e.target.value })
                    }
                    className="w-full dsk-input-3d rounded-lg p-2.5 text-white font-mono focus:border-[#00D69A] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#CBD5E1] block mb-1">Architecture</label>
                  <input
                    type="text"
                    value={editingProduct.architecture || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, architecture: e.target.value })
                    }
                    className="w-full dsk-input-3d rounded-lg p-2.5 text-white font-mono focus:border-[#00D69A] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#CBD5E1] block mb-1">License Type</label>
                  <input
                    type="text"
                    value={editingProduct.licenseType || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, licenseType: e.target.value })
                    }
                    className="w-full dsk-input-3d rounded-lg p-2.5 text-white focus:border-[#00D69A] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#CBD5E1] block mb-1">Image Path / URL</label>
                <input
                  type="text"
                  value={editingProduct.image || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                  className="w-full dsk-input-3d rounded-lg p-2.5 text-white font-mono focus:border-[#00D69A] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[#CBD5E1] block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, description: e.target.value })
                  }
                  className="w-full dsk-input-3d rounded-lg p-2.5 text-white focus:border-[#00D69A] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[#CBD5E1] block mb-1">Features (comma separated)</label>
                <input
                  type="text"
                  value={editingProduct.features ? editingProduct.features.join(', ') : ''}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      features: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean)
                    })
                  }
                  className="w-full dsk-input-3d rounded-lg p-2.5 text-white focus:border-[#00D69A] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={!!editingProduct.featured}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, featured: e.target.checked })
                  }
                  className="accent-[#00D69A]"
                />
                <label htmlFor="featured" className="text-white cursor-pointer">
                  Mark as Featured listing
                </label>
              </div>

              <div className="pt-3 border-t border-[#253445] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-lg dsk-btn-secondary-3d text-[#CBD5E1] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg dsk-btn-3d cursor-pointer"
                >
                  Save Suite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Product Confirmation Modal */}
      {deleteProductTarget && (
        <div className="fixed inset-0 z-50 bg-black/86 flex items-center justify-center p-4">
          <div className="dsk-surface rounded-2xl max-w-sm w-full p-6 text-xs space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-bold text-white">Delete Product Listing?</h3>
            </div>
            <p className="text-[#CBD5E1]">
              Are you sure you want to remove <strong className="text-white">{deleteProductTarget.name}</strong> from the catalog?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteProductTarget(null)}
                className="px-4 py-2 rounded-lg dsk-btn-secondary-3d text-[#CBD5E1] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const id = deleteProductTarget.id;
                  setDeleteProductTarget(null);
                  await deleteProduct(id);
                }}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold cursor-pointer"
              >
                Delete Listing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Order Confirmation Modal */}
      {deleteOrderTarget && (
        <div className="fixed inset-0 z-50 bg-black/86 flex items-center justify-center p-4">
          <div className="dsk-surface rounded-2xl max-w-sm w-full p-6 text-xs space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-bold text-white">Delete Order Record?</h3>
            </div>
            <p className="text-[#CBD5E1]">
              Remove order <strong className="text-[#00D69A] font-mono">{deleteOrderTarget.orderNumber}</strong> ({deleteOrderTarget.userEmail})?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteOrderTarget(null)}
                className="px-4 py-2 rounded-lg dsk-btn-secondary-3d text-[#CBD5E1] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const num = deleteOrderTarget.orderNumber;
                  setDeleteOrderTarget(null);
                  if (selectedOrderDetail?.orderNumber === num) setSelectedOrderDetail(null);
                  await deleteAdminOrder(num);
                }}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold cursor-pointer"
              >
                Delete Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Verification & Buyer Telemetry Detail Modal */}
      {selectedOrderDetail && (
        <div className="fixed inset-0 z-50 bg-black/86 flex items-center justify-center p-4">
          <div className="dsk-surface rounded-2xl max-w-2xl w-full p-6 relative text-xs max-h-[90vh] overflow-y-auto space-y-4">
            <button
              onClick={() => setSelectedOrderDetail(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg dsk-btn-secondary-3d text-[#CBD5E1] hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="text-[10px] font-mono text-[#00D69A] uppercase">
                Cross-Device Order Inspector
              </span>
              <h3 className="text-lg font-extrabold text-white">
                {selectedOrderDetail.orderNumber}
              </h3>
              <p className="text-[#CBD5E1]">
                {selectedOrderDetail.buyerName || 'Customer'} ({selectedOrderDetail.userEmail}) ·{' '}
                <strong className="text-[#00D69A] font-mono">
                  {selectedOrderDetail.amount.toLocaleString()} USDT
                </strong>
              </p>
            </div>

            {/* Buyer Device & Location Card */}
            <div className="p-4 rounded-xl dsk-panel-3d grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-[11px]">
              <div>
                <span className="text-[#94A3B8] block">Device / OS</span>
                <span className="text-[#38BDF8] flex items-center gap-1 mt-0.5">
                  <MonitorSmartphone className="w-3.5 h-3.5" />
                  {selectedOrderDetail.buyerDevice || 'Web Client'}
                </span>
              </div>
              <div>
                <span className="text-[#94A3B8] block">IP Address</span>
                <span className="text-white mt-0.5 block">
                  {selectedOrderDetail.buyerIp || 'Recorded on server'}
                </span>
              </div>
              <div>
                <span className="text-[#94A3B8] block">Region / Org</span>
                <span className="text-white flex items-center gap-1 mt-0.5">
                  <Globe className="w-3.5 h-3.5 text-[#00D69A]" />
                  {selectedOrderDetail.buyerLocation || 'Global'} ·{' '}
                  {selectedOrderDetail.buyerOrganization || 'Standard'}
                </span>
              </div>
            </div>

            {/* Itemized Purchased Products */}
            <div className="p-4 rounded-xl dsk-panel-3d space-y-2">
              <div className="font-mono font-bold text-white text-[11px] uppercase">
                Purchased Software Suites ({selectedOrderDetail.items.length})
              </div>
              {selectedOrderDetail.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-1.5 border-b border-[#1E2936] last:border-0"
                >
                  <div>
                    <span className="text-white font-semibold">{item.name}</span>
                    <span className="text-[#CBD5E1] font-mono ml-2">x{item.quantity}</span>
                  </div>
                  <span className="font-mono text-[#00D69A] font-bold">
                    {(item.price * item.quantity).toLocaleString()} USDT
                  </span>
                </div>
              ))}
            </div>

            {selectedOrderDetail.blockchainVerification && (
              <div className="p-4 rounded-xl dsk-panel-3d font-mono space-y-1.5">
                <div className="text-[#00D69A] font-bold">On-Chain Inspection</div>
                <div className="text-white break-all">
                  TXID: {selectedOrderDetail.blockchainVerification.txHash}
                </div>
                <div className="text-[#CBD5E1]">
                  Confirmations: {selectedOrderDetail.blockchainVerification.confirmations}/
                  {selectedOrderDetail.blockchainVerification.requiredConfirmations} ·{' '}
                  {selectedOrderDetail.blockchainVerification.message}
                </div>
              </div>
            )}

            {selectedOrderDetail.paymentProof && (
              <div className="p-2 rounded-xl bg-[#070B11] border border-[#253445]">
                <img
                  src={selectedOrderDetail.paymentProof.fileData}
                  alt="Uploaded payment receipt"
                  className="w-full h-auto max-h-[40vh] object-contain rounded"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() =>
                  handleStatusChange(selectedOrderDetail.orderNumber, 'Payment Confirmed')
                }
                className="py-2.5 rounded-lg dsk-btn-3d text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Payment &amp; Issue License</span>
              </button>

              <button
                onClick={() => handleStatusChange(selectedOrderDetail.orderNumber, 'Payment Failed')}
                className="py-2.5 rounded-lg bg-red-950/70 hover:bg-red-900 border border-red-700 text-red-200 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Mark Payment Failed</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Customer Inspector Modal */}
      {selectedCustomerDetail && (
        <div className="fixed inset-0 z-50 bg-black/86 flex items-center justify-center p-4">
          <div className="dsk-surface rounded-2xl max-w-2xl w-full p-6 relative text-xs max-h-[90vh] overflow-y-auto space-y-4">
            <button
              onClick={() => setSelectedCustomerDetail(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg dsk-btn-secondary-3d text-[#CBD5E1] hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="text-[10px] font-mono text-[#38BDF8] uppercase">
                Customer Intelligence Profile
              </span>
              <h3 className="text-lg font-extrabold text-white">
                {selectedCustomerDetail.username}
              </h3>
              <p className="text-[#CBD5E1] font-mono">{selectedCustomerDetail.email}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
              <div className="p-3.5 rounded-xl dsk-panel-3d">
                <span className="text-[10px] text-[#94A3B8] block">Device / OS</span>
                <span className="text-[#38BDF8] font-semibold">
                  {selectedCustomerDetail.lastDevice || 'Web Browser'}
                </span>
              </div>
              <div className="p-3.5 rounded-xl dsk-panel-3d">
                <span className="text-[10px] text-[#94A3B8] block">IP &amp; Region</span>
                <span className="text-white font-semibold">
                  {selectedCustomerDetail.lastIp || '—'} ·{' '}
                  {selectedCustomerDetail.lastLocation || 'Global'}
                </span>
              </div>
              <div className="p-3.5 rounded-xl dsk-panel-3d">
                <span className="text-[10px] text-[#94A3B8] block">Confirmed Spend</span>
                <span className="text-[#00D69A] font-bold">
                  {(selectedCustomerDetail.totalSpentUSDT ?? 0).toLocaleString()} USDT
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl dsk-panel-3d space-y-2">
              <div className="font-mono font-bold text-white uppercase text-[11px]">
                Customer Order History
              </div>
              {orders.filter(
                (o) =>
                  o.userId === selectedCustomerDetail.id ||
                  o.userEmail === selectedCustomerDetail.email
              ).length === 0 ? (
                <p className="text-[#CBD5E1]">No orders placed by this user yet.</p>
              ) : (
                orders
                  .filter(
                    (o) =>
                      o.userId === selectedCustomerDetail.id ||
                      o.userEmail === selectedCustomerDetail.email
                  )
                  .map((o) => (
                    <div
                      key={o.id}
                      className="flex items-center justify-between py-2 border-b border-[#1E2936] last:border-0"
                    >
                      <div>
                        <span className="font-mono font-bold text-[#00D69A]">{o.orderNumber}</span>
                        <span className="text-[#CBD5E1] ml-2">
                          {o.items.map((i) => i.name).join(', ')}
                        </span>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-white font-bold">{o.amount} USDT</span>
                        <span className="text-[10px] text-[#E5B84B] block">{o.status}</span>
                      </div>
                    </div>
                  ))
              )}
            </div>

            <div className="p-4 rounded-xl dsk-panel-3d space-y-2">
              <div className="font-mono font-bold text-white uppercase text-[11px]">
                Issued Licenses
              </div>
              {adminLicenses.filter(
                (l) =>
                  l.userId === selectedCustomerDetail.id ||
                  l.userEmail === selectedCustomerDetail.email
              ).length === 0 ? (
                <p className="text-[#CBD5E1]">No active or issued license keys yet.</p>
              ) : (
                adminLicenses
                  .filter(
                    (l) =>
                      l.userId === selectedCustomerDetail.id ||
                      l.userEmail === selectedCustomerDetail.email
                  )
                  .map((l) => (
                    <div
                      key={l.id}
                      className="flex items-center justify-between py-1.5 border-b border-[#1E2936] last:border-0 font-mono"
                    >
                      <span className="text-[#00D69A] font-bold">{l.licenseKey}</span>
                      <span className="text-white">{l.productName}</span>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
