import React, { useState } from 'react';
import { Copy, Check, QrCode, Maximize2, X, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useMarket } from '../context/MarketContext';

interface QRCodeDisplayProps {
  address: string;
  network?: string;
  amount?: number;
  orderNumber?: string;
}

const PAYMENT_SCANNER_SRC = '/assets/aistudio/photo_2026-11-26_03-16-12_ce354d79.jpg';

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  address,
  network = 'Tron TRC-20',
  amount,
  orderNumber
}) => {
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { addToast } = useMarket();

  const handleCopy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    addToast({
      type: 'info',
      title: 'Wallet Address Copied',
      message: `${network} USDT settlement address copied to clipboard.`
    });
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-[#11161D] border border-[#1E2936] rounded-xl p-5">
      <div className="flex items-center justify-between pb-3 border-b border-[#1E2936]">
        <div className="flex items-center gap-2">
          <QrCode className="w-4 h-4 text-[#00D69A]" />
          <span className="text-sm font-bold text-[#F4F7F6]">USDT TRC-20 Payment Scanner</span>
        </div>
        <span className="text-[11px] font-mono text-[#0EA5A4] font-semibold uppercase flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#00D69A]" />
          {network}
        </span>
      </div>

      <div className="mt-4 flex flex-col items-center">
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="group relative p-2.5 rounded-2xl bg-white border-2 border-[#00D69A]/70 shadow-[0_18px_40px_-14px_rgba(0,214,154,0.35)] w-[228px] h-[228px] flex items-center justify-center overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
          aria-label="Enlarge payment scanner QR code"
        >
          <img
            src={PAYMENT_SCANNER_SRC}
            alt="Official USDT TRC-20 Payment Scanner QR Code"
            className="w-full h-full object-contain rounded-lg"
          />
        </button>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="mt-2.5 text-xs text-[#8F9CA8] hover:text-[#00D69A] flex items-center gap-1.5 transition-colors cursor-pointer py-1 font-mono"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Expand Payment Scanner</span>
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {amount !== undefined && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#0D1116] border border-[#1E2936]">
            <span className="text-xs text-[#8F9CA8]">Exact Amount Due</span>
            <span className="font-mono font-bold text-base text-[#00D69A] tabular-nums">
              {amount.toLocaleString()} USDT
            </span>
          </div>
        )}

        {orderNumber && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#0D1116] border border-[#1E2936]">
            <span className="text-xs text-[#8F9CA8]">Order Reference</span>
            <span className="font-mono text-xs font-semibold text-[#E5B84B]">{orderNumber}</span>
          </div>
        )}

        <div>
          <label className="block text-xs text-[#8F9CA8] mb-1.5">
            Merchant Settlement Address ({network})
          </label>
          <div className="flex items-center gap-2 rounded-lg bg-[#0D1116] border border-[#1E2936] p-2.5">
            <code className="text-xs font-mono text-[#00D69A] break-all select-all flex-1">
              {address || 'Fetching merchant settlement address...'}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!address}
              className={`px-2.5 py-1.5 rounded-md font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                copied
                  ? 'bg-[#00D69A] text-[#07090B] font-bold'
                  : 'bg-[#11161D] text-[#00D69A] hover:bg-[#00D69A]/15 border border-[#1E2936]'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#0D1116] border border-[#E5B84B]/35 flex items-start gap-2.5 text-[11px] text-[#E5B84B]">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Scan the official USDT ({network}) scanner above or copy the settlement address. Transfers on ERC-20, BEP-20, or other chains cannot be recovered.
          </span>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#11161D] border border-[#1E2936] rounded-xl max-w-sm w-full p-6 relative shadow-2xl">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 p-1.5 rounded-lg text-[#8F9CA8] hover:text-[#F4F7F6] hover:bg-[#0D1116] cursor-pointer"
              aria-label="Close scanner modal"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-bold text-[#F4F7F6] text-center mb-1">
              Official USDT ({network}) Scanner
            </h3>
            <p className="text-xs text-[#8F9CA8] text-center mb-4">
              Scan directly from Binance, Trust Wallet, TronLink, or any {network} wallet
            </p>

            <div className="p-3 rounded-2xl bg-white border-2 border-[#00D69A] w-[264px] h-[264px] mx-auto flex items-center justify-center overflow-hidden shadow-2xl">
              <img
                src={PAYMENT_SCANNER_SRC}
                alt="Expanded USDT TRC-20 Payment Scanner QR"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>

            <div className="mt-4 text-center">
              {amount !== undefined && (
                <div className="mb-2 font-mono text-sm font-bold text-[#00D69A] tabular-nums">
                  Amount Due: {amount.toLocaleString()} USDT
                </div>
              )}
              {address && (
                <code className="text-xs font-mono text-[#D1D9E0] break-all block mb-3">
                  {address}
                </code>
              )}
              <button
                type="button"
                onClick={handleCopy}
                disabled={!address}
                className="w-full py-2.5 px-4 rounded-lg bg-[#00D69A] hover:bg-[#0EA5A4] text-[#07090B] font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-40"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Address Copied' : 'Copy Wallet Address'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
