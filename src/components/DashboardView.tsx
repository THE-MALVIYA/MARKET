import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { ProductCard } from './ProductCard';
import {
  LayoutDashboard,
  Heart,
  Package,
  Download,
  KeyRound,
  Receipt,
  LifeBuoy,
  Settings,
  Lock,
  Copy,
  Check,
  Save,
  Trash2,
  Send
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    currentUser,
    setAuthModalOpen,
    products,
    wishlist,
    toggleWishlist,
    orders,
    licenses,
    tickets,
    submitSupportTicket,
    downloadLicenseBundle,
    userPreferences,
    updateUserPreferences,
    setActiveTab,
    setActiveOrderNumber,
    addToast
  } = useMarket();

  const [section, setSection] = useState<
    | 'overview'
    | 'orders'
    | 'purchased'
    | 'downloads'
    | 'licenses'
    | 'payments'
    | 'wishlist'
    | 'tickets'
    | 'settings'
  >('overview');

  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [ticketForm, setTicketForm] = useState({
    category: 'Order & Payment Reconciliation',
    subject: '',
    message: ''
  });
  const [profileForm, setProfileForm] = useState({
    displayName: currentUser?.username || userPreferences.displayName,
    organization: currentUser?.organization || userPreferences.organization,
    contactEmail: currentUser?.email || userPreferences.contactEmail,
    timezone: userPreferences.timezone
  });

  const savedProducts = products.filter((p) => wishlist.includes(p.id));
  const confirmedOrders = orders.filter(
    (o) => o.status === 'Payment Confirmed' || o.status === 'Approved' || o.status === 'Completed'
  );
  const purchasedProductsMap = new Map<string, { name: string; productId: string; orderNumber: string; date: string }>();
  confirmedOrders.forEach((o) => {
    o.items.forEach((item) => {
      purchasedProductsMap.set(`${o.orderNumber}-${item.productId}`, {
        name: item.name,
        productId: item.productId,
        orderNumber: o.orderNumber,
        date: o.createdAt
      });
    });
  });
  const purchasedList = Array.from(purchasedProductsMap.values());

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="p-8 sm:p-10 rounded-2xl bg-[#11161D] border border-[#1E2936] space-y-4">
          <Lock className="w-10 h-10 text-[#00D69A] mx-auto" />
          <h1 className="text-2xl font-bold text-[#F4F7F6]">User Account Dashboard</h1>
          <p className="text-xs sm:text-sm text-[#8F9CA8] max-w-md mx-auto">
            Sign in to view your licensing orders, download purchased software manifests, copy license keys, and track support tickets.
          </p>
          <button
            onClick={() => setAuthModalOpen(true)}
            className="px-6 py-3 rounded-lg bg-[#00D69A] hover:bg-[#0EA5A4] text-[#07090B] font-bold text-xs cursor-pointer"
          >
            Sign In or Create Account
          </button>
        </div>
      </div>
    );
  }

  const navItems: { id: typeof section; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Account Overview', icon: LayoutDashboard },
    { id: 'orders', label: `My Orders (${orders.length})`, icon: Package },
    { id: 'purchased', label: `Purchased Products (${purchasedList.length})`, icon: Check },
    { id: 'downloads', label: `Downloadable Files (${licenses.length})`, icon: Download },
    { id: 'licenses', label: `License Keys (${licenses.length})`, icon: KeyRound },
    { id: 'payments', label: 'Payment History & TXID', icon: Receipt },
    { id: 'wishlist', label: `Wishlist (${savedProducts.length})`, icon: Heart },
    { id: 'tickets', label: `Support Tickets (${tickets.length})`, icon: LifeBuoy },
    { id: 'settings', label: 'Account Settings', icon: Settings }
  ];

  const handleCopyLicense = (id: string, key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKeyId(id);
    addToast({ type: 'info', title: 'License Key Copied', message: key });
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    const tkt = await submitSupportTicket(
      ticketForm.category,
      ticketForm.subject,
      ticketForm.message
    );
    if (tkt) {
      setTicketForm({ category: 'Order & Payment Reconciliation', subject: '', message: '' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="p-6 sm:p-8 rounded-2xl bg-[#11161D] border border-[#1E2936] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#00D69A] block mb-1">
            DEEPSEEK Account Workspace
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F4F7F6]">
            {currentUser.username}
          </h1>
          <p className="text-xs text-[#8F9CA8] mt-1">
            {currentUser.email} · {currentUser.organization || 'Enterprise Client'}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setActiveTab('products')}
            className="px-4 py-2.5 rounded-lg bg-[#00D69A] hover:bg-[#0EA5A4] text-[#07090B] font-semibold text-xs cursor-pointer"
          >
            Browse Products
          </button>
          <button
            onClick={() => setActiveTab('checkout')}
            className="px-4 py-2.5 rounded-lg bg-[#0D1116] border border-[#1E2936] text-[#F4F7F6] font-semibold text-xs cursor-pointer"
          >
            Active Checkout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <aside className="lg:col-span-3 rounded-xl bg-[#11161D] border border-[#1E2936] p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = section === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                  active
                    ? 'bg-[#00D69A]/15 text-[#00D69A] font-semibold'
                    : 'text-[#8F9CA8] hover:text-[#F4F7F6] hover:bg-[#0D1116]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </aside>

        <div className="lg:col-span-9 space-y-6">
          {section === 'overview' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#11161D] border border-[#1E2936]">
                <span className="text-xs text-[#8F9CA8] block">Orders</span>
                <div className="text-2xl font-bold font-mono text-[#F4F7F6] mt-1 tabular-nums">
                  {orders.length}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#11161D] border border-[#1E2936]">
                <span className="text-xs text-[#8F9CA8] block">Active Licenses</span>
                <div className="text-2xl font-bold font-mono text-[#00D69A] mt-1 tabular-nums">
                  {licenses.filter((l) => l.status === 'Active').length}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#11161D] border border-[#1E2936]">
                <span className="text-xs text-[#8F9CA8] block">Saved Wishlist</span>
                <div className="text-2xl font-bold font-mono text-[#F4F7F6] mt-1 tabular-nums">
                  {savedProducts.length}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#11161D] border border-[#1E2936]">
                <span className="text-xs text-[#8F9CA8] block">Open Tickets</span>
                <div className="text-2xl font-bold font-mono text-[#0EA5A4] mt-1 tabular-nums">
                  {tickets.filter((t) => t.status !== 'Resolved').length}
                </div>
              </div>
            </div>
          )}

          {section === 'orders' && (
            <div className="p-6 rounded-xl bg-[#11161D] border border-[#1E2936] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E2936]">
                <h2 className="text-base font-bold text-[#F4F7F6]">My Orders</h2>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-[#00D69A] cursor-pointer"
                >
                  Open Full Order Tracker &rarr;
                </button>
              </div>
              {orders.length === 0 ? (
                <p className="text-xs text-[#8F9CA8] py-8 text-center">No orders placed yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0D1116] text-[#8F9CA8] font-mono border-b border-[#1E2936]">
                      <tr>
                        <th className="p-3">Order Ref</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E2936]">
                      {orders.map((o) => (
                        <tr key={o.id}>
                          <td className="p-3 font-mono text-[#00D69A] font-bold">{o.orderNumber}</td>
                          <td className="p-3 font-mono tabular-nums">{o.amount.toLocaleString()} USDT</td>
                          <td className="p-3 font-mono">{o.status}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                setActiveOrderNumber(o.orderNumber);
                                setActiveTab('checkout');
                              }}
                              className="text-[#00D69A] hover:underline cursor-pointer"
                            >
                              Open
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {section === 'purchased' && (
            <div className="p-6 rounded-xl bg-[#11161D] border border-[#1E2936] space-y-4">
              <h2 className="text-base font-bold text-[#F4F7F6] pb-3 border-b border-[#1E2936]">
                Purchased Software Suites
              </h2>
              {purchasedList.length === 0 ? (
                <p className="text-xs text-[#8F9CA8] py-8 text-center">
                  Confirmed purchases appear here once blockchain settlement completes.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {purchasedList.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg bg-[#0D1116] border border-[#1E2936] flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-[#F4F7F6]">{item.name}</div>
                        <div className="text-[#8F9CA8] font-mono mt-0.5">
                          Order {item.orderNumber} · {new Date(item.date).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={() => setSection('downloads')}
                        className="px-3 py-1.5 rounded-lg bg-[#00D69A] text-[#07090B] font-semibold cursor-pointer"
                      >
                        Download Files
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {section === 'downloads' && (
            <div className="p-6 rounded-xl bg-[#11161D] border border-[#1E2936] space-y-4">
              <h2 className="text-base font-bold text-[#F4F7F6] pb-3 border-b border-[#1E2936]">
                Downloadable Software Manifests
              </h2>
              {licenses.length === 0 ? (
                <p className="text-xs text-[#8F9CA8] py-8 text-center">
                  Signed deployment manifests are unlocked automatically when payment confirms.
                </p>
              ) : (
                <div className="space-y-3">
                  {licenses.map((lic) => (
                    <div
                      key={lic.id}
                      className="p-4 rounded-lg bg-[#0D1116] border border-[#1E2936] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-[#F4F7F6]">
                          {lic.productName} ({lic.productVersion})
                        </div>
                        <div className="font-mono text-[11px] text-[#8F9CA8] mt-1">
                          SHA-256: {lic.downloadManifestHash.slice(0, 24)}...
                        </div>
                      </div>
                      <button
                        disabled={lic.status !== 'Active'}
                        onClick={() => downloadLicenseBundle(lic.id, lic.productId)}
                        className="px-4 py-2 rounded-lg bg-[#00D69A] hover:bg-[#0EA5A4] text-[#07090B] font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Manifest JSON</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {section === 'licenses' && (
            <div className="p-6 rounded-xl bg-[#11161D] border border-[#1E2936] space-y-4">
              <h2 className="text-base font-bold text-[#F4F7F6] pb-3 border-b border-[#1E2936]">
                Issued License Keys
              </h2>
              {licenses.length === 0 ? (
                <p className="text-xs text-[#8F9CA8] py-8 text-center">No active license keys issued yet.</p>
              ) : (
                <div className="space-y-3">
                  {licenses.map((lic) => (
                    <div
                      key={lic.id}
                      className="p-4 rounded-lg bg-[#0D1116] border border-[#1E2936] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-[#F4F7F6]">{lic.productName}</div>
                        <div className="font-mono text-[#00D69A] font-bold mt-1">{lic.licenseKey}</div>
                        <div className="text-[11px] text-[#8F9CA8] mt-1">
                          Status: {lic.status} · Expires {new Date(lic.expiresAt).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={() => handleCopyLicense(lic.id, lic.licenseKey)}
                        className="px-3.5 py-2 rounded-lg bg-[#11161D] border border-[#1E2936] text-[#00D69A] font-mono flex items-center gap-1.5 cursor-pointer"
                      >
                        {copiedKeyId === lic.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKeyId === lic.id ? 'Copied' : 'Copy Key'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {section === 'payments' && (
            <div className="p-6 rounded-xl bg-[#11161D] border border-[#1E2936] space-y-4">
              <h2 className="text-base font-bold text-[#F4F7F6] pb-3 border-b border-[#1E2936]">
                Payment History &amp; Blockchain Transaction Details
              </h2>
              {orders.length === 0 ? (
                <p className="text-xs text-[#8F9CA8] py-8 text-center">No payment transactions recorded.</p>
              ) : (
                <div className="space-y-3">
                  {orders.map((o) => (
                    <div
                      key={o.id}
                      className="p-4 rounded-lg bg-[#0D1116] border border-[#1E2936] text-xs space-y-1.5"
                    >
                      <div className="flex justify-between font-mono">
                        <span className="text-[#00D69A] font-bold">{o.orderNumber}</span>
                        <span className="font-bold text-[#F4F7F6]">{o.amount.toLocaleString()} USDT</span>
                      </div>
                      <div className="text-[#8F9CA8]">Status: {o.status}</div>
                      {o.txHash && (
                        <div className="font-mono text-[11px] text-[#0EA5A4] break-all">
                          TXID: {o.txHash}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {section === 'wishlist' && (
            <div className="p-6 rounded-xl bg-[#11161D] border border-[#1E2936] space-y-4">
              <h2 className="text-base font-bold text-[#F4F7F6] pb-3 border-b border-[#1E2936]">
                Saved Products
              </h2>
              {savedProducts.length === 0 ? (
                <p className="text-xs text-[#8F9CA8] py-8 text-center">Your wishlist is empty.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {savedProducts.map((product) => (
                    <div key={product.id}>
                      <ProductCard product={product} />
                      <button
                        onClick={() => toggleWishlist(product)}
                        className="mt-2 w-full py-1.5 rounded-lg bg-[#0D1116] border border-[#1E2936] text-[11px] text-[#8F9CA8] hover:text-red-300 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {section === 'tickets' && (
            <div className="space-y-6">
              <form
                onSubmit={handleCreateTicket}
                className="p-6 rounded-xl bg-[#11161D] border border-[#1E2936] space-y-3.5 text-xs"
              >
                <h2 className="text-base font-bold text-[#F4F7F6]">New Support Ticket</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                    className="rounded-lg bg-[#0D1116] border border-[#1E2936] p-2.5 text-[#F4F7F6]"
                  >
                    <option value="Order & Payment Reconciliation">Order &amp; Payment Reconciliation</option>
                    <option value="License Key Support">License Key Support</option>
                    <option value="Technical Architecture">Technical Architecture</option>
                  </select>
                  <input
                    type="text"
                    required
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                    placeholder="Ticket subject..."
                    className="rounded-lg bg-[#0D1116] border border-[#1E2936] p-2.5 text-[#F4F7F6]"
                  />
                </div>
                <textarea
                  rows={3}
                  required
                  value={ticketForm.message}
                  onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                  placeholder="Describe your order reference, TXID, or technical question..."
                  className="w-full rounded-lg bg-[#0D1116] border border-[#1E2936] p-2.5 text-[#F4F7F6]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#00D69A] hover:bg-[#0EA5A4] text-[#07090B] font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Ticket</span>
                </button>
              </form>

              <div className="p-6 rounded-xl bg-[#11161D] border border-[#1E2936] space-y-3">
                <h3 className="text-sm font-bold text-[#F4F7F6]">My Support Tickets</h3>
                {tickets.length === 0 ? (
                  <p className="text-xs text-[#8F9CA8]">No tickets submitted yet.</p>
                ) : (
                  tickets.map((t) => (
                    <div
                      key={t.id}
                      className="p-4 rounded-lg bg-[#0D1116] border border-[#1E2936] space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[#00D69A] font-bold">
                          {t.ticketNumber} · {t.subject}
                        </span>
                        <span className="font-mono text-[#0EA5A4]">{t.status}</span>
                      </div>
                      <p className="text-[#8F9CA8]">{t.message}</p>
                      {t.replies.map((r) => (
                        <div
                          key={r.id}
                          className="p-2.5 rounded bg-[#11161D] border border-[#1E2936] text-[11px]"
                        >
                          <strong className="text-[#00D69A]">{r.author}:</strong>{' '}
                          <span className="text-[#D1D9E0]">{r.message}</span>
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {section === 'settings' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateUserPreferences(profileForm, 'Account profile preferences updated');
              }}
              className="p-6 rounded-xl bg-[#11161D] border border-[#1E2936] space-y-4 text-xs"
            >
              <h2 className="text-base font-bold text-[#F4F7F6] pb-3 border-b border-[#1E2936]">
                Account Settings
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#8F9CA8] mb-1">Display Name</label>
                  <input
                    type="text"
                    value={profileForm.displayName}
                    onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                    className="w-full rounded-lg bg-[#0D1116] border border-[#1E2936] p-2.5 text-[#F4F7F6]"
                  />
                </div>
                <div>
                  <label className="block text-[#8F9CA8] mb-1">Organization</label>
                  <input
                    type="text"
                    value={profileForm.organization}
                    onChange={(e) => setProfileForm({ ...profileForm, organization: e.target.value })}
                    className="w-full rounded-lg bg-[#0D1116] border border-[#1E2936] p-2.5 text-[#F4F7F6]"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#00D69A] hover:bg-[#0EA5A4] text-[#07090B] font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Settings</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
