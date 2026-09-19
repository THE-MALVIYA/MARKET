import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { Order, OrderStatus } from '../types';
import {
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileImage,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  UploadCloud,
  Check,
  Eye,
  X
} from 'lucide-react';

export const OrdersView: React.FC = () => {
  const { orders, setActiveTab, setActiveOrderNumber, activeOrderNumber } = useMarket();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [inspectOrder, setInspectOrder] = useState<Order | null>(null);
  const [previewProofImage, setPreviewProofImage] = useState<string | null>(null);

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'ALL') return true;
    return o.status.toLowerCase().replace(/\s+/g, '-') === filterStatus.toLowerCase();
  });

  // Timeline stage helper
  const timelineStages: OrderStatus[] = [
    'Pending Payment',
    'Proof Uploaded',
    'Under Review',
    'Approved',
    'Completed'
  ];

  const getStageIndex = (status: OrderStatus) => {
    if (status === 'Rejected') return -1;
    return timelineStages.indexOf(status);
  };

  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case 'Approved':
      case 'Completed':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50';
      case 'Proof Uploaded':
      case 'Under Review':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50';
      case 'Rejected':
        return 'bg-red-950/80 text-red-300 border-red-500/50';
      default:
        return 'bg-amber-950/80 text-amber-300 border-amber-500/50';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-mono font-extrabold text-white flex items-center gap-2.5">
            <Package className="w-6 h-6 text-cyan-400" />
            <span>ORDER TRACKING & LICENSES</span>
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Real-time status tracking for developer toolkits, licenses, and transaction verifications.
          </p>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['ALL', 'Pending Payment', 'Proof Uploaded', 'Under Review', 'Approved', 'Rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-all cursor-pointer ${
              filterStatus === status
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                : 'bg-[#090d16] text-slate-400 border border-slate-800 hover:border-slate-700'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#090d16] border border-slate-800 text-center font-mono">
          <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-200 mb-1">No Orders Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            There are currently no orders matching this status filter.
          </p>
          <button
            onClick={() => setActiveTab('marketplace')}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-colors cursor-pointer"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const currentIdx = getStageIndex(order.status);
            const isRejected = order.status === 'Rejected';

            return (
              <div
                key={order.id}
                className="p-5 rounded-2xl bg-[#090d16]/90 border border-slate-800 hover:border-cyan-500/30 transition-all"
              >
                {/* Top Info Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-bold text-cyan-300">
                      {order.orderNumber}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${getStatusBadgeClass(
                        order.status
                      )}`}
                    >
                      {order.status.toUpperCase()}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-extrabold text-base text-emerald-400">
                      {order.amount} USDT
                    </span>
                    <button
                      onClick={() => setInspectOrder(order)}
                      className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 font-mono text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>
                  </div>
                </div>

                {/* Items in this order */}
                <div className="py-3 flex flex-wrap gap-3">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-black/50 border border-slate-800 text-xs font-mono"
                    >
                      <img
                        src={item.image}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded object-cover"
                      />
                      <span className="text-slate-200">{item.name}</span>
                      <span className="text-slate-500">x{item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Progress Timeline */}
                <div className="pt-3 border-t border-slate-800/60">
                  <div className="text-[10px] font-mono text-slate-500 uppercase mb-2">
                    Verification & Fulfillment Progress:
                  </div>

                  {isRejected ? (
                    <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-500/30 flex items-center gap-2 text-xs font-mono text-red-300">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span>
                        Order rejected by reviewer. Reason: Payment transaction proof verification could not be confirmed.
                      </span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {timelineStages.map((stage, idx) => {
                        const isPastOrCurrent = currentIdx >= idx;
                        const isCurrent = currentIdx === idx;

                        return (
                          <div
                            key={stage}
                            className={`p-2 rounded-lg border text-center font-mono text-[11px] transition-colors ${
                              isCurrent
                                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold'
                                : isPastOrCurrent
                                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                                : 'bg-black/30 border-slate-800/70 text-slate-600'
                            }`}
                          >
                            <div className="flex items-center justify-center gap-1 mb-0.5">
                              {isPastOrCurrent ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <span className="w-2 h-2 rounded-full bg-slate-700" />
                              )}
                              <span>Step {idx + 1}</span>
                            </div>
                            <div className="truncate">{stage}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Upload proof prompt if pending payment */}
                  {order.status === 'Pending Payment' && !order.paymentProof && (
                    <div className="mt-3 flex items-center justify-between p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/30 text-xs font-mono">
                      <span className="text-amber-300">
                        Payment proof required to initiate review.
                      </span>
                      <button
                        onClick={() => {
                          setActiveOrderNumber(order.orderNumber);
                          setActiveTab('checkout');
                        }}
                        className="px-3 py-1 rounded bg-amber-500 text-black font-bold hover:bg-amber-400 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Upload Proof</span>
                      </button>
                    </div>
                  )}

                  {/* Proof preview badge if proof uploaded */}
                  {order.paymentProof && (
                    <div className="mt-3 flex items-center justify-between p-2 rounded-lg bg-cyan-950/20 border border-cyan-500/20 text-xs font-mono">
                      <div className="flex items-center gap-2 text-cyan-300">
                        <FileImage className="w-4 h-4 text-cyan-400" />
                        <span>Proof Attached: {order.paymentProof.fileName}</span>
                      </div>
                      <button
                        onClick={() => setPreviewProofImage(order.paymentProof?.fileData || null)}
                        className="text-cyan-400 hover:text-cyan-200 underline cursor-pointer text-[11px]"
                      >
                        Inspect Screenshot
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Details Modal */}
      {inspectOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#090d16] border border-cyan-500/40 rounded-2xl max-w-xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setInspectOrder(null)}
              className="absolute top-4 right-4 p-1 rounded text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                ORDER AUDIT LOG
              </span>
              <span className="font-mono text-xs text-slate-400">{inspectOrder.orderNumber}</span>
            </div>

            <h3 className="text-xl font-mono font-bold text-white mb-4">
              Order Details & Manifest
            </h3>

            <div className="space-y-3 font-mono text-xs mb-4">
              <div className="p-3 rounded-lg bg-black/60 border border-slate-800 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Amount:</span>
                  <span className="text-emerald-400 font-bold">{inspectOrder.amount} USDT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Status:</span>
                  <span className="text-cyan-300 font-bold">{inspectOrder.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Settlement Address:</span>
                  <span className="text-slate-300 truncate max-w-[220px]">{inspectOrder.paymentAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Created At:</span>
                  <span className="text-slate-400">{new Date(inspectOrder.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Status transition history audit trail */}
              <div>
                <h4 className="text-slate-400 uppercase text-[10px] mb-1.5">Status Audit Trail:</h4>
                <div className="space-y-1.5">
                  {inspectOrder.statusHistory.map((step, idx) => (
                    <div key={idx} className="p-2 rounded bg-black/40 border border-slate-800 text-[11px]">
                      <div className="flex justify-between text-slate-300 font-bold">
                        <span>{step.status}</span>
                        <span className="text-[10px] text-slate-500">{new Date(step.timestamp).toLocaleTimeString()}</span>
                      </div>
                      {step.note && <div className="text-slate-400 mt-0.5">{step.note}</div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Proof Screenshot Preview */}
              {inspectOrder.paymentProof && (
                <div>
                  <h4 className="text-slate-400 uppercase text-[10px] mb-1.5">Uploaded Screenshot:</h4>
                  <div className="rounded-lg overflow-hidden border border-slate-700 bg-black max-h-48">
                    <img
                      src={inspectOrder.paymentProof.fileData}
                      alt="Payment proof"
                      className="w-full h-auto object-contain"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setInspectOrder(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screenshot Lightbox */}
      {previewProofImage && (
        <div
          onClick={() => setPreviewProofImage(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="max-w-2xl w-full p-2 relative bg-[#090d16] border border-cyan-500/40 rounded-xl">
            <img src={previewProofImage} alt="Payment Proof" className="w-full h-auto max-h-[80vh] object-contain rounded" />
            <div className="text-center text-xs font-mono text-slate-400 mt-2">Click anywhere to dismiss</div>
          </div>
        </div>
      )}
    </div>
  );
};
