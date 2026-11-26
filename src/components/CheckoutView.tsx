import React, { useState, useEffect, useRef } from 'react';
import { useMarket } from '../context/MarketContext';
import { QRCodeDisplay } from './QRCodeDisplay';
import { ProductLiveVisual } from './ProductLiveVisual';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  ChevronRight,
  Clock,
  Tag,
  ShieldCheck,
  SearchCheck,
  UploadCloud,
  FileImage,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CheckoutView: React.FC = () => {
  const {
    cart,
    cartTotal,
    createOrder,
    activeOrderNumber,
    orders,
    submitTxVerification,
    uploadPaymentProof,
    validateDiscountCode,
    paymentConfig,
    currentUser,
    setAuthModalOpen,
    setActiveTab,
    addToast
  } = useMarket();

  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountAmount: number;
    description?: string;
  } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isGeneratingOrder, setIsGeneratingOrder] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  const [txHashInput, setTxHashInput] = useState('');
  const [isVerifyingTx, setIsVerifyingTx] = useState(false);

  const [selectedFile, setSelectedFile] = useState<{
    fileName: string;
    fileSize: number;
    fileType: string;
    fileData: string;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [timeRemainingLabel, setTimeRemainingLabel] = useState<string>('');

  const currentOrder = activeOrderNumber
    ? orders.find((o) => o.orderNumber === activeOrderNumber) || createdOrder
    : createdOrder;

  const depositAddress =
    currentOrder?.paymentAddress || paymentConfig?.receivingAddress || '';
  const networkName = paymentConfig?.network || 'Tron TRC-20';

  useEffect(() => {
    if (!currentOrder?.expiresAt) {
      setTimeRemainingLabel('');
      return;
    }
    const tick = () => {
      const diffMs = Date.parse(currentOrder.expiresAt) - Date.now();
      if (diffMs <= 0) {
        setTimeRemainingLabel('Expired');
        return;
      }
      const mins = Math.floor(diffMs / 60000);
      const secs = Math.floor((diffMs % 60000) / 1000);
      setTimeRemainingLabel(`${mins}m ${String(secs).padStart(2, '0')}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [currentOrder?.expiresAt]);

  const handleApplyPromo = async () => {
    setPromoError(null);
    if (!promoInput.trim()) return;
    const res = await validateDiscountCode(promoInput.trim(), cartTotal);
    if (!res.valid) {
      setPromoError(res.message || 'Invalid code');
      setAppliedPromo(null);
      return;
    }
    setAppliedPromo({
      code: res.code!,
      discountAmount: res.discountAmount,
      description: res.description
    });
    addToast({
      type: 'success',
      title: 'Discount Applied',
      message: `${res.code} saved ${res.discountAmount.toLocaleString()} USDT`
    });
  };

  const finalCartAmount = Math.max(1, cartTotal - (appliedPromo?.discountAmount || 0));

  const handleInitiateOrder = async () => {
    if (cart.length === 0) return;
    setIsGeneratingOrder(true);
    const order = await createOrder(cart, appliedPromo?.code);
    if (order) {
      setCreatedOrder(order);
    }
    setIsGeneratingOrder(false);
  };

  const handleVerifyTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrder) return;
    if (!txHashInput.trim()) return;
    setIsVerifyingTx(true);
    const updated = await submitTxVerification(currentOrder.orderNumber, txHashInput.trim());
    setIsVerifyingTx(false);
    if (updated) {
      setCreatedOrder(updated);
      if (updated.status === 'Payment Confirmed') {
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#00D69A', '#0EA5A4', '#F4F7F6']
          });
        } catch {
          // ignore
        }
      }
    }
  };

  const handleFileChange = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      addToast({ type: 'error', title: 'File Too Large', message: 'Maximum file size is 5MB.' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedFile({
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileData: reader.result as string
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitProof = async () => {
    if (!selectedFile || !currentOrder) return;
    setIsUploading(true);
    const updated = await uploadPaymentProof(currentOrder.orderNumber, selectedFile);
    setIsUploading(false);
    if (updated) setCreatedOrder(updated);
  };

  if (!currentOrder && cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="p-8 rounded-xl bg-[#11161D] border border-[#1E2936]">
          <AlertTriangle className="w-10 h-10 text-[#E5B84B] mx-auto mb-3" />
          <h2 className="text-xl font-bold text-[#F4F7F6] mb-2">No Active Checkout</h2>
          <p className="text-sm text-[#8F9CA8] max-w-md mx-auto mb-6">
            Add software licenses to your cart before proceeding to USDT blockchain settlement.
          </p>
          <button
            onClick={() => setActiveTab('products')}
            className="px-6 py-2.5 rounded-lg bg-[#00D69A] hover:bg-[#0EA5A4] text-[#07090B] font-semibold text-xs cursor-pointer"
          >
            Explore Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-2 text-xs text-[#8F9CA8] mb-6">
        <button onClick={() => setActiveTab('home')} className="hover:text-[#00D69A] cursor-pointer">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-[#1E2936]" />
        <button onClick={() => setActiveTab('products')} className="hover:text-[#00D69A] cursor-pointer">
          Products
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-[#1E2936]" />
        <span className="text-[#00D69A] font-medium">Crypto Checkout</span>
      </div>

      <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-[#1E2936]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F4F7F6]">
            USDT Settlement &amp; Blockchain Verification
          </h1>
          <p className="text-xs sm:text-sm text-[#8F9CA8] mt-1">
            Transfer exact USDT on {networkName} and submit your transaction hash (TXID) for ledger verification.
          </p>
        </div>

        {currentOrder && (
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 rounded-lg bg-[#11161D] border border-[#1E2936] text-right">
              <span className="text-[10px] font-mono text-[#8F9CA8] block uppercase">Order Reference</span>
              <span className="font-mono text-sm font-bold text-[#00D69A]">{currentOrder.orderNumber}</span>
            </div>
            {timeRemainingLabel && currentOrder.status !== 'Payment Confirmed' && (
              <div className="px-3.5 py-2 rounded-lg bg-[#11161D] border border-[#1E2936] text-right">
                <span className="text-[10px] font-mono text-[#8F9CA8] flex items-center justify-end gap-1 uppercase">
                  <Clock className="w-3 h-3 text-[#E5B84B]" /> Window
                </span>
                <span className="font-mono text-sm font-bold text-[#E5B84B] tabular-nums">
                  {timeRemainingLabel}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Order Summary / Promo / Instructions */}
        <div className="lg:col-span-6 space-y-6">
          {!currentOrder ? (
            <div className="p-6 rounded-xl bg-[#11161D] border border-[#1E2936] space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E2936]">
                <h2 className="text-sm font-bold text-[#F4F7F6]">
                  Order Summary ({cart.length} {cart.length === 1 ? 'Suite' : 'Suites'})
                </h2>
                <span className="text-[11px] font-mono text-[#0EA5A4]">{networkName}</span>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-3 rounded-lg bg-[#0D1116] border border-[#1E2936] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <ProductLiveVisual product={item.product} compact className="w-10 h-10 shrink-0" />
                      <div className="truncate">
                        <span className="text-[#F4F7F6] font-semibold block truncate">
                          {item.product.name}
                        </span>
                        <span className="text-[10px] font-mono text-[#8F9CA8] tabular-nums">
                          Qty: {item.quantity} · {item.product.version || 'LTS'}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-[#00D69A] font-bold ml-2 tabular-nums">
                      {(item.product.price * item.quantity).toLocaleString()} USDT
                    </span>
                  </div>
                ))}
              </div>

              {/* Promo Code Input */}
              <div className="pt-2 border-t border-[#1E2936]">
                <label className="text-[11px] font-medium text-[#8F9CA8] mb-1.5 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#0EA5A4]" />
                  <span>Promo / Discount Code</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Enter discount code"
                    className="flex-1 rounded-lg bg-[#0D1116] border border-[#1E2936] px-3 py-2 text-xs font-mono text-[#F4F7F6] uppercase focus:border-[#00D69A] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-4 py-2 rounded-lg bg-[#0D1116] hover:bg-[#151C24] border border-[#1E2936] text-xs font-semibold text-[#00D69A] cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {promoError && <p className="text-[11px] text-red-400 mt-1">{promoError}</p>}
                {appliedPromo && (
                  <p className="text-[11px] text-[#00D69A] mt-1 font-mono">
                    {appliedPromo.code} applied: -{appliedPromo.discountAmount.toLocaleString()} USDT
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-[#1E2936] space-y-1.5 text-xs">
                <div className="flex justify-between text-[#8F9CA8]">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums">{cartTotal.toLocaleString()} USDT</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between text-[#00D69A]">
                    <span>Discount ({appliedPromo.code})</span>
                    <span className="font-mono tabular-nums">
                      -{appliedPromo.discountAmount.toLocaleString()} USDT
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-[#1E2936]">
                  <span className="font-semibold text-[#F4F7F6]">Total Due</span>
                  <span className="font-mono font-bold text-xl text-[#00D69A] tabular-nums">
                    {finalCartAmount.toLocaleString()} USDT
                  </span>
                </div>
              </div>

              {!currentUser ? (
                <div className="p-4 rounded-xl bg-[#0D1116] border border-[#E5B84B]/40 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#E5B84B]">
                    <Lock className="w-4 h-4" />
                    <span>Sign in required to bind license keys to your account</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAuthModalOpen(true)}
                    className="w-full py-2.5 rounded-lg bg-[#00D69A] hover:bg-[#0EA5A4] text-[#07090B] font-bold text-xs cursor-pointer"
                  >
                    Sign In or Create Account
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleInitiateOrder}
                  disabled={isGeneratingOrder}
                  className="w-full py-3 px-4 rounded-lg bg-[#00D69A] hover:bg-[#0EA5A4] text-[#07090B] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isGeneratingOrder ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating Order...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate Settlement Order</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-[#11161D] border border-[#1E2936] space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E2936]">
                <h2 className="text-sm font-bold text-[#F4F7F6]">Order &amp; Payment Status</h2>
                <span
                  className={`text-[11px] font-mono px-2.5 py-0.5 rounded border font-semibold ${
                    currentOrder.status === 'Payment Confirmed' || currentOrder.status === 'Approved'
                      ? 'bg-[#00D69A]/15 text-[#00D69A] border-[#00D69A]/40'
                      : currentOrder.status === 'Payment Failed' ||
                        currentOrder.status === 'Payment Expired'
                      ? 'bg-red-950/60 text-red-300 border-red-700'
                      : 'bg-[#E5B84B]/15 text-[#E5B84B] border-[#E5B84B]/40'
                  }`}
                >
                  {currentOrder.status}
                </span>
              </div>

              <div className="space-y-2">
                {currentOrder.items.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center text-xs p-2.5 rounded-lg bg-[#0D1116] border border-[#1E2936]"
                  >
                    <span className="text-[#F4F7F6]">
                      {item.name} <span className="font-mono text-[#8F9CA8]">x{item.quantity}</span>
                    </span>
                    <span className="font-mono text-[#00D69A] font-bold tabular-nums">
                      {(item.price * item.quantity).toLocaleString()} USDT
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-lg bg-[#0D1116] border border-[#1E2936] space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-[#8F9CA8]">Total Settlement</span>
                  <span className="text-[#00D69A] font-bold tabular-nums">
                    {currentOrder.amount.toLocaleString()} USDT
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8F9CA8]">Network</span>
                  <span className="text-[#F4F7F6]">{networkName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8F9CA8]">Confirmations Needed</span>
                  <span className="text-[#F4F7F6]">
                    {paymentConfig?.requiredConfirmations || 19} Blocks
                  </span>
                </div>
              </div>

              {paymentConfig?.feeNotice && (
                <div className="p-3.5 rounded-lg bg-[#0D1116] border border-[#1E2936] text-[11px] text-[#8F9CA8] leading-relaxed">
                  <strong className="text-[#D1D9E0] block mb-1">Network Fee Notice</strong>
                  {paymentConfig.feeNotice}
                </div>
              )}

              {currentOrder.blockchainVerification && (
                <div className="p-4 rounded-lg bg-[#0D1116] border border-[#1E2936] space-y-2 text-xs">
                  <div className="font-semibold text-[#00D69A] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Blockchain Verification Log</span>
                  </div>
                  <p className="text-[#D1D9E0] text-[11px]">
                    {currentOrder.blockchainVerification.message}
                  </p>
                  <div className="font-mono text-[10px] text-[#8F9CA8] break-all">
                    TXID: {currentOrder.blockchainVerification.txHash}
                  </div>
                </div>
              )}

              {currentOrder.status === 'Payment Confirmed' && (
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="w-full py-2.5 rounded-lg bg-[#00D69A] hover:bg-[#0EA5A4] text-[#07090B] font-bold text-xs cursor-pointer"
                >
                  Open Dashboard to Download Files &amp; License Keys
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Live QR Code + TXID Verification Form */}
        <div className="lg:col-span-6 space-y-6">
          <QRCodeDisplay
            address={depositAddress}
            network={networkName}
            amount={currentOrder?.amount || finalCartAmount}
            orderNumber={currentOrder?.orderNumber}
          />

          <div className="p-6 rounded-xl bg-[#11161D] border border-[#1E2936] space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#1E2936]">
              <h3 className="font-semibold text-sm text-[#F4F7F6] flex items-center gap-2">
                <SearchCheck className="w-4 h-4 text-[#00D69A]" />
                <span>Submit Transaction Hash (TXID)</span>
              </h3>
              <span className="text-[10px] font-mono text-[#0EA5A4]">ON-CHAIN CHECK</span>
            </div>

            {currentOrder?.status === 'Payment Confirmed' ? (
              <div className="p-5 rounded-xl bg-[#0D1116] border border-[#00D69A]/50 text-center space-y-3">
                <CheckCircle2 className="w-8 h-8 text-[#00D69A] mx-auto" />
                <div className="font-bold text-[#F4F7F6] text-sm">Payment Confirmed on Blockchain</div>
                <p className="text-xs text-[#8F9CA8]">
                  Your software license keys and downloadable package manifests are now unlocked in your User Dashboard.
                </p>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="px-4 py-2 rounded-lg bg-[#00D69A] text-[#07090B] font-semibold text-xs cursor-pointer"
                >
                  Go to License Downloads
                </button>
              </div>
            ) : (
              <>
                <form onSubmit={handleVerifyTx} className="space-y-3">
                  <div>
                    <label className="block text-xs text-[#8F9CA8] mb-1.5">
                      Tron TRC-20 Transaction Hash (64 hex characters)
                    </label>
                    <input
                      type="text"
                      required
                      disabled={!currentOrder || isVerifyingTx}
                      value={txHashInput}
                      onChange={(e) => setTxHashInput(e.target.value)}
                      placeholder="Paste 64-character TRC-20 transaction hash..."
                      className="w-full rounded-lg bg-[#0D1116] border border-[#1E2936] px-3 py-2.5 text-xs font-mono text-[#F4F7F6] placeholder-[#8F9CA8]/60 focus:border-[#00D69A] focus:outline-none disabled:opacity-50"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!currentOrder || isVerifyingTx || !txHashInput.trim()}
                    className="w-full py-2.5 px-4 rounded-lg bg-[#00D69A] hover:bg-[#0EA5A4] text-[#07090B] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-45"
                  >
                    {isVerifyingTx ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Checking Tron Ledger...</span>
                      </>
                    ) : (
                      <>
                        <SearchCheck className="w-4 h-4" />
                        <span>Verify Transaction on Blockchain</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Optional Receipt Upload */}
                <div className="pt-4 border-t border-[#1E2936] space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-[#8F9CA8]">
                    <span>Optional: Attach Wallet Receipt Screenshot</span>
                    <span className="font-mono">PNG/JPG &le; 5MB</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".png,.jpg,.jpeg,.webp"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleFileChange(e.target.files[0]);
                      }}
                    />
                    <button
                      type="button"
                      disabled={!currentOrder}
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-2 px-3 rounded-lg bg-[#0D1116] border border-[#1E2936] hover:border-[#00D69A]/40 text-xs text-[#D1D9E0] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-45"
                    >
                      <FileImage className="w-3.5 h-3.5 text-[#0EA5A4]" />
                      <span className="truncate">
                        {selectedFile ? selectedFile.fileName : 'Choose Screenshot'}
                      </span>
                    </button>
                    {selectedFile && (
                      <button
                        type="button"
                        disabled={!currentOrder || isUploading}
                        onClick={handleSubmitProof}
                        className="px-3.5 py-2 rounded-lg bg-[#0D1116] border border-[#00D69A] text-[#00D69A] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>{isUploading ? 'Saving...' : 'Attach'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
