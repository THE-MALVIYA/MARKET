import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { Order, OrderStatus } from '../types';
import {
  Package,
  CheckCircle2,
  AlertCircle,
  Eye,
  X,
  SearchCheck,
  Lock
} from 'lucide-react';

export const OrdersView: React.FC = () => {
  const { orders, currentUser, setAuthModalOpen, setActiveTab, setActiveOrderNumber } = useMarket();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [inspectOrder, setInspectOrder] = useState<Order | null>(null);

  if (!currentUser) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="p-8 rounded-xl bg-[#11161D] border border-[#1E2936] space-y-4">
          <Lock className="w-10 h-10 text-[#00D69A] mx-auto" />
          <h2 className="text-xl font-bold text-[#F4F7F6]">Sign in to View Orders</h2>
          <p className="text-xs text-[#8F9CA8] max-w-md mx-auto">
            Order ledgers, blockchain confirmation details, and issued license manifests are scoped strictly to authenticated accounts.
          </p>
          <button
            onClick={() => setAuthModalOpen(true)}
            className="px-5 py-2.5 rounded-lg bg-[#00D69A] hover:bg-[#0EA5A4] text-[#07090B] font-semibold text-xs cursor-pointer"
          >
            Sign In / Create Account
          </button>
        </div>
      </div>
    );
  }

  const normalizeStatus = (s: OrderStatus): string => {
    if (s === 'Pending Payment') return 'Awaiting Payment';
    if (s === 'Proof Uploaded') return 'Payment Detected';
    if (s === 'Under Review') return 'Confirming on Blockchain';
    if (s === 'Approved' || s === 'Completed') return 'Payment Confirmed';
    if (s === 'Rejected') return 'Payment Failed';
    return s;
  };

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'ALL') return true;
    return normalizeStatus(o.status) === filterStatus;
  });

  const timelineStages = [
    'Awaiting Payment',
    'Payment Detected',
    'Confirming on Blockchain',
    'Payment Confirmed'
  ];

  const getBadgeClass = (status: OrderStatus) => {
    const norm = normalizeStatus(status);
    if (norm === 'Payment Confirmed') {
      return 'bg-[#00D69A]/15 text-[#00D69A] border-[#00D69A]/50';
    }
    if (norm === 'Payment Failed' || norm === 'Payment Expired') {
      return 'bg-red-950/60 text-red-300 border-red-600/60';
    }
    if (norm === 'Confirming on Blockchain' || norm === 'Payment Detected') {
      return 'bg-[#0EA5A4]/15 text-[#0EA5A4] border-[#0EA5A4]/40';
    }
    return 'bg-[#E5B84B]/15 text-[#E5B84B] border-[#E5B84B]/40';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-[#1E2936]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F4F7F6] flex items-center gap-2.5">
            <Package className="w-6 h-6 text-[#00D69A]" />
            <span>Orders &amp; Verification Status</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#8F9CA8] mt-1">
            Track Tron TRC-20 payment confirmations and software license provisioning.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {[
          'ALL',
          'Awaiting Payment',
          'Payment Detected',
          'Confirming on Blockchain',
          'Payment Confirmed',
          'Payment Failed',
          'Payment Expired'
        ].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
              filterStatus === status
                ? 'bg-[#00D69A]/15 text-[#00D69A] border-[#00D69A]/50 font-semibold'
                : 'bg-[#11161D] text-[#8F9CA8] border-[#1E2936] hover:text-[#F4F7F6]'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="p-12 rounded-xl bg-[#11161D] border border-[#1E2936] text-center">
          <Package className="w-10 h-10 text-[#8F9CA8] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#F4F7F6] mb-1">No Matching Orders</h3>
          <p className="text-xs text-[#8F9CA8] max-w-sm mx-auto mb-4">
            Orders placed through your DEEPSEEK account will appear here.
          </p>
          <button
            onClick={() => setActiveTab('products')}
            className="px-4 py-2 rounded-lg bg-[#00D69A] hover:bg-[#0EA5A4] text-[#07090B] text-xs font-semibold cursor-pointer"
          >
            Explore Products
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const normStatus = normalizeStatus(order.status);
            const currentIdx = timelineStages.indexOf(normStatus);
            const isErrorState = normStatus === 'Payment Failed' || normStatus === 'Payment Expired';

            return (
              <div
                key={order.id}
                className="p-5 rounded-xl bg-[#11161D] border border-[#1E2936] space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#1E2936]">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-sm font-bold text-[#00D69A]">
                      {order.orderNumber}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${getBadgeClass(
                        order.status
                      )}`}
                    >
                      {normStatus.toUpperCase()}
                    </span>
                    <span className="text-[11px] font-mono text-[#8F9CA8] tabular-nums">
                      {new Date(order.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-base text-[#F4F7F6] tabular-nums">
                      {order.amount.toLocaleString()} <span className="text-xs text-[#00D69A]">USDT</span>
                    </span>
                    <button
                      onClick={() => setInspectOrder(order)}
                      className="px-3 py-1.5 rounded-lg bg-[#0D1116] hover:bg-[#151C24] text-[#00D69A] border border-[#1E2936] text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#0D1116] border border-[#1E2936] text-xs"
                    >
                      <img src={item.image} alt="" className="w-7 h-7 rounded object-cover" />
                      <span className="text-[#F4F7F6] font-medium">{item.name}</span>
                      <span className="font-mono text-[#8F9CA8] tabular-nums">x{item.quantity}</span>
                    </div>
                  ))}
                </div>

                {isErrorState ? (
                  <div className="p-3 rounded-lg bg-red-950/30 border border-red-600/40 flex items-center gap-2 text-xs text-red-200">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>
                      {order.blockchainVerification?.message ||
                        `Order entered ${normStatus}. Submit a valid TXID or open a support ticket.`}
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {timelineStages.map((stage, idx) => {
                      const reached = currentIdx >= idx;
                      return (
                        <div
                          key={stage}
                          className={`p-2.5 rounded-lg border text-center font-mono text-[11px] ${
                            reached
                              ? 'bg-[#00D69A]/12 border-[#00D69A]/50 text-[#00D69A] font-semibold'
                              : 'bg-[#0D1116] border-[#1E2936] text-[#8F9CA8]/65'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1 mb-0.5">
                            {reached && <CheckCircle2 className="w-3 h-3" />}
                            <span>Step {idx + 1}</span>
                          </div>
                          <div className="truncate">{stage}</div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {normStatus === 'Awaiting Payment' && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-[#0D1116] border border-[#E5B84B]/40 text-xs">
                    <span className="text-[#E5B84B]">
                      Submit your Tron TRC-20 transaction hash (TXID) to verify blockchain settlement.
                    </span>
                    <button
                      onClick={() => {
                        setActiveOrderNumber(order.orderNumber);
                        setActiveTab('checkout');
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-[#E5B84B] text-[#07090B] font-semibold flex items-center gap-1.5 cursor-pointer self-start"
                    >
                      <SearchCheck className="w-3.5 h-3.5" />
                      <span>Submit TXID</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {inspectOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#11161D] border border-[#1E2936] rounded-xl max-w-xl w-full p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl">
            <button
              onClick={() => setInspectOrder(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[#8F9CA8] hover:text-[#F4F7F6] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-[#F4F7F6] mb-4">
              Transaction Details · {inspectOrder.orderNumber}
            </h3>

            <div className="space-y-3 font-mono text-xs mb-4">
              <div className="p-3.5 rounded-lg bg-[#0D1116] border border-[#1E2936] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#8F9CA8]">Total Amount</span>
                  <span className="text-[#00D69A] font-bold tabular-nums">
                    {inspectOrder.amount.toLocaleString()} USDT
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8F9CA8]">Status</span>
                  <span className="text-[#F4F7F6] font-bold">{normalizeStatus(inspectOrder.status)}</span>
                </div>
                {inspectOrder.txHash && (
                  <div className="pt-1 border-t border-[#1E2936]">
                    <span className="text-[#8F9CA8] block">Transaction Hash</span>
                    <span className="text-[#0EA5A4] break-all">{inspectOrder.txHash}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                {inspectOrder.statusHistory.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-[#0D1116] border border-[#1E2936] text-[11px]"
                  >
                    <div className="flex justify-between text-[#F4F7F6] font-bold">
                      <span>{step.status}</span>
                      <span className="text-[10px] text-[#8F9CA8] tabular-nums">
                        {new Date(step.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {step.note && <div className="text-[#8F9CA8] mt-0.5">{step.note}</div>}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#1E2936]">
              <button
                onClick={() => setInspectOrder(null)}
                className="px-4 py-2 rounded-lg bg-[#0D1116] border border-[#1E2936] text-xs font-medium text-[#F4F7F6] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
