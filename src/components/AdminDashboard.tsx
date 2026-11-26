import React, { useState, useEffect } from 'react';
import { useMarket } from '../context/MarketContext';
import { Order, OrderStatus, Product, SiteSettings, SupportTicket } from '../types';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Plus,
  FileImage,
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
  Send
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
    recheckOrderTx,
    saveProduct,
    deleteProduct,
    renameCategory,
    toggleLicenseStatus,
    createDiscount,
    toggleDiscount,
    deleteDiscount,
    replyAdminTicket,
    updateAdminSettings
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
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

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

  // Settings draft
  const [settingsDraft, setSettingsDraft] = useState<Partial<SiteSettings>>({});

  useEffect(() => {
    if (userRole !== 'admin') {
      getAdminAuthStatus()
        .then(setAuthStatus)
        .catch(() => setAuthStatus({ envConfigured: false, claimed: false, setupRequired: false }));
    } else {
      fetchAdminData();
      fetchOrders();
    }
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

  if (userRole !== 'admin') {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="p-7 rounded-2xl bg-[#11161D] border border-[#1E2936] shadow-2xl space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00D69A]/12 border border-[#00D69A]/40 flex items-center justify-center text-[#00D69A]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#00D69A] block">
                Restricted Management Access
              </span>
              <h1 className="text-xl font-bold text-[#F4F7F6]">
                {authStatus?.setupRequired
                  ? 'Initialize Administrator Passphrase'
                  : 'DEEPSEEK Admin Authentication'}
              </h1>
            </div>
          </div>

          <p className="text-xs text-[#8F9CA8] leading-relaxed">
            {authStatus?.setupRequired
              ? 'No administrator credential is configured yet. Set an administrator passphrase (minimum 10 characters) to lock and manage the DEEPSEEK console.'
              : 'Enter the server-configured administrator passphrase to unlock catalog management, blockchain TXID reconciliation, license issuance, and platform configuration.'}
          </p>

          {authError && (
            <div className="p-3 rounded-lg bg-red-950/50 border border-red-700/60 text-xs text-red-200">
              {authError}
            </div>
          )}

          <form onSubmit={handleAdminAuthSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#8F9CA8] font-medium mb-1.5">
                Administrator Passphrase
              </label>
              <input
                type="password"
                required
                minLength={authStatus?.setupRequired ? 10 : 1}
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                placeholder={
                  authStatus?.setupRequired
                    ? 'Create strong passphrase (min. 10 chars)'
                    : 'Enter administrator passphrase'
                }
                className="w-full rounded-lg bg-[#0D1116] border border-[#1E2936] px-3.5 py-2.5 text-[#F4F7F6] placeholder-[#8F9CA8]/60 focus:border-[#00D69A] focus:outline-none font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-2.5 px-4 rounded-lg bg-[#00D69A] hover:bg-[#0EA5A4] text-[#07090B] font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              {authLoading
                ? 'Verifying Credentials...'
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
    setSelectedOrderDetail(null);
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
    await updateAdminSettings(settingsDraft);
  };

  const categoryCounts = Array.from(new Set(products.map((p) => p.category))).map((cat) => ({
    name: cat,
    count: products.filter((p) => p.category === cat).length,
    avgPrice: Math.round(
      products.filter((p) => p.category === cat).reduce((s, p) => s + p.price, 0) /
        Math.max(1, products.filter((p) => p.category === cat).length)
    )
  }));

  const ordersWithTx = orders.filter((o) => !!o.txHash);

  const navTabs: { id: AdminTabId; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'orders', label: 'Orders', icon: Package, badge: orders.length },
    { id: 'transactions', label: 'Transactions', icon: Hash, badge: ordersWithTx.length },
    { id: 'products', label: 'Products', icon: Layers, badge: products.length },
    { id: 'categories', label: 'Categories', icon: Tag, badge: categoryCounts.length },
    { id: 'customers', label: 'Customers', icon: Users, badge: adminUsers.length },
    { id: 'licenses', label: 'Licenses', icon: KeyRound, badge: adminLicenses.length },
    { id: 'discounts', label: 'Discounts', icon: Tag, badge: adminDiscounts.length },
    { id: 'tickets', label: 'Tickets', icon: MessageSquare, badge: adminTickets.length },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-[#1E2936]">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#F4F7F6]">
              DEEPSEEK Operations Console
            </h1>
            <span className="px-2.5 py-0.5 rounded bg-[#00D69A]/15 border border-[#00D69A]/40 text-[#00D69A] font-mono text-[11px] font-semibold flex items-center gap-1">
              <Check className="w-3 h-3" />
              ADMIN SESSION
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#8F9CA8] mt-1">
            Catalog engineering, blockchain settlement reconciliation, license keys, promo codes, support desk, and platform configuration.
          </p>
        </div>

        <button
          onClick={() => {
            fetchAdminData();
            fetchOrders();
          }}
          className="px-3.5 py-2 rounded-lg bg-[#11161D] hover:bg-[#151C24] border border-[#1E2936] text-xs font-medium text-[#D1D9E0] flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#00D69A]" />
          <span>Sync Telemetry</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1.5 pb-3 border-b border-[#1E2936] text-xs">
        {navTabs.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-2 rounded-lg flex items-center gap-1.5 font-medium transition-colors cursor-pointer ${
                active
                  ? 'bg-[#00D69A]/15 text-[#00D69A] border border-[#00D69A]/50 font-semibold'
                  : 'bg-[#0D1116] text-[#8F9CA8] border border-[#1E2936] hover:text-[#F4F7F6]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
              {typeof t.badge === 'number' && (
                <span className="text-[10px] font-mono opacity-80 tabular-nums">({t.badge})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#11161D] border border-[#1E2936]">
              <span className="text-[11px] font-mono text-[#8F9CA8] uppercase block mb-1">
                Confirmed Volume
              </span>
              <div className="text-2xl font-mono font-bold text-[#00D69A] tabular-nums">
                {(adminStats?.totalVolumeUSDT ?? 0).toLocaleString()} <span className="text-xs">USDT</span>
              </div>
              <span className="text-[11px] text-[#8F9CA8]">Settled TRC-20 Revenue</span>
            </div>

            <div className="p-4 rounded-xl bg-[#11161D] border border-[#1E2936]">
              <span className="text-[11px] font-mono text-[#8F9CA8] uppercase block mb-1">
                Orders ({adminStats?.approvedOrders ?? 0} Confirmed)
              </span>
              <div className="text-2xl font-mono font-bold text-[#F4F7F6] tabular-nums">
                {adminStats?.totalOrders ?? orders.length}
              </div>
              <span className="text-[11px] text-[#E5B84B]">
                {adminStats?.pendingVerification ?? 0} pending / confirming
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#11161D] border border-[#1E2936]">
              <span className="text-[11px] font-mono text-[#8F9CA8] uppercase block mb-1">
                Active Licenses
              </span>
              <div className="text-2xl font-mono font-bold text-[#0EA5A4] tabular-nums">
                {adminStats?.activeLicenses ?? adminLicenses.filter((l) => l.status === 'Active').length}
              </div>
              <span className="text-[11px] text-[#8F9CA8]">Issued Cryptographic Keys</span>
            </div>

            <div className="p-4 rounded-xl bg-[#11161D] border border-[#1E2936]">
              <span className="text-[11px] font-mono text-[#8F9CA8] uppercase block mb-1">
                Catalog &amp; Tickets
              </span>
              <div className="text-2xl font-mono font-bold text-[#F4F7F6] tabular-nums">
                {products.length} <span className="text-xs text-[#8F9CA8]">suites</span>
              </div>
              <span className="text-[11px] text-[#E5B84B]">
                {adminStats?.openTickets ?? 0} open support tickets
              </span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#11161D] border border-[#1E2936] font-mono">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1E2936] text-xs">
              <span className="flex items-center gap-1.5 text-[#00D69A] font-bold">
                <Terminal className="w-4 h-4" />
                <span>SYSTEM AUDIT TRAIL</span>
              </span>
              <span className="text-[#8F9CA8] tabular-nums">{activityLogs.length} EVENTS</span>
            </div>

            <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1 text-xs">
              {activityLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-lg bg-[#0D1116] border border-[#1E2936] flex items-start justify-between gap-3 text-[11px]"
                >
                  <div className="flex items-start gap-2 min-w-0">
                    <span className="text-[#00D69A] font-bold shrink-0">[{log.category}]</span>
                    <span className="text-[#8F9CA8] font-semibold shrink-0">{log.action}:</span>
                    <span className="text-[#F4F7F6] break-words">{log.details}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 text-[#8F9CA8] text-[10px] tabular-nums">
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
        <div className="overflow-x-auto rounded-xl border border-[#1E2936] bg-[#11161D]">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#0D1116] text-[#8F9CA8] border-b border-[#1E2936]">
              <tr>
                <th className="p-3.5">Order Ref</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">TXID / Proof</th>
                <th className="p-3.5">Verification Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2936]">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-[#0D1116] transition-colors">
                  <td className="p-3.5 font-bold text-[#00D69A]">{order.orderNumber}</td>
                  <td className="p-3.5 text-[#F4F7F6]">{order.userEmail}</td>
                  <td className="p-3.5 font-bold text-[#F4F7F6] tabular-nums">
                    {order.amount.toLocaleString()} USDT
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        order.status === 'Payment Confirmed' ||
                        order.status === 'Approved' ||
                        order.status === 'Completed'
                          ? 'bg-[#00D69A]/15 text-[#00D69A] border-[#00D69A]/40'
                          : order.status === 'Payment Failed' ||
                            order.status === 'Payment Expired' ||
                            order.status === 'Rejected'
                          ? 'bg-red-950/60 text-red-300 border-red-700'
                          : 'bg-[#E5B84B]/15 text-[#E5B84B] border-[#E5B84B]/40'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-1.5">
                      {order.txHash && (
                        <span className="text-[10px] text-[#0EA5A4]" title={order.txHash}>
                          {order.txHash.slice(0, 10)}...
                        </span>
                      )}
                      {(order.paymentProof || order.blockchainVerification) && (
                        <button
                          onClick={() => setSelectedOrderDetail(order)}
                          className="px-2 py-1 rounded bg-[#0D1116] border border-[#1E2936] text-[#00D69A] hover:border-[#00D69A] flex items-center gap-1 cursor-pointer text-[10px]"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect</span>
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="p-3.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {order.txHash && (
                        <button
                          onClick={() => handleRecheck(order.orderNumber)}
                          disabled={updatingOrderId === order.orderNumber}
                          className="px-2 py-1 rounded bg-[#0D1116] border border-[#1E2936] hover:border-[#0EA5A4] text-[#0EA5A4] text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Recheck TX</span>
                        </button>
                      )}

                      <select
                        value={order.status}
                        disabled={updatingOrderId === order.orderNumber}
                        onChange={(e) => handleStatusChange(order.orderNumber, e.target.value as OrderStatus)}
                        className="bg-[#0D1116] border border-[#1E2936] rounded px-2 py-1 text-[#F4F7F6] text-[10px] focus:outline-none focus:border-[#00D69A] cursor-pointer"
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
                          onClick={() => handleStatusChange(order.orderNumber, 'Payment Confirmed')}
                          disabled={updatingOrderId === order.orderNumber}
                          className="px-2.5 py-1 rounded bg-[#00D69A] hover:bg-[#0EA5A4] text-[#07090B] font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          <span>Confirm</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB: TRANSACTIONS LEDGER */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#11161D] border border-[#1E2936] flex items-center justify-between text-xs">
            <div>
              <h3 className="font-bold text-[#F4F7F6]">Blockchain TXID Verification Ledger</h3>
              <p className="text-[#8F9CA8] mt-0.5">
                Every submitted Tron TRC-20 transaction hash is checked for uniqueness across orders and queried against the Tron network.
              </p>
            </div>
            <span className="font-mono text-[#00D69A]">{ordersWithTx.length} Submitted Hashes</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#1E2936] bg-[#11161D]">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#0D1116] text-[#8F9CA8] border-b border-[#1E2936]">
                <tr>
                  <th className="p-3.5">Order</th>
                  <th className="p-3.5">TXID Hash</th>
                  <th className="p-3.5">Detected USDT</th>
                  <th className="p-3.5">Confirmations</th>
                  <th className="p-3.5">Provider</th>
                  <th className="p-3.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2936]">
                {ordersWithTx.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#8F9CA8]">
                      No blockchain transaction hashes submitted yet.
                    </td>
                  </tr>
                ) : (
                  ordersWithTx.map((o) => (
                    <tr key={o.id} className="hover:bg-[#0D1116]">
                      <td className="p-3.5 text-[#00D69A] font-bold">{o.orderNumber}</td>
                      <td className="p-3.5 text-[#F4F7F6] break-all max-w-xs">{o.txHash}</td>
                      <td className="p-3.5 tabular-nums text-[#F4F7F6]">
                        {o.blockchainVerification?.detectedAmount ?? o.amount} USDT
                      </td>
                      <td className="p-3.5 tabular-nums text-[#0EA5A4]">
                        {o.blockchainVerification?.confirmations ?? 0} /{' '}
                        {o.blockchainVerification?.requiredConfirmations ?? 19}
                      </td>
                      <td className="p-3.5 text-[#8F9CA8]">
                        {o.blockchainVerification?.provider || 'trongrid'}
                      </td>
                      <td className="p-3.5">
                        <button
                          onClick={() => handleRecheck(o.orderNumber)}
                          className="px-2.5 py-1 rounded bg-[#0D1116] border border-[#1E2936] hover:border-[#00D69A] text-[#00D69A] text-[10px] cursor-pointer"
                        >
                          Query TronGrid
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
            <h3 className="font-semibold text-sm text-[#F4F7F6]">
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
                  image: '/assets/sql_flash_module.jpg',
                  version: 'v1.0.0',
                  featured: false
                });
                setIsCreatingProduct(true);
              }}
              className="px-3.5 py-2 rounded-lg bg-[#00D69A] hover:bg-[#0EA5A4] text-[#07090B] font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Software Suite</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#1E2936] bg-[#11161D]">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#0D1116] text-[#8F9CA8] border-b border-[#1E2936]">
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
                  <tr key={prod.id} className="hover:bg-[#0D1116] transition-colors">
                    <td className="p-3.5 text-[#00D69A]">{prod.productCode || prod.id}</td>
                    <td className="p-3.5 font-bold text-[#F4F7F6]">{prod.name}</td>
                    <td className="p-3.5 text-[#8F9CA8]">{prod.category}</td>
                    <td className="p-3.5 text-[#F4F7F6] font-bold tabular-nums">
                      {prod.price.toLocaleString()} USDT
                    </td>
                    <td className="p-3.5 text-[#8F9CA8]">{prod.version || 'v2026.1'}</td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingProduct(prod);
                            setIsCreatingProduct(false);
                          }}
                          className="p-1.5 rounded text-[#8F9CA8] hover:text-[#00D69A] hover:bg-[#07090B] transition-colors cursor-pointer"
                          title="Edit product"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Remove ${prod.name} from catalog?`)) {
                              deleteProduct(prod.id);
                            }
                          }}
                          className="p-1.5 rounded text-[#8F9CA8] hover:text-red-400 hover:bg-[#07090B] transition-colors cursor-pointer"
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
              className="p-5 rounded-xl bg-[#11161D] border border-[#1E2936] flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-[#00D69A] mb-1">
                  <span>{cat.count} SUITES</span>
                  <span className="text-[#8F9CA8]">Avg {cat.avgPrice.toLocaleString()} USDT</span>
                </div>
                <h3 className="text-sm font-bold text-[#F4F7F6]">{cat.name}</h3>
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
                    className="flex-1 rounded-lg bg-[#0D1116] border border-[#00D69A] px-2.5 py-1.5 text-[#F4F7F6] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-[#00D69A] text-[#07090B] font-semibold cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setRenamingCategory(null)}
                    className="px-2 py-1.5 rounded-lg bg-[#0D1116] border border-[#1E2936] text-[#8F9CA8] cursor-pointer"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setRenamingCategory({ oldName: cat.name, newName: cat.name })}
                  className="px-3 py-1.5 rounded-lg bg-[#0D1116] hover:bg-[#151C24] border border-[#1E2936] text-xs font-medium text-[#D1D9E0] cursor-pointer self-start"
                >
                  Rename Category
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB: CUSTOMERS */}
      {activeTab === 'customers' && (
        <div className="overflow-x-auto rounded-xl border border-[#1E2936] bg-[#11161D]">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#0D1116] text-[#8F9CA8] border-b border-[#1E2936]">
              <tr>
                <th className="p-3.5">User ID</th>
                <th className="p-3.5">Username</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Organization</th>
                <th className="p-3.5">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2936]">
              {adminUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[#0D1116]">
                  <td className="p-3.5 text-[#00D69A]">{u.id}</td>
                  <td className="p-3.5 font-bold text-[#F4F7F6]">{u.username}</td>
                  <td className="p-3.5 text-[#D1D9E0]">{u.email}</td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase ${
                        u.role === 'admin'
                          ? 'bg-[#E5B84B]/15 text-[#E5B84B]'
                          : 'bg-[#00D69A]/15 text-[#00D69A]'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3.5 text-[#8F9CA8]">{u.organization || '—'}</td>
                  <td className="p-3.5 text-[#8F9CA8]">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB: LICENSES */}
      {activeTab === 'licenses' && (
        <div className="overflow-x-auto rounded-xl border border-[#1E2936] bg-[#11161D]">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#0D1116] text-[#8F9CA8] border-b border-[#1E2936]">
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
                  <td colSpan={6} className="p-8 text-center text-[#8F9CA8]">
                    Licenses are issued automatically when orders transition to Payment Confirmed.
                  </td>
                </tr>
              ) : (
                adminLicenses.map((lic) => (
                  <tr key={lic.id} className="hover:bg-[#0D1116]">
                    <td className="p-3.5 text-[#00D69A] font-bold">{lic.licenseKey}</td>
                    <td className="p-3.5 text-[#F4F7F6]">{lic.productName}</td>
                    <td className="p-3.5 text-[#8F9CA8]">{lic.orderNumber}</td>
                    <td className="p-3.5 text-[#D1D9E0]">{lic.userEmail}</td>
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
                        className="px-2.5 py-1 rounded bg-[#0D1116] border border-[#1E2936] hover:border-[#E5B84B] text-[#E5B84B] text-[10px] cursor-pointer"
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
            className="lg:col-span-4 p-5 rounded-xl bg-[#11161D] border border-[#1E2936] space-y-3 text-xs"
          >
            <h3 className="text-sm font-bold text-[#F4F7F6]">Create Promotional Code</h3>
            <div>
              <label className="text-[#8F9CA8] block mb-1">Code</label>
              <input
                type="text"
                required
                placeholder="e.g. ENTERPRISE15"
                value={newDiscount.code}
                onChange={(e) => setNewDiscount({ ...newDiscount, code: e.target.value.toUpperCase() })}
                className="w-full rounded-lg bg-[#0D1116] border border-[#1E2936] p-2.5 text-[#F4F7F6] font-mono uppercase focus:border-[#00D69A] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[#8F9CA8] block mb-1">Type</label>
                <select
                  value={newDiscount.type}
                  onChange={(e) =>
                    setNewDiscount({ ...newDiscount, type: e.target.value as 'percent' | 'fixed' })
                  }
                  className="w-full rounded-lg bg-[#0D1116] border border-[#1E2936] p-2.5 text-[#F4F7F6] focus:outline-none"
                >
                  <option value="percent">Percent (%)</option>
                  <option value="fixed">Fixed (USDT)</option>
                </select>
              </div>
              <div>
                <label className="text-[#8F9CA8] block mb-1">Value</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={newDiscount.value}
                  onChange={(e) =>
                    setNewDiscount({ ...newDiscount, value: Number(e.target.value) || 1 })
                  }
                  className="w-full rounded-lg bg-[#0D1116] border border-[#1E2936] p-2.5 text-[#00D69A] font-mono focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[#8F9CA8] block mb-1">Max Uses</label>
              <input
                type="number"
                min={1}
                required
                value={newDiscount.maxUses}
                onChange={(e) =>
                  setNewDiscount({ ...newDiscount, maxUses: Number(e.target.value) || 1 })
                }
                className="w-full rounded-lg bg-[#0D1116] border border-[#1E2936] p-2.5 text-[#F4F7F6] font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[#8F9CA8] block mb-1">Description</label>
              <input
                type="text"
                placeholder="Campaign description"
                value={newDiscount.description}
                onChange={(e) => setNewDiscount({ ...newDiscount, description: e.target.value })}
                className="w-full rounded-lg bg-[#0D1116] border border-[#1E2936] p-2.5 text-[#F4F7F6] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-[#00D69A] hover:bg-[#0EA5A4] text-[#07090B] font-semibold cursor-pointer"
            >
              Add Discount Code
            </button>
          </form>

          <div className="lg:col-span-8 overflow-x-auto rounded-xl border border-[#1E2936] bg-[#11161D]">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#0D1116] text-[#8F9CA8] border-b border-[#1E2936]">
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
                  <tr key={d.id} className="hover:bg-[#0D1116]">
                    <td className="p-3.5 font-bold text-[#00D69A]">
                      <div>{d.code}</div>
                      <div className="text-[10px] text-[#8F9CA8] font-sans font-normal">{d.description}</div>
                    </td>
                    <td className="p-3.5 text-[#F4F7F6] tabular-nums">
                      {d.type === 'percent' ? `${d.value}%` : `${d.value} USDT`}
                    </td>
                    <td className="p-3.5 text-[#8F9CA8] tabular-nums">
                      {d.usedCount} / {d.maxUses}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] ${
                          d.active ? 'bg-[#00D69A]/15 text-[#00D69A]' : 'bg-[#0D1116] text-[#8F9CA8]'
                        }`}
                      >
                        {d.active ? 'Active' : 'Paused'}
                      </span>
                    </td>
                    <td className="p-3.5 flex items-center gap-2">
                      <button
                        onClick={() => toggleDiscount(d.id)}
                        className="px-2 py-1 rounded bg-[#0D1116] border border-[#1E2936] text-[#D1D9E0] text-[10px] cursor-pointer"
                      >
                        {d.active ? 'Pause' : 'Enable'}
                      </button>
                      <button
                        onClick={() => deleteDiscount(d.id)}
                        className="p-1.5 rounded text-[#8F9CA8] hover:text-red-400 cursor-pointer"
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
            <div className="p-10 rounded-xl bg-[#11161D] border border-[#1E2936] text-center text-xs text-[#8F9CA8]">
              No customer support tickets opened yet.
            </div>
          ) : (
            adminTickets.map((tkt) => (
              <div
                key={tkt.id}
                className="p-5 rounded-xl bg-[#11161D] border border-[#1E2936] space-y-3 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#1E2936]">
                  <div>
                    <span className="font-mono text-[#00D69A] font-bold mr-2">
                      {tkt.ticketNumber}
                    </span>
                    <span className="font-semibold text-[#F4F7F6]">{tkt.subject}</span>
                    <div className="text-[11px] text-[#8F9CA8] mt-0.5">
                      {tkt.userEmail} · {tkt.category} · {new Date(tkt.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <select
                    value={ticketStatuses[tkt.id] || tkt.status}
                    onChange={(e) =>
                      setTicketStatuses({
                        ...ticketStatuses,
                        [tkt.id]: e.target.value as SupportTicket['status']
                      })
                    }
                    className="rounded-lg bg-[#0D1116] border border-[#1E2936] px-2.5 py-1 text-[#F4F7F6]"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                <p className="text-[#D1D9E0] bg-[#0D1116] p-3 rounded-lg border border-[#1E2936]">
                  {tkt.message}
                </p>

                {tkt.replies.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-3 rounded-lg bg-[#0D1116] border border-[#00D69A]/30 ml-4"
                  >
                    <div className="text-[10px] font-mono text-[#00D69A] mb-1">
                      {rep.author} ({rep.role}) · {new Date(rep.timestamp).toLocaleString()}
                    </div>
                    <div className="text-[#F4F7F6]">{rep.message}</div>
                  </div>
                ))}

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Write official support reply..."
                    value={replyDrafts[tkt.id] || ''}
                    onChange={(e) => setReplyDrafts({ ...replyDrafts, [tkt.id]: e.target.value })}
                    className="flex-1 rounded-lg bg-[#0D1116] border border-[#1E2936] px-3 py-2 text-[#F4F7F6] focus:border-[#00D69A] focus:outline-none"
                  />
                  <button
                    onClick={async () => {
                      const msg = replyDrafts[tkt.id] || '';
                      if (!msg.trim()) return;
                      const ok = await replyAdminTicket(
                        tkt.id,
                        msg.trim(),
                        ticketStatuses[tkt.id] || tkt.status
                      );
                      if (ok) {
                        setReplyDrafts({ ...replyDrafts, [tkt.id]: '' });
                      }
                    }}
                    className="px-4 py-2 rounded-lg bg-[#00D69A] hover:bg-[#0EA5A4] text-[#07090B] font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Reply</span>
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
          className="max-w-3xl p-6 rounded-xl bg-[#11161D] border border-[#1E2936] space-y-4 text-xs"
        >
          <h3 className="text-base font-bold text-[#F4F7F6] pb-3 border-b border-[#1E2936]">
            Platform &amp; Settlement Configuration
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[#8F9CA8] block mb-1 font-medium">Support Email</label>
              <input
                type="email"
                value={settingsDraft.supportEmail || ''}
                onChange={(e) => setSettingsDraft({ ...settingsDraft, supportEmail: e.target.value })}
                className="w-full rounded-lg bg-[#0D1116] border border-[#1E2936] p-2.5 text-[#F4F7F6] focus:border-[#00D69A] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[#8F9CA8] block mb-1 font-medium">Dispatch Channel</label>
              <input
                type="text"
                value={settingsDraft.dispatchChannel || ''}
                onChange={(e) =>
                  setSettingsDraft({ ...settingsDraft, dispatchChannel: e.target.value })
                }
                className="w-full rounded-lg bg-[#0D1116] border border-[#1E2936] p-2.5 text-[#F4F7F6] font-mono focus:border-[#00D69A] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[#8F9CA8] block mb-1 font-medium">Platform Tagline</label>
            <input
              type="text"
              value={settingsDraft.tagline || ''}
              onChange={(e) => setSettingsDraft({ ...settingsDraft, tagline: e.target.value })}
              className="w-full rounded-lg bg-[#0D1116] border border-[#1E2936] p-2.5 text-[#F4F7F6] focus:border-[#00D69A] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[#8F9CA8] block mb-1 font-medium">Announcement Banner Text</label>
            <input
              type="text"
              value={settingsDraft.announcementText || ''}
              onChange={(e) =>
                setSettingsDraft({ ...settingsDraft, announcementText: e.target.value })
              }
              className="w-full rounded-lg bg-[#0D1116] border border-[#1E2936] p-2.5 text-[#F4F7F6] focus:border-[#00D69A] focus:outline-none"
            />
            <label className="inline-flex items-center gap-2 mt-2 text-[#D1D9E0] cursor-pointer">
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

          <div className="pt-3 border-t border-[#1E2936] grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-[#8F9CA8] block mb-1 font-medium">
                USDT TRC-20 Receiving Wallet Address
              </label>
              <input
                type="text"
                value={settingsDraft.trc20ReceivingAddress || ''}
                onChange={(e) =>
                  setSettingsDraft({ ...settingsDraft, trc20ReceivingAddress: e.target.value })
                }
                className="w-full rounded-lg bg-[#0D1116] border border-[#1E2936] p-2.5 text-[#00D69A] font-mono focus:border-[#00D69A] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[#8F9CA8] block mb-1 font-medium">
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
                className="w-full rounded-lg bg-[#0D1116] border border-[#1E2936] p-2.5 text-[#F4F7F6] font-mono focus:border-[#00D69A] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[#8F9CA8] block mb-1 font-medium">
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
                className="w-full rounded-lg bg-[#0D1116] border border-[#1E2936] p-2.5 text-[#F4F7F6] font-mono focus:border-[#00D69A] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-[#00D69A] hover:bg-[#0EA5A4] text-[#07090B] font-semibold cursor-pointer"
          >
            Save Platform Settings
          </button>
        </form>
      )}

      {/* Edit/Create Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#11161D] border border-[#1E2936] rounded-xl max-w-lg w-full p-6 relative text-xs shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingProduct(null)}
              className="absolute top-4 right-4 text-[#8F9CA8] hover:text-[#F4F7F6] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-[#F4F7F6] mb-4">
              {isCreatingProduct ? 'Add Software Suite' : `Edit ${editingProduct.name}`}
            </h3>

            <form onSubmit={handleSaveProductForm} className="space-y-3">
              <div>
                <label className="text-[#8F9CA8] block mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full bg-[#0D1116] border border-[#1E2936] rounded-lg p-2.5 text-[#F4F7F6] focus:border-[#00D69A] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#8F9CA8] block mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.category || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, category: e.target.value })
                    }
                    className="w-full bg-[#0D1116] border border-[#1E2936] rounded-lg p-2.5 text-[#F4F7F6] focus:border-[#00D69A] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#8F9CA8] block mb-1">Price (USDT)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editingProduct.price || 0}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-[#0D1116] border border-[#1E2936] rounded-lg p-2.5 text-[#00D69A] font-mono font-bold focus:border-[#00D69A] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#8F9CA8] block mb-1">Product ID / Code</label>
                  <input
                    type="text"
                    value={editingProduct.productCode || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, productCode: e.target.value })
                    }
                    className="w-full bg-[#0D1116] border border-[#1E2936] rounded-lg p-2.5 text-[#F4F7F6] font-mono focus:border-[#00D69A] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#8F9CA8] block mb-1">Version</label>
                  <input
                    type="text"
                    value={editingProduct.version || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, version: e.target.value })
                    }
                    className="w-full bg-[#0D1116] border border-[#1E2936] rounded-lg p-2.5 text-[#F4F7F6] font-mono focus:border-[#00D69A] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#8F9CA8] block mb-1">Image Path / URL</label>
                <input
                  type="text"
                  value={editingProduct.image || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                  className="w-full bg-[#0D1116] border border-[#1E2936] rounded-lg p-2.5 text-[#F4F7F6] font-mono focus:border-[#00D69A] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[#8F9CA8] block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, description: e.target.value })
                  }
                  className="w-full bg-[#0D1116] border border-[#1E2936] rounded-lg p-2.5 text-[#F4F7F6] focus:border-[#00D69A] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[#8F9CA8] block mb-1">Features (comma separated)</label>
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
                  className="w-full bg-[#0D1116] border border-[#1E2936] rounded-lg p-2.5 text-[#F4F7F6] focus:border-[#00D69A] focus:outline-none"
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
                <label htmlFor="featured" className="text-[#F4F7F6]">
                  Mark as Featured listing
                </label>
              </div>

              <div className="pt-3 border-t border-[#1E2936] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-lg bg-[#0D1116] border border-[#1E2936] text-[#8F9CA8] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#00D69A] hover:bg-[#0EA5A4] text-[#07090B] font-semibold cursor-pointer"
                >
                  Save Suite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Verification Detail Modal */}
      {selectedOrderDetail && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#11161D] border border-[#1E2936] rounded-xl max-w-2xl w-full p-6 relative text-xs max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
            <button
              onClick={() => setSelectedOrderDetail(null)}
              className="absolute top-4 right-4 text-[#8F9CA8] hover:text-[#F4F7F6] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="text-base font-bold text-[#F4F7F6]">
                Settlement Verification: {selectedOrderDetail.orderNumber}
              </h3>
              <p className="text-[#8F9CA8]">
                {selectedOrderDetail.amount.toLocaleString()} USDT · {selectedOrderDetail.userEmail}
              </p>
            </div>

            {selectedOrderDetail.blockchainVerification && (
              <div className="p-4 rounded-xl bg-[#0D1116] border border-[#1E2936] font-mono space-y-1.5">
                <div className="text-[#00D69A] font-bold">On-Chain Inspection</div>
                <div className="text-[#D1D9E0] break-all">
                  TXID: {selectedOrderDetail.blockchainVerification.txHash}
                </div>
                <div className="text-[#8F9CA8]">
                  Confirmations: {selectedOrderDetail.blockchainVerification.confirmations}/
                  {selectedOrderDetail.blockchainVerification.requiredConfirmations} ·{' '}
                  {selectedOrderDetail.blockchainVerification.message}
                </div>
              </div>
            )}

            {selectedOrderDetail.paymentProof && (
              <div className="p-2 rounded-xl bg-[#07090B] border border-[#1E2936]">
                <img
                  src={selectedOrderDetail.paymentProof.fileData}
                  alt="Uploaded payment receipt"
                  className="w-full h-auto max-h-[45vh] object-contain rounded"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() =>
                  handleStatusChange(selectedOrderDetail.orderNumber, 'Payment Confirmed')
                }
                className="py-2.5 rounded-lg bg-[#00D69A] hover:bg-[#0EA5A4] text-[#07090B] font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Payment &amp; Issue License</span>
              </button>

              <button
                onClick={() => handleStatusChange(selectedOrderDetail.orderNumber, 'Payment Failed')}
                className="py-2.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-700 text-red-300 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Mark Payment Failed</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
