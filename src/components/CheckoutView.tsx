import React, { useState, useRef } from 'react';
import { useMarket } from '../context/MarketContext';
import { QRCodeDisplay } from './QRCodeDisplay';
import {
  UploadCloud,
  FileImage,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Info,
  ChevronRight,
  Send,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CheckoutView: React.FC = () => {
  const {
    cart,
    cartTotal,
    createOrder,
    activeOrderNumber,
    orders,
    uploadPaymentProof,
    setActiveTab,
    addToast
  } = useMarket();

  const [paymentMethod, setPaymentMethod] = useState<'USDT_TRC20'>('USDT_TRC20');
  const [isGeneratingOrder, setIsGeneratingOrder] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  const [selectedFile, setSelectedFile] = useState<{
    fileName: string;
    fileSize: number;
    fileType: string;
    fileData: string;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [copiedBot, setCopiedBot] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentOrder = activeOrderNumber
    ? orders.find((o) => o.orderNumber === activeOrderNumber) || createdOrder
    : createdOrder;

  const depositAddress = 'TL9sU4A1ydN9AT2LTaC7P94K4y4BdAgDFx';

  const handleInitiateOrder = async () => {
    if (cart.length === 0) {
      addToast({
        type: 'warning',
        title: 'Cart is Empty',
        message: 'Please add items to your cart to proceed.'
      });
      return;
    }
    setIsGeneratingOrder(true);
    const order = await createOrder(cart);
    if (order) {
      setCreatedOrder(order);
    }
    setIsGeneratingOrder(false);
  };

  const handleFileChange = (file: File) => {
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      addToast({
        type: 'error',
        title: 'File Too Large',
        message: 'Screenshot exceeds 5MB size limit. Please upload a smaller file.'
      });
      return;
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      addToast({
        type: 'error',
        title: 'Invalid File Format',
        message: 'Only PNG, JPG, and JPEG image files are permitted.'
      });
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleSubmitProof = async () => {
    if (!selectedFile) {
      addToast({
        type: 'warning',
        title: 'No File Selected',
        message: 'Please choose or drag a payment screenshot.'
      });
      return;
    }

    const orderNum = currentOrder?.orderNumber;
    if (!orderNum) {
      addToast({
        type: 'error',
        title: 'Order Missing',
        message: 'Please generate an order reference first.'
      });
      return;
    }

    setIsUploading(true);
    const updated = await uploadPaymentProof(orderNum, selectedFile);
    setIsUploading(false);

    if (updated) {
      setUploadSuccess(true);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#22c55e', '#f59e0b', '#4ade80']
        });
      } catch {
        // ignore
      }
    }
  };

  if (!currentOrder && cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center font-mono">
        <div className="p-8 bg-[#070907] border border-[#1d271d]">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white mb-2">NO ACTIVE ESCROW SESSION</h2>
          <p className="text-sm text-zinc-400 max-w-md mx-auto mb-6">
            Your escrow queue has no pending packages ready for checkout.
          </p>
          <button
            onClick={() => setActiveTab('marketplace')}
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-colors cursor-pointer"
          >
            Open Market Directory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-6">
        <button onClick={() => setActiveTab('home')} className="hover:text-emerald-400 cursor-pointer">
          Index
        </button>
        <ChevronRight className="w-3 h-3 text-zinc-600" />
        <button onClick={() => setActiveTab('marketplace')} className="hover:text-emerald-400 cursor-pointer">
          Market
        </button>
        <ChevronRight className="w-3 h-3 text-zinc-600" />
        <span className="text-emerald-400">Escrow Settlement</span>
      </div>

      {/* Page Header */}
      <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#1d271d]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-mono font-bold text-white">
              ESCROW CHECKOUT GATEWAY
            </h1>
            <span className="text-xs font-mono text-emerald-400">USDT TRC-20</span>
          </div>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            Direct TRC-20 cryptographic settlement with automated license delivery after receipt confirmation.
          </p>
        </div>

        {currentOrder && (
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-[#070907] border border-[#243224] text-right">
              <span className="text-[10px] font-mono text-zinc-500 block uppercase">Active Escrow Ref</span>
              <span className="font-mono text-sm font-bold text-emerald-400">{currentOrder.orderNumber}</span>
            </div>
            <button
              onClick={() => setActiveTab('orders')}
              className="px-3 py-2 bg-[#0b0e0b] hover:bg-[#131a13] border border-[#222c22] text-xs font-mono text-zinc-300 transition-colors cursor-pointer"
            >
              Order Status
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-5 bg-[#070907] border border-[#1d271d]">
            <h3 className="font-mono font-bold text-sm text-zinc-200 mb-3 flex items-center justify-between">
              <span>SETTLEMENT CHANNEL</span>
              <span className="text-[11px] text-emerald-400 font-normal">USDT (TRC-20)</span>
            </h3>

            <label
              className={`flex items-center justify-between p-3 border transition-colors cursor-pointer ${
                paymentMethod === 'USDT_TRC20'
                  ? 'bg-[#0b100b] border-emerald-500/50 text-white'
                  : 'bg-[#040504] border-[#1a221a] text-zinc-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center font-mono font-bold text-emerald-400 text-xs">
                  ₮
                </div>
                <div>
                  <div className="font-mono font-bold text-xs text-zinc-100 flex items-center gap-2">
                    <span>USDT - Tether USD</span>
                    <span className="text-[10px] font-normal text-amber-400">TRC-20</span>
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    Encrypted Tron Network direct transfer
                  </div>
                </div>
              </div>
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === 'USDT_TRC20'}
                onChange={() => setPaymentMethod('USDT_TRC20')}
                className="w-4 h-4 accent-emerald-500"
              />
            </label>
          </div>

          {!currentOrder ? (
            <div className="p-5 bg-[#070907] border border-[#223022]">
              <h3 className="font-mono font-bold text-sm text-zinc-200 mb-3">
                ESCROW MANIFEST ({cart.length} PACKAGES)
              </h3>
              <div className="space-y-2 max-h-56 overflow-y-auto mb-4 pr-1">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-2.5 bg-[#040504] border border-[#1a221a] flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={item.product.image}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 object-cover bg-black border border-[#1d271d]"
                      />
                      <div className="truncate">
                        <span className="text-zinc-200 block truncate">{item.product.name}</span>
                        <span className="text-[10px] text-zinc-500 tabular-nums">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="text-emerald-400 font-bold ml-2 tabular-nums">
                      {(item.product.price * item.quantity).toLocaleString()} USDT
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-[#182018] flex justify-between items-center mb-4">
                <span className="text-xs font-mono text-zinc-400">Total Escrow Due:</span>
                <span className="font-mono font-bold text-xl text-emerald-400 tabular-nums">
                  {cartTotal.toLocaleString()} USDT
                </span>
              </div>

              <button
                onClick={handleInitiateOrder}
                disabled={isGeneratingOrder}
                className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isGeneratingOrder ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generating Escrow Order...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm &amp; Proceed to Settlement</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="p-5 bg-[#070907] border border-[#223022]">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#182018]">
                <h3 className="font-mono font-bold text-sm text-emerald-400">
                  ORDER MANIFEST
                </h3>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 border font-bold ${
                    currentOrder.status === 'Approved'
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-600/50'
                      : currentOrder.status === 'Proof Uploaded'
                      ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40'
                      : 'bg-amber-950/50 text-amber-300 border-amber-500/40'
                  }`}
                >
                  {currentOrder.status.toUpperCase()}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                {currentOrder.items.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center text-xs font-mono p-2 bg-[#040504] border border-[#1a221a]"
                  >
                    <span className="text-zinc-200 truncate">
                      {item.name} <span className="text-zinc-500">x{item.quantity}</span>
                    </span>
                    <span className="text-emerald-400 font-bold ml-2 tabular-nums">
                      {(item.price * item.quantity).toLocaleString()} USDT
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-[#040504] border border-[#1a221a] space-y-1.5 text-xs font-mono mb-4">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Order ID:</span>
                  <span className="text-emerald-400 font-bold">{currentOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Total Due:</span>
                  <span className="text-emerald-400 font-bold tabular-nums">{currentOrder.amount.toLocaleString()} USDT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Network:</span>
                  <span className="text-zinc-300">TRC-20 (Tron)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Account:</span>
                  <span className="text-zinc-400 truncate max-w-[200px]">{currentOrder.userEmail}</span>
                </div>
              </div>

              <div className="p-3.5 bg-[#090d09] border border-[#1d271d] text-xs font-mono text-zinc-300 space-y-2">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  <span>ESCROW PROTOCOL</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-zinc-400">
                  <li>Copy the TRC-20 deposit address or scan the QR matrix.</li>
                  <li>Transfer <strong className="text-zinc-200">{currentOrder.amount.toLocaleString()} USDT</strong> strictly on Tron TRC-20.</li>
                  <li>Capture transaction screenshot showing confirmed TXID hash.</li>
                  <li>Upload proof screenshot in the verification panel.</li>
                  <li>Receive instant package delivery and keys via verified relay bot.</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-6 space-y-6">
          <QRCodeDisplay
            address={depositAddress}
            amount={currentOrder?.amount || cartTotal}
            orderNumber={currentOrder?.orderNumber}
          />

          {/* Proof Upload */}
          <div className="p-5 bg-[#070907] border border-emerald-500/35 relative">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#182018]">
              <h3 className="font-mono font-bold text-sm text-zinc-100 flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-emerald-400" />
                <span>UPLOAD TXID SCREENSHOT PROOF</span>
              </h3>
              <span className="text-[10px] font-mono text-zinc-500">MAX 5 MB</span>
            </div>

            {currentOrder?.paymentProof || uploadSuccess ? (
              <div className="p-4 sm:p-5 bg-[#040504] border border-emerald-500/60 text-center space-y-4">
                <div className="w-11 h-11 bg-emerald-500/15 border border-emerald-400 flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-mono font-bold text-white text-base tracking-wide">
                    PAYMENT PROOF VERIFICATION QUEUED
                  </div>
                  <div className="font-mono text-xs text-emerald-400 mt-1">
                    Receipt Captured · Verification In Progress
                  </div>
                </div>

                {/* TELEGRAM BOT ACCESS PANEL */}
                <div className="p-4 bg-[#080c08] border border-emerald-500/60 text-left space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-emerald-500 flex items-center justify-center text-black font-bold flex-shrink-0">
                        <Send className="w-4 h-4 fill-black text-black" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase block tracking-wider">
                          Encrypted Delivery Bot · Instant Access
                        </span>
                        <span className="text-white font-mono font-bold text-sm sm:text-base">
                          @getfilex_bot
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText('@getfilex_bot');
                        setCopiedBot(true);
                        setTimeout(() => setCopiedBot(false), 2000);
                        addToast({
                          type: 'success',
                          title: 'Copied to Clipboard',
                          message: '@getfilex_bot copied! Open Telegram to start the bot.'
                        });
                      }}
                      className="px-2.5 py-1.5 bg-[#040504] hover:bg-[#111711] border border-[#243224] text-emerald-400 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer flex-shrink-0"
                      title="Copy bot username"
                    >
                      {copiedBot ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedBot ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    Aapka payment proof upload ho chuka hai! Product files, setup bundle aur access key lene ke liye abhi niche diye gaye Telegram bot par click karein:
                  </p>

                  <a
                    href="https://t.me/getfilex_bot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer no-underline"
                  >
                    <Send className="w-4 h-4 fill-black text-black" />
                    <span>Open Telegram Bot (@getfilex_bot)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-2 border-t border-[#182018]">
                    <span>Relay Bot URL:</span>
                    <a
                      href="https://t.me/getfilex_bot"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 underline hover:text-emerald-300"
                    >
                      https://t.me/getfilex_bot
                    </a>
                  </div>
                </div>

                {(currentOrder?.paymentProof || selectedFile) && (
                  <div className="mt-3 p-3 bg-[#070907] border border-[#1a221a] text-left font-mono text-xs space-y-1">
                    <div className="text-zinc-400 flex justify-between">
                      <span>Uploaded File:</span>
                      <span className="text-emerald-400 truncate max-w-[200px]">
                        {currentOrder?.paymentProof?.fileName || selectedFile?.fileName}
                      </span>
                    </div>
                    <div className="text-zinc-400 flex justify-between">
                      <span>File Size:</span>
                      <span className="text-zinc-300 tabular-nums">
                        {Math.round(((currentOrder?.paymentProof?.fileSize || selectedFile?.fileSize || 0) / 1024))} KB
                      </span>
                    </div>
                    <div className="text-zinc-400 flex justify-between">
                      <span>Status:</span>
                      <span className="text-emerald-400 font-bold">Proof Received</span>
                    </div>

                    {(currentOrder?.paymentProof?.fileData || selectedFile?.fileData) && (
                      <div className="mt-2 pt-2 border-t border-[#182018]">
                        <span className="text-[10px] text-zinc-500 block mb-1">SCREENSHOT PREVIEW:</span>
                        <div className="max-h-40 overflow-hidden border border-[#222e22] bg-black">
                          <img
                            src={currentOrder?.paymentProof?.fileData || selectedFile?.fileData}
                            alt="Payment Proof"
                            className="w-full h-auto object-contain"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="w-full py-2.5 bg-[#0c100c] hover:bg-[#141c14] border border-[#222e22] text-zinc-200 font-mono text-xs transition-colors cursor-pointer"
                  >
                    View Order Timeline &amp; Status
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border border-dashed p-6 text-center transition-colors cursor-pointer ${
                    isDragOver
                      ? 'border-emerald-400 bg-emerald-950/20'
                      : 'border-[#273627] hover:border-emerald-500/60 bg-[#040504]'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileChange(e.target.files[0]);
                      }
                    }}
                  />

                  <div className="w-11 h-11 bg-[#0a0f0a] border border-emerald-500/30 flex items-center justify-center mx-auto mb-3 text-emerald-400">
                    <FileImage className="w-5 h-5" />
                  </div>

                  <p className="text-xs font-mono font-semibold text-zinc-200">
                    {selectedFile ? selectedFile.fileName : 'Drop transaction screenshot here or browse'}
                  </p>
                  <p className="text-[11px] font-mono text-zinc-500 mt-1">
                    PNG, JPG, JPEG up to 5MB
                  </p>
                </div>

                {selectedFile && (
                  <div className="p-3 bg-[#040504] border border-emerald-500/30 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-400">Selected File:</span>
                      <span className="text-emerald-400 font-bold truncate max-w-[200px]">
                        {selectedFile.fileName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-400">Size:</span>
                      <span className="text-zinc-300 tabular-nums">
                        {(selectedFile.fileSize / 1024).toFixed(1)} KB
                      </span>
                    </div>

                    <div className="mt-2 overflow-hidden max-h-36 border border-[#1f291f] bg-black">
                      <img
                        src={selectedFile.fileData}
                        alt="Selected Preview"
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={handleSubmitProof}
                  disabled={!selectedFile || isUploading || !currentOrder}
                  className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Submitting Payment Proof...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      <span>Submit Proof for Verification</span>
                    </>
                  )}
                </button>

                {!currentOrder && (
                  <p className="text-[11px] font-mono text-amber-400 text-center">
                    * Generate an escrow order reference on the left before uploading proof.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
