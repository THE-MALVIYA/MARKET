import React, { useState } from 'react';
import { Copy, Check, QrCode, Maximize2, X, Shield, AlertTriangle } from 'lucide-react';
import { useMarket } from '../context/MarketContext';

interface QRCodeDisplayProps {
  address: string;
  amount?: number;
  orderNumber?: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  address = 'TL9sU4A1ydN9AT2LTaC7P94K4y4BdAgDFx',
  amount,
  orderNumber
}) => {
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { addToast } = useMarket();

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    addToast({
      type: 'info',
      title: 'Address Copied',
      message: 'USDT (TRC-20) address copied to clipboard.'
    });
    setTimeout(() => setCopied(false), 2500);
  };

  // High-fidelity SVG QR Code with matrix modules and cyber lock centerpiece
  const renderSvgQr = (size = 220) => (
    <div className="relative p-3 bg-black/80 rounded-xl border border-cyan-500/40 shadow-inner group">
      {/* Corner brackets */}
      <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
      <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
      <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
      <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />

      {/* Cyber scanline over QR */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl" />

      <svg
        width={size}
        height={size}
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mx-auto rounded"
      >
        <rect width="240" height="240" fill="#06090e" />

        {/* Top-Left Target */}
        <rect x="20" y="20" width="50" height="50" rx="6" stroke="#00f0ff" strokeWidth="6" fill="none" />
        <rect x="35" y="35" width="20" height="20" rx="3" fill="#00f0ff" />

        {/* Top-Right Target */}
        <rect x="170" y="20" width="50" height="50" rx="6" stroke="#00f0ff" strokeWidth="6" fill="none" />
        <rect x="185" y="35" width="20" height="20" rx="3" fill="#00f0ff" />

        {/* Bottom-Left Target */}
        <rect x="20" y="170" width="50" height="50" rx="6" stroke="#00f0ff" strokeWidth="6" fill="none" />
        <rect x="35" y="185" width="20" height="20" rx="3" fill="#00f0ff" />

        {/* Synthetic QR Code Data Matrix Blocks */}
        {/* Row 1-4 */}
        <rect x="85" y="25" width="10" height="10" fill="#38bdf8" />
        <rect x="105" y="25" width="10" height="10" fill="#38bdf8" />
        <rect x="125" y="25" width="10" height="10" fill="#38bdf8" />
        <rect x="145" y="25" width="10" height="10" fill="#38bdf8" />

        <rect x="85" y="45" width="10" height="10" fill="#00ff66" opacity="0.8" />
        <rect x="115" y="45" width="10" height="10" fill="#38bdf8" />
        <rect x="135" y="45" width="10" height="10" fill="#38bdf8" />

        <rect x="85" y="60" width="20" height="10" fill="#38bdf8" />
        <rect x="120" y="60" width="10" height="10" fill="#38bdf8" />
        <rect x="145" y="60" width="10" height="10" fill="#38bdf8" />

        {/* Middle Matrix */}
        <rect x="25" y="85" width="10" height="10" fill="#38bdf8" />
        <rect x="45" y="85" width="10" height="10" fill="#38bdf8" />
        <rect x="60" y="95" width="10" height="10" fill="#38bdf8" />
        <rect x="175" y="85" width="10" height="10" fill="#38bdf8" />
        <rect x="205" y="85" width="10" height="10" fill="#38bdf8" />

        <rect x="25" y="110" width="10" height="10" fill="#38bdf8" />
        <rect x="45" y="125" width="10" height="10" fill="#38bdf8" />
        <rect x="60" y="140" width="10" height="10" fill="#38bdf8" />
        <rect x="175" y="115" width="20" height="10" fill="#38bdf8" />
        <rect x="175" y="135" width="10" height="10" fill="#38bdf8" />
        <rect x="205" y="135" width="10" height="10" fill="#38bdf8" />

        {/* Bottom matrix */}
        <rect x="85" y="170" width="10" height="10" fill="#38bdf8" />
        <rect x="105" y="170" width="20" height="10" fill="#38bdf8" />
        <rect x="135" y="170" width="10" height="10" fill="#38bdf8" />
        <rect x="155" y="170" width="10" height="10" fill="#38bdf8" />

        <rect x="85" y="190" width="20" height="10" fill="#38bdf8" />
        <rect x="120" y="190" width="10" height="10" fill="#00ff66" opacity="0.9" />
        <rect x="145" y="190" width="20" height="10" fill="#38bdf8" />

        <rect x="105" y="210" width="10" height="10" fill="#38bdf8" />
        <rect x="135" y="210" width="10" height="10" fill="#38bdf8" />
        <rect x="165" y="210" width="10" height="10" fill="#38bdf8" />
        <rect x="190" y="200" width="20" height="10" fill="#38bdf8" />

        {/* Center Cyber Shield Badge */}
        <rect x="92" y="92" width="56" height="56" rx="8" fill="#04070c" stroke="#00f0ff" strokeWidth="3" />
        <circle cx="120" cy="120" r="18" fill="#00f0ff" fillOpacity="0.15" />
        <text
          x="120"
          y="124"
          textAnchor="middle"
          fill="#00f0ff"
          fontFamily="monospace"
          fontSize="11"
          fontWeight="bold"
        >
          USDT
        </text>
        <text
          x="120"
          y="135"
          textAnchor="middle"
          fill="#38bdf8"
          fontFamily="monospace"
          fontSize="7"
        >
          TRC20
        </text>
      </svg>
    </div>
  );

  return (
    <div className="bg-[#090d14]/90 border border-cyan-500/30 rounded-xl p-5 backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <QrCode className="w-5 h-5 text-cyan-400" />
          <span className="font-mono text-sm font-semibold text-slate-200">USDT SETTLEMENT GATEWAY</span>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 font-semibold">
          TRC-20 NETWORK
        </span>
      </div>

      <div className="mt-4 flex flex-col items-center">
        {renderSvgQr(200)}

        <button
          onClick={() => setShowModal(true)}
          className="mt-2 text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors cursor-pointer py-1"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Expand QR Code</span>
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {amount !== undefined && (
          <div className="flex items-center justify-between p-2.5 rounded bg-black/60 border border-slate-800">
            <span className="text-xs text-slate-400">Total Amount:</span>
            <span className="font-mono font-bold text-base text-emerald-400">{amount} USDT</span>
          </div>
        )}

        {orderNumber && (
          <div className="flex items-center justify-between p-2.5 rounded bg-black/60 border border-slate-800">
            <span className="text-xs text-slate-400">Order Reference:</span>
            <span className="font-mono text-xs font-semibold text-cyan-300">{orderNumber}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">
            USDT (TRC-20) Settlement Address:
          </label>
          <div className="flex items-center gap-2 bg-black/70 border border-cyan-500/30 rounded-lg p-2 focus-within:border-cyan-400 transition-colors">
            <code className="text-xs font-mono text-cyan-300 break-all select-all flex-1">
              {address}
            </code>
            <button
              onClick={handleCopy}
              className={`p-2 rounded font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Network Transfer Notice */}
        <div className="p-2.5 rounded-lg bg-cyan-950/20 border border-cyan-500/30 flex items-start gap-2 text-[11px] text-cyan-300/90">
          <AlertTriangle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <span>
            <strong>IMPORTANT:</strong> Send USDT strictly on the Tron TRC-20 network. Once the transaction is completed on your wallet, upload your transaction receipt screenshot.
          </span>
        </div>
      </div>

      {/* Expanded Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#090e17] border border-cyan-500/50 rounded-2xl max-w-sm w-full p-6 relative cyber-border-glow">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-mono font-bold text-slate-100 text-center mb-1">
              USDT TRC-20 PAYMENT QR
            </h3>
            <p className="text-xs text-slate-400 text-center mb-4">
              Scan using any TRC-20 compatible cryptocurrency wallet
            </p>

            {renderSvgQr(260)}

            <div className="mt-4 text-center">
              <code className="text-xs font-mono text-cyan-400 break-all block mb-3">
                {address}
              </code>
              <button
                onClick={handleCopy}
                className="w-full py-2 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold font-mono text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Address Copied!' : 'Copy Payment Address'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
