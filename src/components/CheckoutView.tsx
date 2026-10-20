import React, { useState, useRef } from 'react';
import { useMarket } from '../context/MarketContext';
import { QRCodeDisplay } from './QRCodeDisplay';
import {
  UploadCloud,
  FileImage,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Eye,
  Info,
  Layers,
  ChevronRight,
  Send,
  Copy,
  Check,
  ExternalLink,
  MessageSquare
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
    setActiveOrderNumber,
    addToast
  } = useMarket();

  const [paymentMethod, setPaymentMethod] = useState<'USDT_TRC20'>('USDT_TRC20');
  const [isGeneratingOrder, setIsGeneratingOrder] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  // File upload state
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

  // Find active order if existing
  const currentOrder = activeOrderNumber
    ? orders.find((o) => o.orderNumber === activeOrderNumber) || createdOrder
    : createdOrder;

  const depositAddress = 'TL9sU4A1ydN9AT2LTaC7P94K4y4BdAgDFx';

  // Trigger order creation if user hasn't generated one yet
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

  // Handle file selection
  const handleFileChange = (file: File) => {
    // 5MB limit
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

  // Submit proof
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
          colors: ['#00f0ff', '#00ff66', '#b026ff']
        });
      } catch (e) {
        // ignore
      }
    }
  };

  // If no active order and cart is empty
  if (!currentOrder && cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center font-mono">
        <div className="p-8 rounded-2xl bg-[#090d16] border border-slate-800">
          <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white mb-2">NO ACTIVE CHECKOUT SESSION</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
            You do not have any pending items in your cart to checkout.
          </p>
          <button
            onClick={() => setActiveTab('marketplace')}
            className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-colors cursor-pointer"
          >
            BROWSE PRODUCT CATALOG
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      {/* Checkout Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-6">
        <button onClick={() => setActiveTab('home')} className="hover:text-cyan-300">
          Home
        </button>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <button onClick={() => setActiveTab('marketplace')} className="hover:text-cyan-300">
          Marketplace
        </button>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <span className="text-cyan-400">Checkout & Payment Settlement</span>
      </div>

      {/* Page Header */}
      <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-mono font-extrabold text-white flex items-center gap-2.5">
            <span>CHECKOUT GATEWAY</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 font-semibold">
              USDT TRC-20
            </span>
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Direct cryptocurrency settlement via USDT TRC-20 with automated license provisioning upon verification.
          </p>
        </div>

        {currentOrder && (
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-lg bg-black/60 border border-cyan-500/30 text-right">
              <span className="text-[10px] font-mono text-slate-500 block uppercase">Active Order Ref</span>
              <span className="font-mono text-sm font-bold text-cyan-300">{currentOrder.orderNumber}</span>
            </div>
            <button
              onClick={() => setActiveTab('orders')}
              className="px-3 py-1.5 rounded-lg bg-[#0e1422] hover:bg-[#162036] border border-slate-800 text-xs font-mono text-slate-300 transition-colors cursor-pointer"
            >
              View Order Status
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Order Summary & Payment Method Selector */}
        <div className="lg:col-span-6 space-y-6">
          {/* Payment Method Selector */}
          <div className="p-5 rounded-2xl bg-[#090d16] border border-slate-800">
            <h3 className="font-mono font-bold text-sm text-slate-200 mb-3 flex items-center justify-between">
              <span>SELECT PAYMENT METHOD</span>
              <span className="text-[11px] text-emerald-400 font-normal">USDT (TRC-20)</span>
            </h3>

            <div className="space-y-2">
              <label
                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                  paymentMethod === 'USDT_TRC20'
                    ? 'bg-cyan-950/20 border-cyan-500/50 text-white'
                    : 'bg-black/40 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-mono font-bold text-emerald-400 text-xs">
                    ₮
                  </div>
                  <div>
                    <div className="font-mono font-bold text-xs text-slate-100 flex items-center gap-2">
                      <span>[ USDT - Tether USD ]</span>
                      <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300">
                        TRC20
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Direct fast transfer on Tron Network (TRC-20)
                    </div>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'USDT_TRC20'}
                  onChange={() => setPaymentMethod('USDT_TRC20')}
                  className="w-4 h-4 accent-cyan-500"
                />
              </label>
            </div>
          </div>

          {/* If order not yet created, show Cart Summary with "GENERATE ORDER" button */}
          {!currentOrder ? (
            <div className="p-5 rounded-2xl bg-[#090d16] border border-cyan-500/30">
              <h3 className="font-mono font-bold text-sm text-slate-200 mb-3">
                ORDER SUMMARY ({cart.length} ITEMS)
              </h3>
              <div className="space-y-2.5 max-h-56 overflow-y-auto mb-4 pr-1">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-2.5 rounded-lg bg-black/50 border border-slate-800 flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={item.product.image}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded object-cover bg-black"
                      />
                      <div className="truncate">
                        <span className="text-slate-200 block truncate">{item.product.name}</span>
                        <span className="text-[10px] text-slate-500">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="text-emerald-400 font-bold ml-2">
                      {item.product.price * item.quantity} USDT
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center mb-4">
                <span className="text-xs font-mono text-slate-400">Total Amount:</span>
                <span className="font-mono font-extrabold text-xl text-emerald-400">
                  {cartTotal} USDT
                </span>
              </div>

              <button
                onClick={handleInitiateOrder}
                disabled={isGeneratingOrder}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-black font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/25 cursor-pointer disabled:opacity-50"
              >
                {isGeneratingOrder ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>GENERATING ORDER REFERENCE...</span>
                  </>
                ) : (
                  <>
                    <span>CONFIRM & PROCEED TO SETTLEMENT</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Created order details card */
            <div className="p-5 rounded-2xl bg-[#090d16] border border-cyan-500/30">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                <h3 className="font-mono font-bold text-sm text-cyan-300">
                  ORDER MANIFEST
                </h3>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    currentOrder.status === 'Approved'
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700'
                      : currentOrder.status === 'Proof Uploaded'
                      ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700'
                      : 'bg-yellow-950/80 text-yellow-300 border border-yellow-700'
                  }`}
                >
                  {currentOrder.status.toUpperCase()}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                {currentOrder.items.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center text-xs font-mono p-2 rounded bg-black/40 border border-slate-800"
                  >
                    <span className="text-slate-300 truncate">
                      {item.name} <span className="text-slate-500">x{item.quantity}</span>
                    </span>
                    <span className="text-emerald-400 font-bold ml-2">
                      {item.price * item.quantity} USDT
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-black/60 border border-slate-800 space-y-1.5 text-xs font-mono mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">Order ID:</span>
                  <span className="text-cyan-300 font-bold">{currentOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Due:</span>
                  <span className="text-emerald-400 font-extrabold">{currentOrder.amount} USDT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Network:</span>
                  <span className="text-slate-300">TRC-20 (Tron Network)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Account:</span>
                  <span className="text-slate-400 truncate max-w-[200px]">{currentOrder.userEmail}</span>
                </div>
              </div>

              {/* Instructions checklist */}
              <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs font-mono text-slate-300 space-y-2">
                <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  <span>PAYMENT INSTRUCTIONS</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400">
                  <li>Copy the USDT TRC-20 address or scan the QR code.</li>
                  <li>Transfer <strong>{currentOrder.amount} USDT</strong> from your TRC-20 wallet.</li>
                  <li>Capture a screenshot of your transaction confirmation with TXID.</li>
                  <li>Upload the screenshot proof in the verification panel on the right.</li>
                  <li>Verification system confirms transaction and completes provisioning.</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: QR Code + Payment Proof Upload */}
        <div className="lg:col-span-6 space-y-6">
          {/* QR Code Component */}
          <QRCodeDisplay
            address={depositAddress}
            amount={currentOrder?.amount || cartTotal}
            orderNumber={currentOrder?.orderNumber}
          />

          {/* Payment Proof Upload Section */}
          <div className="p-5 rounded-2xl bg-[#090d16] border border-cyan-500/40 relative cyber-glow-cyan">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <h3 className="font-mono font-bold text-sm text-slate-100 flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-cyan-400" />
                <span>UPLOAD PAYMENT SCREENSHOT</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-500">MAX 5 MB (PNG, JPG, JPEG)</span>
            </div>

            {/* If proof is already uploaded or verified */}
            {currentOrder?.paymentProof || uploadSuccess ? (
              <div className="p-4 sm:p-5 rounded-xl bg-[#081220] border-2 border-cyan-400 shadow-2xl shadow-cyan-950/60 text-center space-y-4 animate-in fade-in duration-300">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-mono font-extrabold text-white text-base tracking-wide flex items-center justify-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>PAYMENT PROOF SUBMITTED!</span>
                  </div>
                  <div className="font-mono text-xs text-cyan-300 font-semibold mt-1">
                    Receipt Captured & Verification In Progress
                  </div>
                </div>

                {/* TELEGRAM BOT ACCESS PANEL - REQUESTED BY USER */}
                <div className="p-4 rounded-xl bg-gradient-to-b from-[#0b1c2e] to-[#06121d] border-2 border-cyan-400 text-left space-y-3 shadow-lg shadow-cyan-950/40">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center text-black font-bold flex-shrink-0 shadow-md shadow-cyan-500/30">
                        <Send className="w-4 h-4 fill-black text-black" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase block tracking-wider">
                          OFFICIAL DELIVERY BOT // INSTANT ACCESS
                        </span>
                        <span className="text-white font-mono font-extrabold text-sm sm:text-base">
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
                      className="px-2.5 py-1.5 rounded-lg bg-black/60 hover:bg-black/90 border border-cyan-500/40 text-cyan-300 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer flex-shrink-0"
                      title="Copy bot username"
                    >
                      {copiedBot ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedBot ? 'COPIED' : 'COPY'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-200 font-sans leading-relaxed">
                    Aapka payment proof upload ho chuka hai! Product files, setup bundle aur access key lene ke liye abhi niche diye gaye Telegram bot par click karein:
                  </p>

                  <a
                    href="https://t.me/getfilex_bot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-black font-mono font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 transition-all transform hover:-translate-y-0.5 cursor-pointer no-underline block text-center"
                  >
                    <Send className="w-4 h-4 fill-black text-black" />
                    <span>OPEN TELEGRAM BOT (@getfilex_bot)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <div className="flex items-center justify-between text-[11px] font-mono text-cyan-300/90 pt-1 border-t border-cyan-900/40">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Bot Link:</span>
                    </span>
                    <a
                      href="https://t.me/getfilex_bot"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 underline hover:text-cyan-200"
                    >
                      https://t.me/getfilex_bot
                    </a>
                  </div>
                </div>

                {/* Proof Details Preview */}
                {(currentOrder?.paymentProof || selectedFile) && (
                  <div className="mt-3 p-3 rounded-lg bg-black/60 border border-slate-800 text-left font-mono text-xs space-y-1">
                    <div className="text-slate-400 flex justify-between">
                      <span>Uploaded File:</span>
                      <span className="text-cyan-300 truncate max-w-[200px]">
                        {currentOrder?.paymentProof?.fileName || selectedFile?.fileName}
                      </span>
                    </div>
                    <div className="text-slate-400 flex justify-between">
                      <span>File Size:</span>
                      <span className="text-slate-300">
                        {Math.round(((currentOrder?.paymentProof?.fileSize || selectedFile?.fileSize || 0) / 1024))} KB
                      </span>
                    </div>
                    <div className="text-slate-400 flex justify-between">
                      <span>Verification Status:</span>
                      <span className="text-emerald-400 font-bold">Proof Received</span>
                    </div>

                    {/* Screenshot thumbnail */}
                    {(currentOrder?.paymentProof?.fileData || selectedFile?.fileData) && (
                      <div className="mt-2 pt-2 border-t border-slate-800">
                        <span className="text-[10px] text-slate-500 block mb-1">SCREENSHOT PREVIEW:</span>
                        <div className="max-h-40 rounded-lg overflow-hidden border border-slate-700 bg-black">
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
                    className="w-full py-2.5 rounded-lg bg-[#0e1726] hover:bg-[#15233a] border border-slate-700 text-slate-200 font-mono text-xs transition-colors cursor-pointer"
                  >
                    View Order Timeline & Status
                  </button>
                </div>
              </div>
            ) : (
              /* Drag & Drop Upload Form */
              <div className="space-y-4">
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                    isDragOver
                      ? 'border-cyan-400 bg-cyan-950/30'
                      : 'border-slate-800 hover:border-cyan-500/40 bg-black/40'
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

                  <div className="w-12 h-12 rounded-full bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center mx-auto mb-3 text-cyan-400">
                    <FileImage className="w-6 h-6" />
                  </div>

                  <p className="text-xs font-mono font-semibold text-slate-200">
                    {selectedFile ? selectedFile.fileName : 'Drag & drop transaction screenshot, or click to browse'}
                  </p>
                  <p className="text-[11px] font-mono text-slate-500 mt-1">
                    Accepts PNG, JPG, JPEG (Max 5MB)
                  </p>
                </div>

                {/* Selected File Preview Box */}
                {selectedFile && (
                  <div className="p-3 rounded-xl bg-black/60 border border-cyan-500/30 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">File Selected:</span>
                      <span className="text-cyan-300 font-bold truncate max-w-[200px]">
                        {selectedFile.fileName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">Size:</span>
                      <span className="text-slate-300">
                        {(selectedFile.fileSize / 1024).toFixed(1)} KB
                      </span>
                    </div>

                    {/* Thumbnail preview */}
                    <div className="mt-2 rounded-lg overflow-hidden max-h-36 border border-slate-800 bg-black">
                      <img
                        src={selectedFile.fileData}
                        alt="Selected Preview"
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <button
                  onClick={handleSubmitProof}
                  disabled={!selectedFile || isUploading || !currentOrder}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>SUBMITTING PAYMENT PROOF...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      <span>SUBMIT PROOF FOR VERIFICATION</span>
                    </>
                  )}
                </button>

                {!currentOrder && (
                  <p className="text-[11px] font-mono text-yellow-400 text-center">
                    * Generate an order reference above before submitting payment proof.
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
