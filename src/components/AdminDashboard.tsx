import React, { useState, useEffect } from 'react';
import { useMarket } from '../context/MarketContext';
import { OrderStatus, Product } from '../types';
import {
  ShieldAlert,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Edit,
  Trash2,
  Plus,
  FileImage,
  Eye,
  RefreshCw,
  Users,
  Package,
  Layers,
  Terminal,
  X,
  Check,
  AlertTriangle
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    adminStats,
    activityLogs,
    orders,
    products,
    updateOrderStatus,
    saveProduct,
    deleteProduct,
    fetchAdminData,
    fetchOrders,
    userRole,
    switchUserRole
  } = useMarket();

  const [activeTab, setActiveTab] = useState<'orders' | 'proofs' | 'products' | 'logs' | 'users'>('orders');
  const [selectedProofOrder, setSelectedProofOrder] = useState<any>(null);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [statusUpdateNote, setStatusUpdateNote] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminData();
    fetchOrders();
  }, [fetchAdminData, fetchOrders]);

  const ordersWithProofs = orders.filter((o) => !!o.paymentProof);

  const handleStatusChange = async (orderNumber: string, newStatus: OrderStatus) => {
    setUpdatingOrderId(orderNumber);
    await updateOrderStatus(orderNumber, newStatus, statusUpdateNote || `Admin updated to ${newStatus}`);
    setUpdatingOrderId(null);
    setStatusUpdateNote('');
    setSelectedProofOrder(null);
  };

  const handleSaveProductForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name || !editingProduct.price) return;

    await saveProduct(editingProduct);
    setEditingProduct(null);
    setIsCreatingProduct(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      {/* Admin Notice and Role Check */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 pb-4 border-b border-purple-500/30">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
            <h1 className="text-2xl sm:text-3xl font-mono font-extrabold text-white flex items-center gap-2">
              <span>TOOLPLACES MANAGEMENT CONSOLE</span>
            </h1>
            <span className="px-2 py-0.5 rounded bg-purple-950/80 border border-purple-500/40 text-purple-300 font-mono text-xs font-bold">
              ROOT CLEARANCE
            </span>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Payment verification, product catalog management, order approvals, and platform telemetry.
          </p>
        </div>

        {/* Persona toggle helper */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400">Persona Role:</span>
          {userRole !== 'admin' ? (
            <button
              onClick={() => switchUserRole('admin')}
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Assume Admin Privileges</span>
            </button>
          ) : (
            <span className="px-3 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>Admin Mode Active</span>
            </span>
          )}
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 mb-8">
        <div className="p-4 rounded-xl bg-[#090d16] border border-cyan-500/20">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
            Total Orders
          </span>
          <div className="text-2xl font-mono font-extrabold text-white">
            {adminStats?.totalOrders ?? orders.length}
          </div>
          <span className="text-[10px] font-mono text-cyan-400">All Database Records</span>
        </div>

        <div className="p-4 rounded-xl bg-[#090d16] border border-amber-500/30">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
            Pending Verification
          </span>
          <div className="text-2xl font-mono font-extrabold text-amber-400">
            {orders.filter((o) => o.status === 'Proof Uploaded' || o.status === 'Under Review').length}
          </div>
          <span className="text-[10px] font-mono text-amber-300/80">Awaiting Screenshot Review</span>
        </div>

        <div className="p-4 rounded-xl bg-[#090d16] border border-emerald-500/30">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
            Approved Orders
          </span>
          <div className="text-2xl font-mono font-extrabold text-emerald-400">
            {orders.filter((o) => o.status === 'Approved' || o.status === 'Completed').length}
          </div>
          <span className="text-[10px] font-mono text-emerald-400">Verified & Fulfilled</span>
        </div>

        <div className="p-4 rounded-xl bg-[#090d16] border border-red-500/30">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
            Rejected Orders
          </span>
          <div className="text-2xl font-mono font-extrabold text-red-400">
            {orders.filter((o) => o.status === 'Rejected').length}
          </div>
          <span className="text-[10px] font-mono text-red-400">Flagged Anomaly</span>
        </div>

        <div className="p-4 rounded-xl bg-[#090d16] border border-purple-500/30 col-span-2 lg:col-span-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
            Settlement Volume
          </span>
          <div className="text-2xl font-mono font-extrabold text-purple-300">
            {orders
              .filter((o) => o.status === 'Approved' || o.status === 'Completed')
              .reduce((sum, o) => sum + o.amount, 0)}{' '}
            <span className="text-xs font-normal">USDT</span>
          </div>
          <span className="text-[10px] font-mono text-purple-400/80">TRC-20 Network</span>
        </div>
      </div>

      {/* Navigation Sub-tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-800 pb-3 font-mono text-xs">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Order Management ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('proofs')}
          className={`px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'proofs'
              ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <FileImage className="w-3.5 h-3.5 text-cyan-400" />
          <span>Payment Proof Review ({ordersWithProofs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'products'
              ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Product Catalog ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'logs'
              ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span>Activity Audit Logs ({activityLogs.length})</span>
        </button>
      </div>

      {/* Tab 1: Orders Management */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-mono font-bold text-sm text-slate-200">
              ALL TRANSACTIONS & SETTLEMENTS
            </h3>
            <span className="text-[11px] font-mono text-slate-500">
              Admin can manually verify status across the order lifecycle
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#090d16]">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#05070c] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Order Ref</th>
                  <th className="p-3">Buyer</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Proof Attached</th>
                  <th className="p-3">Actions / Lifecycle Transition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3 font-bold text-cyan-300">{order.orderNumber}</td>
                    <td className="p-3 text-slate-300">{order.userEmail}</td>
                    <td className="p-3 font-bold text-emerald-400">{order.amount} USDT</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          order.status === 'Approved'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : order.status === 'Rejected'
                            ? 'bg-red-950 text-red-300 border border-red-800'
                            : order.status === 'Proof Uploaded'
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                            : 'bg-yellow-950 text-yellow-300 border border-yellow-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {order.paymentProof ? (
                        <button
                          onClick={() => setSelectedProofOrder(order)}
                          className="px-2 py-1 rounded bg-cyan-950/60 border border-cyan-800/50 text-cyan-300 hover:text-cyan-200 flex items-center gap-1 cursor-pointer text-[10px]"
                        >
                          <FileImage className="w-3 h-3" />
                          <span>View Proof</span>
                        </button>
                      ) : (
                        <span className="text-slate-600">None</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <select
                          value={order.status}
                          disabled={updatingOrderId === order.orderNumber}
                          onChange={(e) => handleStatusChange(order.orderNumber, e.target.value as OrderStatus)}
                          className="bg-black/60 border border-slate-700 rounded px-2 py-1 text-slate-200 text-[11px] focus:outline-none focus:border-purple-500 cursor-pointer"
                        >
                          <option value="Pending Payment">Pending Payment</option>
                          <option value="Proof Uploaded">Proof Uploaded</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Completed">Completed</option>
                        </select>

                        {order.status !== 'Approved' && (
                          <button
                            onClick={() => handleStatusChange(order.orderNumber, 'Approved')}
                            className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            <span>Quick Approve</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Payment Proof Review Queue */}
      {activeTab === 'proofs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-mono font-bold text-sm text-slate-200">
              PAYMENT PROOF VERIFICATION QUEUE
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Inspect uploaded screenshots and issue cryptographic approval or rejection
            </span>
          </div>

          {ordersWithProofs.length === 0 ? (
            <div className="p-8 rounded-xl bg-[#090d16] border border-slate-800 text-center font-mono text-slate-500">
              No orders with uploaded payment screenshots found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ordersWithProofs.map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-xl bg-[#090d16] border border-cyan-500/30 space-y-3 font-mono text-xs"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div>
                      <span className="text-slate-400 block text-[10px]">ORDER ID</span>
                      <span className="font-bold text-cyan-300 text-sm">{order.orderNumber}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px]">AMOUNT</span>
                      <span className="font-bold text-emerald-400 text-sm">{order.amount} USDT</span>
                    </div>
                  </div>

                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>User:</span>
                    <span className="text-slate-200">{order.userEmail}</span>
                  </div>

                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>File:</span>
                    <span className="text-cyan-300 truncate max-w-[200px]">
                      {order.paymentProof?.fileName}
                    </span>
                  </div>

                  {/* Image Preview */}
                  <div className="rounded-lg overflow-hidden border border-slate-800 bg-black max-h-52 relative group">
                    <img
                      src={order.paymentProof?.fileData}
                      alt="Payment proof screenshot"
                      className="w-full h-auto object-contain max-h-52 mx-auto"
                    />
                    <button
                      onClick={() => setSelectedProofOrder(order)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-cyan-300 transition-opacity font-bold"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Inspect Full Size</span>
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => handleStatusChange(order.orderNumber, 'Approved')}
                      className="flex-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>APPROVE PROOF</span>
                    </button>
                    <button
                      onClick={() => handleStatusChange(order.orderNumber, 'Rejected')}
                      className="flex-1 py-2 rounded-lg bg-red-950 hover:bg-red-900 border border-red-700 text-red-300 font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>REJECT PROOF</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Products Management */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-mono font-bold text-sm text-slate-200">
              PRODUCT CATALOG ({products.length} ITEMS)
            </h3>
            <button
              onClick={() => {
                setEditingProduct({
                  name: '',
                  category: 'Security Research Toolkit',
                  price: 99,
                  currency: 'USDT',
                  description: '',
                  features: ['Laboratory diagnostics'],
                  featured: false
                });
                setIsCreatingProduct(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Toolkit</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#090d16]">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#05070c] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Code / ID</th>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price (USDT)</th>
                  <th className="p-3">Featured</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3 text-cyan-400">{prod.productCode || prod.id}</td>
                    <td className="p-3 font-bold text-slate-200">{prod.name}</td>
                    <td className="p-3 text-slate-400">{prod.category}</td>
                    <td className="p-3 text-emerald-400 font-extrabold">{prod.price} USDT</td>
                    <td className="p-3">
                      {prod.featured ? (
                        <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px]">
                          FEATURED
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingProduct(prod);
                            setIsCreatingProduct(false);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors cursor-pointer"
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
                          className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
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

      {/* Tab 4: Activity Audit Logs */}
      {activeTab === 'logs' && (
        <div className="p-4 rounded-2xl bg-[#06090e] border border-cyan-500/30 font-mono">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
              <Terminal className="w-4 h-4" />
              <span>TERMINAL TELEMETRY & ACTIVITY AUDIT TRAIL</span>
            </span>
            <span>SHOWING LAST {activityLogs.length} EVENTS</span>
          </div>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-2 text-xs">
            {activityLogs.map((log) => (
              <div
                key={log.id}
                className="p-2 rounded bg-black/40 border border-slate-800/80 flex items-start justify-between gap-3 text-[11px]"
              >
                <div className="flex items-start gap-2">
                  <span className="text-cyan-500 font-bold">[{log.category}]</span>
                  <span className="text-slate-400 font-semibold">{log.action}:</span>
                  <span className="text-slate-200">{log.details}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 text-slate-500 text-[10px]">
                  <span>by {log.actor}</span>
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Edit or Create Product */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#090d16] border border-cyan-500/50 rounded-2xl max-w-lg w-full p-6 relative font-mono text-xs">
            <button
              onClick={() => setEditingProduct(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-4">
              {isCreatingProduct ? 'Add Software Toolkit' : `Edit ${editingProduct.name}`}
            </h3>

            <form onSubmit={handleSaveProductForm} className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full bg-black/60 border border-slate-700 rounded-lg p-2 text-white focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.category || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full bg-black/60 border border-slate-700 rounded-lg p-2 text-white focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Price (USDT)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editingProduct.price || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                    className="w-full bg-black/60 border border-slate-700 rounded-lg p-2 text-emerald-400 font-bold focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full bg-black/60 border border-slate-700 rounded-lg p-2 text-white focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Features (comma separated)</label>
                <input
                  type="text"
                  value={editingProduct.features ? editingProduct.features.join(', ') : ''}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      features: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                    })
                  }
                  className="w-full bg-black/60 border border-slate-700 rounded-lg p-2 text-white focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={!!editingProduct.featured}
                  onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                  className="accent-cyan-400"
                />
                <label htmlFor="featured" className="text-slate-300">
                  Mark as FEATURED listing
                </label>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold"
                >
                  Save Toolkit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Full Size Proof Review */}
      {selectedProofOrder && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#090d16] border border-cyan-500/50 rounded-2xl max-w-2xl w-full p-6 relative font-mono text-xs max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedProofOrder(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">
              Payment Screenshot Verification: {selectedProofOrder.orderNumber}
            </h3>
            <p className="text-slate-400 mb-4 text-[11px]">
              Review the transaction receipt submitted for {selectedProofOrder.amount} USDT.
            </p>

            <div className="p-2 rounded-xl bg-black border border-slate-800 mb-4">
              <img
                src={selectedProofOrder.paymentProof?.fileData}
                alt="Full payment proof"
                className="w-full h-auto max-h-[55vh] object-contain rounded"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => handleStatusChange(selectedProofOrder.orderNumber, 'Approved')}
                className="py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>APPROVE & DISPATCH LICENSE</span>
              </button>

              <button
                onClick={() => handleStatusChange(selectedProofOrder.orderNumber, 'Rejected')}
                className="py-2.5 rounded-lg bg-red-950 hover:bg-red-900 border border-red-700 text-red-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>REJECT PROOF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
