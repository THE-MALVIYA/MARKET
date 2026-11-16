import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { Order, OrderStatus } from '../types';
import {
  Package,
  CheckCircle2,
  AlertCircle,
  FileImage,
  ExternalLink,
  UploadCloud,
  Eye,
  X,
  Send
} from 'lucide-react';

export const OrdersView: React.FC = () => {
  const { orders, setActiveTab, setActiveOrderNumber } = useMarket();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [inspectOrder, setInspectOrder] = useState<Order | null>(null);
  const [previewProofImage, setPreviewProofImage] = useState<string | null>(null);

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'ALL') return true;
    return o.status.toLowerCase().replace(/\s+/g, '-') === filterStatus.toLowerCase();
  });

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
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50';
      case 'Proof Uploaded':
      case 'Under Review':
        return 'bg-emerald-950/30 text-emerald-400 border-emerald-500/40';
      case 'Rejected':
        return 'bg-red-950/60 text-red-300 border-red-500/50';
      default:
        return 'bg-amber-950/60 text-amber-300 border-amber-500/50';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#1d271d]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-mono font-bold text-white flex items-center gap-2.5">
            <Package className="w-6 h-6 text-emerald-400" />
            <span>ESCROW ORDERS &amp; LICENSES</span>
          </h1>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            Cryptographic order logs, TRC-20 verification status, and encrypted delivery links.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['ALL', 'Pending Payment', 'Proof Uploaded', 'Under Review', 'Approved', 'Rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 font-mono text-xs border transition-colors cursor-pointer whitespace-nowrap ${
              filterStatus === status
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/50 font-semibold'
                : 'bg-[#070907] text-zinc-400 border-[#1d271d] hover:border-[#2e3d2e] hover:text-zinc-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="p-12 bg-[#070907] border border-[#1d271d] text-center font-mono">
          <Package className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-zinc-200 mb-1">No Escrow Orders Found</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-4">
            No orders match the selected escrow status filter.
          </p>
          <button
            onClick={() => setActiveTab('marketplace')}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-colors cursor-pointer"
          >
            Browse Directory
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
                className="p-5 bg-[#070907] border border-[#1d271d] hover:border-emerald-500/35 transition-colors"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#182018]">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-sm font-bold text-emerald-400">
                      {order.orderNumber}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 border font-semibold ${getStatusBadgeClass(
                        order.status
                      )}`}
                    >
                      {order.status.toUpperCase()}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500 tabular-nums">
                      {new Date(order.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-base text-emerald-400 tabular-nums">
                      {order.amount.toLocaleString()} USDT
                    </span>
                    <button
                      onClick={() => setInspectOrder(order)}
                      className="px-3 py-1 bg-[#0b0e0b] hover:bg-[#131a13] text-emerald-400 border border-[#243224] font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                  </div>
                </div>

                <div className="py-3 flex flex-wrap gap-2.5">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-2.5 py-1.5 bg-[#040504] border border-[#1a221a] text-xs font-mono"
                    >
                      <img
                        src={item.image}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 object-cover"
                      />
                      <span className="text-zinc-200">{item.name}</span>
                      <span className="text-zinc-500 tabular-nums">x{item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-[#161e16]">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase mb-2">
                    Escrow &amp; Fulfillment Pipeline:
                  </div>

                  {isRejected ? (
                    <div className="p-2.5 bg-red-950/30 border border-red-500/40 flex items-center gap-2 text-xs font-mono text-red-300">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>
                        Order rejected. Payment transaction proof verification could not be confirmed.
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
                            className={`p-2 border text-center font-mono text-[11px] transition-colors ${
                              isCurrent
                                ? 'bg-emerald-500/15 border-emerald-400 text-emerald-300 font-bold'
                                : isPastOrCurrent
                                ? 'bg-[#0b120b] border-emerald-500/40 text-emerald-400'
                                : 'bg-[#040504] border-[#182018] text-zinc-600'
                            }`}
                          >
                            <div className="flex items-center justify-center gap-1 mb-0.5">
                              {isPastOrCurrent ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <span className="text-[10px] text-zinc-600">[{idx + 1}]</span>
                              )}
                              <span>Step {idx + 1}</span>
                            </div>
                            <div className="truncate">{stage}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {order.status === 'Pending Payment' && !order.paymentProof && (
                    <div className="mt-3 flex items-center justify-between p-2.5 bg-[#0e0c06] border border-amber-500/35 text-xs font-mono">
                      <span className="text-amber-300">
                        Transaction proof upload required to initiate verification.
                      </span>
                      <button
                        onClick={() => {
                          setActiveOrderNumber(order.orderNumber);
                          setActiveTab('checkout');
                        }}
                        className="px-3 py-1 bg-amber-500 text-black font-bold hover:bg-amber-400 transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Upload Proof</span>
                      </button>
                    </div>
                  )}

                  {order.paymentProof && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between p-2.5 bg-[#040504] border border-[#1d271d] text-xs font-mono">
                        <div className="flex items-center gap-2 text-emerald-400">
                          <FileImage className="w-4 h-4" />
                          <span>Proof Attached: {order.paymentProof.fileName}</span>
                        </div>
                        <button
                          onClick={() => setPreviewProofImage(order.paymentProof?.fileData || null)}
                          className="text-emerald-400 hover:text-emerald-300 underline cursor-pointer text-[11px]"
                        >
                          Inspect Screenshot
                        </button>
                      </div>

                      <div className="p-3 bg-[#080c08] border border-emerald-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 bg-emerald-500 flex items-center justify-center text-black flex-shrink-0">
                            <Send className="w-3.5 h-3.5 fill-black text-black" />
                          </div>
                          <div>
                            <span className="text-[10px] font-mono font-bold text-emerald-400 block uppercase">
                              Product Files &amp; Key Bot
                            </span>
                            <span className="text-white font-mono font-bold text-xs">
                              Telegram: @getfilex_bot
                            </span>
                          </div>
                        </div>

                        <a
                          href="https://t.me/getfilex_bot"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full sm:w-auto px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-colors no-underline"
                        >
                          <Send className="w-3 h-3 fill-black text-black" />
                          <span>Open Bot</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Audit Modal */}
      {inspectOrder && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#070907] border border-emerald-500/40 max-w-xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setInspectOrder(null)}
              className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2 font-mono text-xs">
              <span className="text-emerald-400 font-bold">ORDER AUDIT LOG</span>
              <span className="text-zinc-600">·</span>
              <span className="text-zinc-400">{inspectOrder.orderNumber}</span>
            </div>

            <h3 className="text-xl font-mono font-bold text-white mb-4">
              Escrow Manifest &amp; Trail
            </h3>

            <div className="space-y-3 font-mono text-xs mb-4">
              <div className="p-3 bg-[#040504] border border-[#1a221a] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Total Amount:</span>
                  <span className="text-emerald-400 font-bold tabular-nums">{inspectOrder.amount.toLocaleString()} USDT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Status:</span>
                  <span className="text-emerald-400 font-bold">{inspectOrder.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Settlement Address:</span>
                  <span className="text-zinc-300 truncate max-w-[220px]">{inspectOrder.paymentAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Created At:</span>
                  <span className="text-zinc-400 tabular-nums">{new Date(inspectOrder.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <h4 className="text-zinc-500 uppercase text-[10px] mb-1.5">Audit Trail:</h4>
                <div className="space-y-1.5">
                  {inspectOrder.statusHistory.map((step, idx) => (
                    <div key={idx} className="p-2 bg-[#040504] border border-[#1a221a] text-[11px]">
                      <div className="flex justify-between text-zinc-200 font-bold">
                        <span>{step.status}</span>
                        <span className="text-[10px] text-zinc-500 tabular-nums">{new Date(step.timestamp).toLocaleTimeString()}</span>
                      </div>
                      {step.note && <div className="text-zinc-400 mt-0.5">{step.note}</div>}
                    </div>
                  ))}
                </div>
              </div>

              {inspectOrder.paymentProof && (
                <div>
                  <h4 className="text-zinc-500 uppercase text-[10px] mb-1.5">Uploaded Screenshot:</h4>
                  <div className="overflow-hidden border border-[#222e22] bg-black max-h-48">
                    <img
                      src={inspectOrder.paymentProof.fileData}
                      alt="Payment proof"
                      className="w-full h-auto object-contain"
                    />
                  </div>
                </div>
              )}

              {inspectOrder.paymentProof && (
                <div className="p-3.5 bg-[#080c08] border border-emerald-500/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                      Files Delivery Bot:
                    </span>
                    <span className="text-white font-mono font-bold text-xs">
                      @getfilex_bot
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-300 font-sans">
                    Payment proof received. Open the bot on Telegram to receive your files &amp; key:
                  </p>
                  <a
                    href="https://t.me/getfilex_bot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-colors no-underline"
                  >
                    <Send className="w-3.5 h-3.5 fill-black text-black" />
                    <span>Open Telegram Bot (@getfilex_bot)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#182018]">
              <button
                onClick={() => setInspectOrder(null)}
                className="px-4 py-2 bg-[#0c100c] hover:bg-[#141c14] border border-[#222e22] text-xs font-mono text-zinc-200 cursor-pointer"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {previewProofImage && (
        <div
          onClick={() => setPreviewProofImage(null)}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="max-w-2xl w-full p-2 relative bg-[#070907] border border-emerald-500/40">
            <img src={previewProofImage} alt="Payment Proof" className="w-full h-auto max-h-[80vh] object-contain" />
            <div className="text-center text-xs font-mono text-zinc-400 mt-2">Click anywhere to close</div>
          </div>
        </div>
      )}
    </div>
  );
};
